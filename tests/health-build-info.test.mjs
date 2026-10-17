import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildInfo } from '../src/build-info.js';
import worker from '../src/execution-beta-index.js';

const SHA = 'f'.repeat(40);

function fakeDb({ fail = false } = {}) {
  const stmt = { bind() { return stmt; }, async first() { if (fail) throw new Error('d1 down'); return { ok: 1 }; }, async run() { return {}; }, async all() { return { results: [] }; } };
  return { prepare() { return stmt; }, async batch() { if (fail) throw new Error('d1 down'); return []; } };
}

test('buildInfo returns injected commit sha and build id', () => {
  assert.deepEqual(buildInfo({ BUILD_SHA: SHA, BUILD_ID: '12345-1' }), { commitSha: SHA, buildId: '12345-1' });
});

test('buildInfo reports unknown for missing or malformed values', () => {
  assert.deepEqual(buildInfo({}), { commitSha: 'unknown', buildId: 'unknown' });
  assert.deepEqual(buildInfo({ BUILD_SHA: 'not-a-sha', BUILD_ID: 'bad id <script>' }), { commitSha: 'unknown', buildId: 'unknown' });
});

test('/health exposes build provenance', async () => {
  const env = { DB: fakeDb(), SERVICE_VERSION: '1.2.0-jspace-projection-beta', ENVIRONMENT: 'test', BUILD_SHA: SHA, BUILD_ID: '999-2' };
  const res = await worker.fetch(new Request('https://example.test/health'), env, { waitUntil() {} });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.deepEqual(body.build, { commitSha: SHA, buildId: '999-2' });
});

test('deploy workflow injects GITHUB_SHA and run id as build vars', async () => {
  const wf = await readFile(new URL('../.github/workflows/cloudflare-deploy.yml', import.meta.url), 'utf8');
  assert.match(wf, /--var "BUILD_SHA:\$\{GITHUB_SHA\}"/);
  assert.match(wf, /--var "BUILD_ID:\$\{GITHUB_RUN_ID\}-\$\{GITHUB_RUN_ATTEMPT\}"/);
});
