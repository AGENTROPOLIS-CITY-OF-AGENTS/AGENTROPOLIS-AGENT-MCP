import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFixtureAdapter, FixtureEvidenceStore, digest, canonical } from '../integrations/herald-fixtures/adapter.mjs';
import { validateContract } from '../integrations/herald-fixtures/contracts.mjs';
import catalog from '../integrations/herald-fixtures/fixtures/catalog.v1.json' with { type: 'json' };
import lock from '../integrations/herald-fixtures/baseline.lock.json' with { type: 'json' };
import contracts from '../integrations/herald-fixtures/contracts/v1.json' with { type: 'json' };

const copy = (x) => JSON.parse(JSON.stringify(x));
const request = (name = 'bounded_document_read') => copy(catalog.cases.find((item) => item.name === name).request);
const submit = (r, adapter = createFixtureAdapter()) => adapter.review(JSON.stringify(r));
function nonExecuting(result, verdict = 'DENY') {
  assert.equal(result.decision.verdict, verdict);
  assert.equal(result.decision.execution_authorized, false);
  assert.equal(result.decision.invocation_performed, false);
  assert.ok(validateContract('decision', result.decision));
  if (verdict !== 'ALLOW') assert.equal(result.packet?.preview ?? null, null);
}

for (const entry of catalog.cases) {
  test(`transcript/${entry.name}: preserve ${entry.verdict}, never authorize execution`, () => {
    const store = new FixtureEvidenceStore();
    const result = submit(entry.request, createFixtureAdapter({ evidence: store }));
    nonExecuting(result, entry.verdict);
    assert.equal(result.decision.reason_code, entry.reason_code);
    assert.ok(validateContract('review_packet', result.packet));
    assert.equal(store.records().length, 1);
    assert.equal(result.decision.binding_digest, digest(entry.request));
    if (entry.verdict === 'ALLOW') assert.deepEqual(result.packet.preview, entry.preview);
    else assert.ok(validateContract('denial_receipt', result.packet.receipt));
  });
}

test('document result is bounded synthetic data with no host path', () => {
  const result = submit(request());
  assert.ok(Buffer.byteLength(result.packet.preview.text) <= result.decision.binding.action.max_bytes);
  assert.match(result.packet.preview.text, /^Synthetic project brief/);
});
test('file plan is an immutable preview; request and fixture catalog remain unchanged', () => {
  const r = request('synthetic_move_plan');
  const before = canonical(r);
  const result = submit(r);
  assert.equal(result.packet.preview.kind, 'file-plan');
  assert.deepEqual(result.packet.preview.operations, [r.action]);
  result.packet.preview.operations[0].destination = 'fixture://workspace/changed.txt';
  assert.equal(canonical(r), before);
  assert.notEqual(submit(r).packet.preview.operations[0].destination, 'fixture://workspace/changed.txt');
});
test('ASK remains non-executing and emits a denial receipt', () => {
  const result = submit(request('approval_required'));
  nonExecuting(result, 'ASK');
  assert.ok(validateContract('denial_receipt', result.packet.receipt));
});
test('action alteration without digest update is denied', () => {
  const r = request(); r.action.max_bytes = 2;
  const result = submit(r); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'ACTION_ALTERED');
});
test('action alteration with recomputed digest cannot create a fixture grant', () => {
  const r = request(); r.action.max_bytes = 2; r.action_digest = digest(r.action);
  const result = submit(r); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'UNREGISTERED_FIXTURE');
});
test('root target cannot differ from exact action target', () => {
  const r = request(); r.target = 'fixture://documents/other.txt';
  const result = submit(r); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'TARGET_MISMATCH');
});

