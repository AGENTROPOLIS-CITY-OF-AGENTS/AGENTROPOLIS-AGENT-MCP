import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve('skills/agentropolis-wikivault');
const py = (...args) => spawnSync('python3', args, { encoding: 'utf8' });

test('WikiVault skill contains every referenced resource', () => {
  const required = [
    'SKILL.md',
    'agents/openai.yaml',
    'scripts/inventory_repo.py',
    'scripts/validate_records.py',
    'scripts/build_vault_bundle.py',
    'references/architecture.md',
    'references/schemas.md',
    'references/security.md',
    'references/browser-harness.md',
    'references/nft-xrpl.md',
    'references/runtime-adapters.md',
    'references/mcp-contract.md',
    'references/output-layout.md',
    'assets/wikivault.config.example.yaml',
    'assets/mcp.server.example.json',
    'assets/compatibility.example.yaml'
  ];
  for (const relative of required) assert.equal(fs.existsSync(path.join(ROOT, relative)), true, relative);
});

test('inventory quarantines secrets and symlinks while hashing safe files', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wikivault-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const source = path.join(tmp, 'source');
  const output = path.join(tmp, 'out');
  fs.mkdirSync(source);
  fs.writeFileSync(path.join(source, 'README.md'), 'hello\n');
  fs.writeFileSync(path.join(source, '.env'), 'SECRET=x\n');
  try { fs.symlinkSync('/etc/passwd', path.join(source, 'outside-link')); } catch {}
  const result = py(path.join(ROOT, 'scripts/inventory_repo.py'), source, '--output', output);
  assert.equal(result.status, 0, result.stderr);
  const inventory = JSON.parse(fs.readFileSync(path.join(output, 'inventory.json'), 'utf8'));
  assert.equal(inventory.files.find((f) => f.path === '.env').quarantined, true);
  assert.match(inventory.files.find((f) => f.path === 'README.md').sha256, /^[a-f0-9]{64}$/);
  const link = inventory.files.find((f) => f.path === 'outside-link');
  if (link) assert.equal(link.quarantined, true);
});

test('record validator accepts provenance-backed evidence and rejects bad canon state', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wikivault-records-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const good = path.join(tmp, 'good.jsonl');
  const bad = path.join(tmp, 'bad.jsonl');
  const base = {
    record_id: 'ev_1', record_type: 'CLAIM', namespace: 'test', canon_status: 'UNKNOWN',
    evidence_state: 'OBSERVED', confidence: 0.9,
    provenance: { source_type: 'local', source: 'fixture', observed_at: '2026-08-07T00:00:00Z' }
  };
  fs.writeFileSync(good, JSON.stringify(base) + '\n');
  fs.writeFileSync(bad, JSON.stringify({ ...base, canon_status: 'MADE_UP' }) + '\n');
  assert.equal(py(path.join(ROOT, 'scripts/validate_records.py'), good).status, 0);
  assert.notEqual(py(path.join(ROOT, 'scripts/validate_records.py'), bad).status, 0);
});

test('bundle builder creates manifest and checksums', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wikivault-bundle-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  fs.writeFileSync(path.join(tmp, 'evidence.jsonl'), '{}\n');
  const result = py(path.join(ROOT, 'scripts/build_vault_bundle.py'), tmp, '--scan-id', 'scan_test');
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'manifest.json'), 'utf8'));
  const checksums = JSON.parse(fs.readFileSync(path.join(tmp, 'checksums.json'), 'utf8'));
  assert.equal(manifest.scan_id, 'scan_test');
  assert.equal(checksums.files.some((f) => f.path === 'evidence.jsonl'), true);
});
