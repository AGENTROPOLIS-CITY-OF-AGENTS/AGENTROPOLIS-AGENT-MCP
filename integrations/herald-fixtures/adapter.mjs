import { createHash } from 'node:crypto';
import catalog from './fixtures/catalog.v1.json' with { type: 'json' };
import lock from './baseline.lock.json' with { type: 'json' };
import contracts from './contracts/v1.json' with { type: 'json' };
import { validateContract } from './contracts.mjs';

export const canonical = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
};
export const digest = (value) => createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
const clone = (value) => JSON.parse(JSON.stringify(value));
function freezeData(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeData(child);
    Object.freeze(value);
  }
  return value;
}
freezeData(catalog);
freezeData(lock);
freezeData(contracts);
const brandedStores = new WeakSet();
const forbiddenKey = /password|passphrase|secret|token|credential|private.?key|authorization|api.?key|seed/i;
const forbiddenValue = /(?:Bearer\s+\S+|-----BEGIN[^\n]*PRIVATE KEY|\b(?:sk-|ghp_|gho_|AKIA)[A-Za-z0-9_-]{8,}|(?:https?:\/\/)[^\s]*[@?]|(?:^|[\s/])\.(?:ssh|aws|gnupg)(?:\/|$))/iu;
function secretFound(value, depth = 0) {
  if (depth > 12) return true;
  if (typeof value === 'string') {
    const normalized = value.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/gu, '');
    if (forbiddenValue.test(normalized)) return true;
    if (/^(?:base64|data:)/iu.test(normalized)) return true; // encoded payloads are outside this fixture contract
    return false;
  }
  if (Array.isArray(value)) return value.some((child) => secretFound(child, depth + 1));
  if (value && typeof value === 'object') return Object.entries(value).some(([key, child]) => forbiddenKey.test(key.normalize('NFKC')) || secretFound(child, depth + 1));
  return false;
}

// JSON.parse already validates syntax. Scan keys to reject duplicate-key ambiguity
// and bound structural nesting before any schema processing or evidence emission.
function assertUniqueKeys(raw) {
  const stack = [];
  const tokens = raw.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|true|false|null|-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/gu) ?? [];
  for (const token of tokens) {
    if (token === '{' || token === '[') {
      stack.push({ object: token === '{', key: token === '{', seen: new Set() });
      if (stack.length > 12) throw new Error('INPUT_BOUND');
    } else if (token === '}' || token === ']') stack.pop();
    else if (token === ',' && stack.at(-1)?.object) stack.at(-1).key = true;
    else if (token.startsWith('"') && stack.at(-1)?.object && stack.at(-1).key) {
      const frame = stack.at(-1);
      const key = JSON.parse(token);
      if (frame.seen.has(key)) throw new Error('DUPLICATE_KEY');
      frame.seen.add(key);
      frame.key = false;
    }
  }
}

