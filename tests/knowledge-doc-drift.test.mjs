// Drift check for the knowledge-stack doc (canonical edition lives in PUBLIC-PORT-DISTRIBUTION-MEMBRANE).
// Local check only: cross-repo hash comparison needs a read token for the private canonical repo and is proposed separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const doc = await readFile(new URL('docs/obsidian-gbrain-intelligence-layer.md', root), 'utf8');
const CANONICAL = 'AGENTROPOLIS-CITY-OF-AGENTS/PUBLIC-PORT-DISTRIBUTION-MEMBRANE:docs/obsidian-gbrain-intelligence-layer.md';
const FORBIDDEN = [/gbrain\.upsert_claim/i, /Obsidian is the writable brain/i, /Obsidian\s*\|\s*Source-of-truth/i];

test('knowledge doc references the canonical edition', () => {
  assert.ok(doc.includes(CANONICAL), 'missing canonical edition reference');
});

test('knowledge doc keeps governed semantics (WikiVault canon, gBRAIN derived, no direct gBRAIN writes)', () => {
  for (const re of FORBIDDEN) assert.doesNotMatch(doc, re);
  assert.match(doc, /WikiVault\s*\|\s*Owns governed evidence and canon/);
  assert.match(doc, /gBRAIN\s*\|\s*Derived, rebuildable/);
  assert.match(doc, /No MCP tool may write directly to gBRAIN/);
});

test('no source file exposes a direct gbrain upsert tool', async () => {
  for (const name of await readdir(new URL('src/', root))) {
    if (!name.endsWith('.js')) continue;
    const src = await readFile(new URL(`src/${name}`, root), 'utf8');
    assert.doesNotMatch(src, /gbrain\.upsert_claim|gbrain_upsert_claim/i, `src/${name}`);
  }
});