for (const field of ['principal', 'profile', 'session', 'mandate', 'capability_epoch', 'occurrence_id']) {
  test(`binding/${field}: any unregistered change denies`, () => {
    const r = request(); r[field] = 'synthetic:unregistered'; nonExecuting(submit(r));
  });
}
for (const field of ['lease', 'budget', 'approval', 'policy_revision', 'expires_at', 'action_digest']) {
  test(`binding/${field}: omission denies`, () => {
    const r = request(); delete r[field]; nonExecuting(submit(r));
  });
}
for (const field of ['id', 'subject', 'profile', 'session', 'mandate', 'capability', 'target', 'policy_revision', 'capability_epoch', 'status', 'expires_at']) {
  test(`lease/${field}: tampering never creates a grant`, () => {
    const r = request(); r.lease[field] = 'synthetic:tampered'; nonExecuting(submit(r));
  });
}
for (const route of ['terminal', 'cli', 'os', 'os-run', 'ui', 'hook', 'cron', 'mcp', 'http', 'electron', 'hermes']) {
  test(`route/${route}: unavailable even with valid fixture action`, () => {
    const r = request(); r.route = route; nonExecuting(submit(r));
  });
}
for (const capability of ['system_files', 'system_open', 'terminal', 'cron', 'wallet.sign', 'plugins.enable']) {
  test(`capability/${capability}: deny`, () => {
    const r = request(); r.capability = capability; nonExecuting(submit(r));
  });
}
for (const target of ['/etc/passwd', '~/.hermes/auth.json', 'file:///tmp/x', 'fixture://documents/../brief.txt', 'https://example.test/x', 'fixture://documents/brief.txt?x=1']) {
  test(`path/${target}: no filesystem or URL interpretation`, () => {
    const r = request(); r.target = target; r.action.target = target; r.action_digest = digest(r.action);
    nonExecuting(submit(r));
  });
}

test('same occurrence cannot be replayed in one evidence scope', () => {
  const adapter = createFixtureAdapter();
  nonExecuting(submit(request(), adapter), 'ALLOW');
  const result = submit(request(), adapter); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'REPLAY'); assert.equal(result.packet, null);
});
test('approval cannot be replayed under another occurrence', () => {
  const adapter = createFixtureAdapter();
  nonExecuting(submit(request('synthetic_move_plan'), adapter), 'ALLOW');
  const result = submit(request('approval_replay_candidate'), adapter); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'REPLAY'); assert.equal(result.packet, null);
});
test('approval digest, expiry and status are bound to exact request', () => {
  for (const [key, value] of [['request_digest', '0'.repeat(64)], ['expires_at', '2026-10-16T00:00:00Z'], ['status', 'approved'], ['id', 'synthetic:other']]) {
    const r = request('approval_required'); r.approval[key] = value; nonExecuting(submit(r));
  }
});
for (const fault of ['missing', 'write_failure', 'readback_failure']) {
  test(`evidence/${fault}: withhold preview and stop`, () => {
    const evidence = new FixtureEvidenceStore(fault);
    const result = submit(request(), createFixtureAdapter({ evidence }));
    nonExecuting(result); assert.equal(result.decision.reason_code, 'EVIDENCE_UNAVAILABLE');
    assert.equal(result.packet, null); assert.deepEqual(evidence.records(), []);
  });
}
test('absent or arbitrary evidence callback/store fails closed', () => {
  let called = 0;
  for (const evidence of [null, {}, { commit() { called++; } }]) {
    const result = submit(request(), createFixtureAdapter({ evidence }));
    nonExecuting(result); assert.equal(result.packet, null);
  }
  assert.equal(called, 0);
});
test('evidence implementation cannot be overridden', () => {
  const evidence = new FixtureEvidenceStore();
  assert.throws(() => { evidence.commit = () => {}; }, TypeError);
  assert.throws(() => { FixtureEvidenceStore.prototype.commit = () => {}; }, TypeError);
});
test('policy/catalog corruption has no permissive default', () => {
  for (const candidate of [null, {}, { cases: [] }, { ...catalog, notice: 'corrupted' }]) {
    const result = submit(request(), createFixtureAdapter({ catalogCandidate: candidate }));
    nonExecuting(result); assert.equal(result.decision.reason_code, 'POLICY_CORRUPT');
  }
});
test('contract and catalog canonical digests match reviewed lock', () => {
  assert.equal(digest(catalog), lock.catalog_sha256);
  assert.equal(digest(contracts), lock.contract_sha256);
  assert.equal(lock.herald_commit, '04fba92585165d7407bc639efc8408b15217cd37');
});