// Test evidence only. No disk, callback, transport, authority or execution hook.
// A successful commit is an in-memory readback, NOT durable production evidence.
export class FixtureEvidenceStore {
  #records = [];
  #occurrences = new Set();
  #approvals = new Set();
  #fault;
  constructor(fault = 'none') {
    if (!['none', 'missing', 'write_failure', 'readback_failure'].includes(fault)) throw new Error('FAULT_UNKNOWN');
    this.#fault = fault;
    brandedStores.add(this);
    Object.freeze(this);
  }
  commit(packet, occurrence, approval) {
    if (['missing', 'write_failure'].includes(this.#fault) || this.#records.length >= 256) throw new Error('EVIDENCE_UNAVAILABLE');
    if ((occurrence && this.#occurrences.has(occurrence)) || (approval && this.#approvals.has(approval))) throw new Error('REPLAY');
    const saved = clone(packet);
    if (this.#fault === 'readback_failure' || canonical(saved) !== canonical(packet)) throw new Error('EVIDENCE_UNAVAILABLE');
    this.#records.push(saved);
    if (occurrence) this.#occurrences.add(occurrence);
    if (approval) this.#approvals.add(approval);
  }
  records() { return clone(this.#records); }
}

Object.freeze(FixtureEvidenceStore.prototype);

export function createFixtureAdapter({ evidence = new FixtureEvidenceStore(), catalogCandidate = catalog } = {}) {
  // A corrupted/unknown fixture policy never gets a permissive fallback.
  let catalogHealthy = false;
  try { catalogHealthy = digest(catalogCandidate) === lock.catalog_sha256 && digest(contracts) === lock.contract_sha256; } catch { /* deny */ }
  const trustedEvidence = brandedStores.has(evidence) && Object.getPrototypeOf(evidence) === FixtureEvidenceStore.prototype;
  const transcripts = new Map(catalog.cases.map((entry) => [digest(entry.request), entry]));

  function review(serializedRequest) {
    let rawHash = digest('invalid-input');
    let request = null;
    let entry = null;
    let reason = 'INVALID_REQUEST';
    let verdict = 'DENY';
    let binding = null;
    try {
      if (typeof serializedRequest !== 'string' || Buffer.byteLength(serializedRequest, 'utf8') > 32768) throw new Error('INPUT_BOUND');
      rawHash = digest(serializedRequest);
      request = JSON.parse(serializedRequest);
      assertUniqueKeys(serializedRequest);
      if (secretFound(request)) throw new Error('SECRET_REJECTED');
      if (!validateContract('request', request)) throw new Error('CONTRACT_REJECTED');
      if (request.action_digest !== digest(request.action)) throw new Error('ACTION_ALTERED');
      if (request.target !== request.action.target) throw new Error('TARGET_MISMATCH');
      if (!catalogHealthy) throw new Error('POLICY_CORRUPT');
      if (!trustedEvidence) throw new Error('EVIDENCE_UNAVAILABLE');
      entry = transcripts.get(digest(request));
      if (!entry) throw new Error('UNREGISTERED_FIXTURE');
      // Only committed synthetic values may enter evidence, even on denial.
      binding = clone(entry.request);
      // Verbatim, precommitted TEST transcript. No policy evaluator is implemented here.
      verdict = entry.verdict;
      reason = entry.reason_code;
    } catch (error) {
      const safe = new Set(['INPUT_BOUND', 'DUPLICATE_KEY', 'SECRET_REJECTED', 'CONTRACT_REJECTED', 'ACTION_ALTERED', 'TARGET_MISMATCH', 'POLICY_CORRUPT', 'EVIDENCE_UNAVAILABLE', 'UNREGISTERED_FIXTURE']);
      reason = safe.has(error.message) ? error.message : 'INVALID_REQUEST';
    }
    const makeDecision = (result, code, evidenceStatus) => ({
      schema_version: 'herald.fixture.decision.v1',
      verdict: result, reason_code: code,
      source: entry && code === entry.reason_code && result === entry.verdict ? 'committed-test-transcript' : 'fixture-boundary',
      execution_authorized: false, invocation_performed: false,
      request_digest: rawHash, binding_digest: binding ? digest(binding) : null,
      binding, evidence_status: evidenceStatus,
    });
    const decision = makeDecision(verdict, reason, 'memory-only');
    const receipt = {
      schema_version: verdict === 'DENY' || verdict === 'ASK' ? 'herald.fixture.denial-receipt.v1' : 'herald.fixture.observation-receipt.v1',
      receipt_id: digest({ rawHash, decision }), request_digest: rawHash,
      decision_digest: digest(decision), reason_code: reason,
      execution_authorized: false, invocation_performed: false, evidence_status: 'memory-only',
    };
    const packet = {
      schema_version: 'herald.fixture.review-packet.v1',
      classification: 'synthetic-public', review_status: 'NOT_INDEPENDENTLY_REVIEWED',
      baseline: lock.governance_revisions, herald_commit: lock.herald_commit,
      decision, receipt, preview: verdict === 'ALLOW' ? clone(entry.preview) : null,
      limitations: ['FIXTURE_ONLY', 'NO_EXECUTION_AUTHORITY', 'MEMORY_ONLY_EVIDENCE', 'NO_OPERATIONAL_CERTIFICATION'],
    };
    const receiptName = verdict === 'ALLOW' ? 'observation_receipt' : 'denial_receipt';
    if (!validateContract('decision', decision) || !validateContract(receiptName, receipt) || !validateContract('review_packet', packet) || secretFound(packet)) {
      return { decision: makeDecision('DENY', 'OUTPUT_REJECTED', 'unavailable'), packet: null };
    }
    try {
      if (!trustedEvidence) throw new Error('EVIDENCE_UNAVAILABLE');
      evidence.commit(packet, binding ? digest({ principal: binding.principal, profile: binding.profile, session: binding.session, occurrence: binding.occurrence_id }) : null, verdict === 'ALLOW' ? binding.approval?.id : null);
    } catch (error) {
      return { decision: makeDecision('DENY', error.message === 'REPLAY' ? 'REPLAY' : 'EVIDENCE_UNAVAILABLE', 'unavailable'), packet: null };
    }
    return { decision: clone(decision), packet: clone(packet) };
  }
  // Deliberately no execute/apply/dispatch/connect/start/schedule method.
  return Object.freeze({ review });
}
