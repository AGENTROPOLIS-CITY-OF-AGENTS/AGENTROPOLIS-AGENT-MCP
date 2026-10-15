#!/usr/bin/env node
import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import path from 'node:path';

const BASE = (process.env.AGENTWIKIS_URL || 'https://agentwikis.com').replace(/\/$/, '');
const API_KEY = (process.env.AGENTWIKIS_API_KEY || '').trim();
const DEST = path.resolve(
  (process.env.AGENTWIKIS_MIRROR_DIR || path.join(homedir(), '.agentropolis', 'wikivault', 'quarantine', 'agentwikis'))
    .replace(/^~(?=$|\/)/, homedir())
);
const CONCURRENCY = Math.max(1, Math.min(16, Number(process.env.AGENTWIKIS_SYNC_CONCURRENCY || 6)));
const TIMEOUT_MS = Math.max(5_000, Number(process.env.AGENTWIKIS_SYNC_TIMEOUT_MS || 30_000));
const REQUIRE_PRO = process.env.AGENTWIKIS_REQUIRE_PRO !== '0';
const SYNC_SKILLS = process.env.AGENTWIKIS_SYNC_SKILLS !== '0';
const MAX_DOC_BYTES = Math.max(64 * 1024, Number(process.env.AGENTWIKIS_MAX_DOC_BYTES || 8 * 1024 * 1024));
const MAX_BUNDLE_BYTES = Math.max(1024 * 1024, Number(process.env.AGENTWIKIS_MAX_BUNDLE_BYTES || 128 * 1024 * 1024));
const USER_AGENT = 'agentropolis-wikivault-agentwikis-sync/1.0';

const STATE_PATH = path.join(DEST, '.sync-state.json');
const RECEIPT_PATH = path.join(DEST, 'receipts', 'sync-receipts.jsonl');

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function cleanRelative(input) {
  const normalized = String(input || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = normalized.split('/').filter(Boolean);
  if (!parts.length || parts.some((p) => p === '..' || p === '.')) {
    throw new Error(`Unsafe relative path: ${input}`);
  }
  return parts.join('/');
}

function rawUrlFor(slug, docPath) {
  const p = String(docPath || '').replace(/\\/g, '/');
  if (p.startsWith('/raw/')) return BASE + p;
  if (p.startsWith('raw/')) return `${BASE}/${p}`;
  return `${BASE}/raw/${encodeURIComponent(slug)}/${cleanRelative(p)}`;
}

function collectDocuments(node, inheritedGated = false, out = new Map()) {
  if (Array.isArray(node)) {
    for (const item of node) collectDocuments(item, inheritedGated, out);
    return out;
  }
  if (!node || typeof node !== 'object') return out;

  const gated = inheritedGated || node.gated === true || node.pro === true || node.tier === 'xl';
  if (typeof node.path === 'string' && node.path.endsWith('.md')) {
    const p = cleanRelative(node.path);
    const existing = out.get(p);
    out.set(p, {
      path: p,
      title: typeof node.title === 'string' ? node.title : existing?.title || null,
      gated: Boolean(gated || existing?.gated),
    });
  }

  for (const value of Object.values(node)) collectDocuments(value, gated, out);
  return out;
}

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf8'));
  } catch {
    return { version: 1, resources: {} };
  }
}