for (const payload of [
  { nested: [{ password: 'SYNTHETIC_MARKER_NOT_A_CREDENTIAL' }] },
  { nested: { innocent: 'Bearer SYNTHETIC_MARKER_NOT_A_CREDENTIAL' } },
  { nested: { innocent: 'base64:U1lOVEhFVElDX09OTFk=' } },
  { nested: { 'ｔｏｋｅｎ': 'SYNTHETIC_MARKER_NOT_A_CREDENTIAL' } },
  { nested: { innocent: 'https://example.test/?password=SYNTHETIC_MARKER_NOT_A_CREDENTIAL' } },
]) {
  test(`secrets/${Object.keys(payload.nested)[0]}: nested or encoded input never appears in output`, () => {
    const r = request(); r.extra = payload;
    const result = submit(r); nonExecuting(result);
    const serialized = JSON.stringify(result);
    assert.equal(result.decision.reason_code, 'SECRET_REJECTED');
    assert.ok(!serialized.includes('SYNTHETIC_MARKER_NOT_A_CREDENTIAL'));
    assert.equal(result.decision.binding, null);
  });
}
for (const raw of ['null', '[]', '{', 'true', '1', '"synthetic"', '{"x":1,"x":2}', ' '.repeat(32769), '{"nested":'.repeat(14)+'null'+'}'.repeat(14)]) {
  test(`malformed/bounded input ${raw.length} bytes: deny without throwing`, () => nonExecuting(createFixtureAdapter().review(raw)));
}
test('duplicate request keys are rejected even if JSON.parse would accept them', () => {
  const raw = JSON.stringify(request()).replace('{', '{"principal":"synthetic:unknown",');
  const result = createFixtureAdapter().review(raw); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'DUPLICATE_KEY');
});
test('strict contracts reject authority claims and unknown fields', () => {
  const result = submit(request());
  assert.equal(validateContract('decision', { ...result.decision, execution_authorized: true }), false);
  assert.equal(validateContract('decision', { ...result.decision, unexpected: true }), false);
  assert.equal(validateContract('review_packet', { ...result.packet, review_status: 'CERTIFIED' }), false);
  assert.throws(() => validateContract('unknown', {}), /CONTRACT_UNKNOWN/);
});
test('denial receipts are correlated to exact submitted bytes and decision', () => {
  const raw = JSON.stringify(request('unknown_identity'), null, 2);
  const result = createFixtureAdapter().review(raw);
  assert.equal(result.packet.receipt.request_digest, digest(raw));
  assert.equal(result.packet.receipt.decision_digest, digest(result.decision));
});
test('evidence snapshot mutation cannot change recorded packet', () => {
  const evidence = new FixtureEvidenceStore(); submit(request(), createFixtureAdapter({ evidence }));
  const records = evidence.records(); records[0].decision.execution_authorized = true;
  assert.equal(evidence.records()[0].decision.execution_authorized, false);
});
test('adapter exposes review only, with no invocation/transport extension point', () => {
  const adapter = createFixtureAdapter(); assert.deepEqual(Object.keys(adapter), ['review']);
  assert.equal(Object.isFrozen(adapter), true);
  for (const name of ['execute', 'apply', 'dispatch', 'connect', 'start', 'schedule']) assert.equal(adapter[name], undefined);
});
test('fixture modules import no host I/O, scheduler, authority engine or provider', () => {
  for (const file of ['adapter.mjs', 'contracts.mjs']) {
    const source = readFileSync(new URL(`../integrations/herald-fixtures/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /(?:node:fs|node:net|node:http|node:child_process|node:worker_threads|process\.env|\bfetch\s*\(|\bimport\s*\(|\beval\s*\(|\bsetInterval\s*\()/u);
    assert.doesNotMatch(source, /from\s+['"].*(?:src\/|herdr|54t-runtime|execution-governor)/u);
  }
});

test('unregistered innocently named credential-like values are not echoed', () => {
  const r = request(); r.session = 'SYNTHETIC_UNRECOGNIZED_PRIVATE_VALUE';
  const result = submit(r); nonExecuting(result);
  assert.equal(result.decision.binding, null);
  assert.ok(!JSON.stringify(result).includes('SYNTHETIC_UNRECOGNIZED_PRIVATE_VALUE'));
});
test('bounded evidence store fails closed at capacity', () => {
  const evidence = new FixtureEvidenceStore();
  const adapter = createFixtureAdapter({ evidence });
  for (let i = 0; i < 256; i++) {
    const result = adapter.review(JSON.stringify({ invalid: i }));
    assert.ok(result.packet);
  }
  const result = submit(request(), adapter); nonExecuting(result);
  assert.equal(result.decision.reason_code, 'EVIDENCE_UNAVAILABLE');
  assert.equal(result.packet, null); assert.equal(evidence.records().length, 256);
});
test('committed catalog cannot be mutated after adapter creation', () => {
  assert.throws(() => { catalog.cases[0].preview.text = 'changed'; }, TypeError);
  assert.throws(() => { lock.catalog_sha256 = '0'.repeat(64); }, TypeError);
});

test('boundary denials are distinguished from authored authority transcripts', () => {
  assert.equal(submit(request('unknown_identity')).decision.source, 'committed-test-transcript');
  assert.equal(createFixtureAdapter().review('{').decision.source, 'fixture-boundary');
  const result = submit(request(), createFixtureAdapter({ evidence: null }));
  assert.equal(result.decision.source, 'fixture-boundary');
});
