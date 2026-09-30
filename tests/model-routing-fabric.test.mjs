import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const contract = JSON.parse(
  await readFile(new URL('../config/model-routing-fabric.json', import.meta.url), 'utf8')
);

test('keeps AGENTROPOLIS sovereign over routing', () => {
  assert.equal(contract.sovereign_router, 'agentropolis');
  assert.equal(contract.adapters.switchyard.required, false);
  assert.equal(contract.adapters.switchyard.fallback, 'native_policy_router');
});

test('prevents router self escalation and secret access', () => {
  assert.equal(contract.policy.self_escalation, false);
  assert.equal(contract.policy.raw_secret_access, false);
  assert.equal(contract.policy.human_approval_for_high_risk, true);
});

test('classifies Nemotron Lightning as bounded worker intelligence', () => {
  assert.ok(contract.tiers.worker.examples.includes('nvidia-nemotron-3.5-lightning'));
  assert.equal(contract.tiers.worker.execution_authority, 'bounded');
});

test('requires auditable route receipts', () => {
  for (const field of ['task_id', 'route_reason', 'selected_model', 'policy_decision', 'escalations', 'timestamp']) {
    assert.ok(contract.receipt.required_fields.includes(field), `missing receipt field: ${field}`);
  }
});