async function atomicWrite(target, data) {
  await mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp-${process.pid}`;
  await writeFile(tmp, data);
  await rename(tmp, target);
}

function headersFor(stateEntry, accept = '*/*') {
  const headers = { 'User-Agent': USER_AGENT, Accept: accept };
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;
  if (stateEntry?.etag) headers['If-None-Match'] = stateEntry.etag;
  if (stateEntry?.lastModified) headers['If-Modified-Since'] = stateEntry.lastModified;
  return headers;
}

async function fetchResource(url, { state, relativePath, maxBytes, accept = '*/*', binary = true, conditional = true }) {
  const prior = conditional ? state.resources[url] : null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      headers: headersFor(prior, accept),
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 304) {
    return { status: 'not-modified', url, relativePath, sha256: prior?.sha256 || null };
  }
  if (res.status === 402) {
    throw new Error(`Pro entitlement rejected for ${new URL(url).pathname}. Rotate/check AGENTWIKIS_API_KEY.`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${new URL(url).pathname}`);

  const declared = Number(res.headers.get('content-length') || 0);
  if (declared && declared > maxBytes) {
    throw new Error(`Refusing oversized response (${declared} bytes) for ${new URL(url).pathname}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > maxBytes) {
    throw new Error(`Refusing oversized response (${buf.length} bytes) for ${new URL(url).pathname}`);
  }

  const digest = sha256(buf);
  const target = path.join(DEST, relativePath);
  await atomicWrite(target, binary ? buf : buf.toString('utf8'));

  state.resources[url] = {
    relativePath,
    sha256: digest,
    bytes: buf.length,
    etag: res.headers.get('etag') || null,
    lastModified: res.headers.get('last-modified') || null,
    contentType: res.headers.get('content-type') || null,
    observedAt: new Date().toISOString(),
  };

  return { status: prior?.sha256 === digest ? 'same-content' : 'updated', url, relativePath, sha256: digest, bytes: buf.length };
}

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      headers: headersFor(null, 'application/json'),
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 402) throw new Error(`Pro entitlement rejected for ${new URL(url).pathname}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${new URL(url).pathname}`);
  return res.json();
}

async function mapLimit(items, limit, fn) {
  let cursor = 0;
  const results = new Array(items.length);
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        results[i] = await fn(items[i], i);
      } catch (error) {
        results[i] = { status: 'error', error: String(error?.message || error), item: items[i] };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function summarize(results) {
  const counts = {};
  for (const r of results) counts[r?.status || 'unknown'] = (counts[r?.status || 'unknown'] || 0) + 1;
  return counts;
}

async function mirrorRegistry(state) {
  const registryTargets = [
    ['/index.json', 'registry/index.json', 'application/json'],
    ['/llms.txt', 'registry/llms.txt', 'text/plain'],
    ['/llms-full.txt', 'registry/llms-full.txt', 'text/plain'],
    ['/sitemap.xml', 'registry/sitemap.xml', 'application/xml,text/xml'],
    ['/robots.txt', 'registry/robots.txt', 'text/plain'],
  ];
  return mapLimit(registryTargets, 3, ([suffix, relativePath, accept]) =>
    fetchResource(`${BASE}${suffix}`, {
      state,
      relativePath,
      maxBytes: suffix === '/llms-full.txt' ? 64 * 1024 * 1024 : MAX_DOC_BYTES,
      accept,
      binary: false,
    })
  );
}

async function mirrorWiki(slug, state) {
  const open = await getJson(`${BASE}/api/wiki/${encodeURIComponent(slug)}/open`);
  const docs = [...collectDocuments(open?.map ?? open).values()];
  if (!docs.length) throw new Error(`No document paths discovered for wiki ${slug}`);

  const results = await mapLimit(docs, CONCURRENCY, async (doc) => {
    const url = rawUrlFor(slug, doc.path);
    const relativePath = path.join('wikis', cleanRelative(slug), cleanRelative(doc.path));
    const result = await fetchResource(url, {
      state,
      relativePath,
      maxBytes: MAX_DOC_BYTES,
      accept: 'text/markdown,text/plain;q=0.9,*/*;q=0.1',
      binary: false,
    });
    return { ...result, wiki: slug, gated: doc.gated, title: doc.title };
  });

  await atomicWrite(
    path.join(DEST, 'wikis', cleanRelative(slug), '_open.json'),
    JSON.stringify(open, null, 2) + '\n'
  );
  return { slug, discovered: docs.length, results, summary: summarize(results) };
}

async function mirrorSkills(index, state) {
  if (!SYNC_SKILLS) return [];
  const skills = Array.isArray(index?.skills) ? index.skills : [];
  return mapLimit(skills, Math.min(3, CONCURRENCY), async (skill) => {
    if (!skill?.name || !skill?.bundle) return { status: 'skipped', reason: 'missing name/bundle' };
    const name = cleanRelative(skill.name);
    return fetchResource(`${BASE}${skill.bundle}`, {
      state,
      relativePath: path.join('skills', name, 'bundle.tar.gz'),
      maxBytes: MAX_BUNDLE_BYTES,
      accept: 'application/gzip,application/octet-stream,*/*;q=0.1',
      binary: true,
    });
  });
}

async function main() {
  const startedAt = new Date().toISOString();
  if (REQUIRE_PRO && !API_KEY) {
    throw new Error('AGENTWIKIS_API_KEY is required for a complete Pro/XL mirror. Refusing a partial sync.');
  }

  await mkdir(DEST, { recursive: true, mode: 0o700 });
  const state = await loadState();

  const index = await getJson(`${BASE}/index.json`);
  const wikisResponse = await getJson(`${BASE}/api/wikis`);
  const wikis = Array.isArray(wikisResponse) ? wikisResponse : (wikisResponse?.wikis || index?.wikis || []);
  const live = wikis.filter((w) => w?.slug && !['coming-soon', 'disabled', 'archived'].includes(String(w.status || '').toLowerCase()));

  const registryResults = await mirrorRegistry(state);
  const wikiResults = [];
  for (const wiki of live) {
    try {
      wikiResults.push(await mirrorWiki(wiki.slug, state));
    } catch (error) {
      wikiResults.push({ slug: wiki.slug, error: String(error?.message || error), summary: { error: 1 } });
    }
  }
  const skillResults = await mirrorSkills(index, state);

  state.version = 1;
  state.base = BASE;
  state.lastCompletedAt = new Date().toISOString();
  state.wikiCount = live.length;
  state.skillCount = Array.isArray(index?.skills) ? index.skills.length : 0;
  await atomicWrite(STATE_PATH, JSON.stringify(state, null, 2) + '\n');

  const receipt = {
    version: 1,
    source: 'agentwikis',
    sourceBase: BASE,
    startedAt,
    completedAt: state.lastCompletedAt,
    proKeyPresent: Boolean(API_KEY),
    secretPersisted: false,
    destination: DEST,
    wikis: wikiResults.map((w) => ({ slug: w.slug, discovered: w.discovered || 0, summary: w.summary, error: w.error || null })),
    registry: summarize(registryResults),
    skills: summarize(skillResults),
  };
  await mkdir(path.dirname(RECEIPT_PATH), { recursive: true });
  await appendFile(RECEIPT_PATH, JSON.stringify(receipt) + '\n', { mode: 0o600 });
  await atomicWrite(path.join(DEST, 'receipts', 'last-run.json'), JSON.stringify(receipt, null, 2) + '\n');

  const failedWikis = wikiResults.filter((w) => w.error || (w.summary?.error || 0) > 0);
  const failedSkills = skillResults.filter((r) => r?.status === 'error');
  console.log(JSON.stringify({
    ok: failedWikis.length === 0 && failedSkills.length === 0,
    destination: DEST,
    wikiCount: live.length,
    skillCount: skillResults.length,
    failedWikis: failedWikis.map((w) => w.slug),
    failedSkills: failedSkills.length,
    receipt: path.join(DEST, 'receipts', 'last-run.json'),
  }, null, 2));
  if (failedWikis.length || failedSkills.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(`agentwikis sync failed: ${String(error?.message || error)}`);
  process.exit(1);
});
