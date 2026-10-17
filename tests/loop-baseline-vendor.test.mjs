import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PAGES_BASELINE = join(root, 'github-pages', 'agentropolis-loop-baseline.js');
const EXPECTED_GIT_BLOB = '15254b442f33e009f4c78a1c19568e75ea2121b2';
const EXPECTED_SHA256 = 'df28604ae9462594df48aa6fa05d9a77a3ca02e2f74c29aa3ba264da6e4d7224';
const LOCAL_SCRIPT = './agentropolis-loop-baseline.js';
const SKIP_DIRS = new Set(['node_modules', '.git', '.wrangler']);

function gitBlobSha1(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function isRemoteScriptSrc(value) {
  const src = String(value).trim();
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return false;
  if (src.startsWith('//')) return true;
  return /^[a-z][a-z0-9+.-]*:/i.test(src);
}

function violationReason(value) {
  const src = String(value).trim();
  if (/AGENTROPOLIS-DESIGN-SYSTEM/i.test(src)) return 'design-system-script-src';
  if (/loop-baseline/i.test(src) && isRemoteScriptSrc(src)) return 'remote-loop-baseline-script';
  return '';
}

function collectScriptSrcs(text) {
  const sources = [];
  const patterns = [
    /<script\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi,
    /\.src\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/gi,
    /setAttribute\(\s*(['"])src\1\s*,\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/gi
  ];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const value = match.slice(1).find((part) => part !== undefined);
      if (value !== undefined) sources.push(value);
    }
  }
  return sources;
}

async function* walkSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkSourceFiles(full);
    } else if (entry.isFile() && /\.(?:html?|js|mjs|cjs)$/i.test(entry.name)) {
      yield full;
    }
  }
}

test('github-pages loop baseline is the pinned git blob and sha256', async () => {
  const bytes = await readFile(PAGES_BASELINE);
  assert.equal(gitBlobSha1(bytes), EXPECTED_GIT_BLOB);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), EXPECTED_SHA256);
});

test('every loop-baseline script copy matches that same blob', async () => {
  const copies = [];
  for await (const file of walkSourceFiles(root)) {
    if (file.endsWith(`${sep}agentropolis-loop-baseline.js`)) copies.push(file);
  }
  assert.ok(copies.some((file) => file === PAGES_BASELINE));
  for (const file of copies) {
    const bytes = await readFile(file);
    const label = relative(root, file);
    assert.equal(gitBlobSha1(bytes), EXPECTED_GIT_BLOB, label);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), EXPECTED_SHA256, label);
  }
});

test('github-pages launcher references the vendored script locally', async () => {
  const html = await readFile(join(root, 'github-pages', 'index.html'), 'utf8');
  const sources = collectScriptSrcs(html);
  assert.ok(sources.includes(LOCAL_SCRIPT));
  assert.equal(isRemoteScriptSrc(LOCAL_SCRIPT), false);
  for (const src of sources) {
    if (src.includes('loop-baseline')) assert.equal(isRemoteScriptSrc(src), false, src);
  }
});

test('html and js do not reference a remote loop-baseline or design-system script src', async () => {
  const violations = [];
  for await (const file of walkSourceFiles(root)) {
    const text = await readFile(file, 'utf8');
    for (const src of collectScriptSrcs(text)) {
      const reason = violationReason(src);
      if (reason) violations.push(`${relative(root, file)} [${reason}] ${src}`);
    }
  }
  assert.deepEqual(violations, []);
});

test('script-src detector flags remote baseline and design-system sources', () => {
  const loopName = 'loop-' + 'baseline';
  const design = 'AGENTROPOLIS-' + 'DESIGN-SYSTEM';
  const remoteBaseline = ['<scr', 'ipt src="https://cdn.example/', loopName, '.js" defer></scr', 'ipt>'].join('');
  const designSystem = ['<scr', 'ipt src="https://example.invalid/', design, '/widget.js"></scr', 'ipt>'].join('');
  const local = ['<scr', 'ipt src="./agentropolis-', loopName, '.js" defer></scr', 'ipt>'].join('');
  const designLink = ['<a href="https://example.invalid/', design, '/">Design system</a>'].join('');
  const assigned = ['script.src = "https://cdn.example/', loopName, '.js"'].join('');

  assert.equal(violationReason(collectScriptSrcs(remoteBaseline)[0]), 'remote-loop-baseline-script');
  assert.equal(violationReason(collectScriptSrcs(designSystem)[0]), 'design-system-script-src');
  assert.equal(violationReason(collectScriptSrcs(local)[0]), '');
  assert.deepEqual(collectScriptSrcs(designLink), []);
  assert.equal(violationReason(collectScriptSrcs(assigned)[0]), 'remote-loop-baseline-script');
});

test('required validate workflow runs this no-network regression', async () => {
  const workflow = await readFile(join(root, '.github', 'workflows', 'cloudflare-ci.yml'), 'utf8');
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  assert.match(workflow, /^jobs:\n {2}validate:/m);
  assert.match(workflow, /node --test tests\/loop-baseline-vendor\.test\.mjs/);
  assert.match(pkg.scripts.test, /tests\/\*\.test\.mjs/);
});
