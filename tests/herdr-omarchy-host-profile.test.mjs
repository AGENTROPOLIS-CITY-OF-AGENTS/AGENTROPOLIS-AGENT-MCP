import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyOmarchyHerdrEvidence } from '../integrations/herdr/omarchy-host-profile.mjs';

const now = new Date('2026-09-21T04:00:00.000Z');
const env = {
  HERDR_ENV: '1',
  HERDR_WORKSPACE_ID: 'w1',
  HERDR_TAB_ID: 'w1:t1',
  HERDR_PANE_ID: 'w1:p2'
};
const runner = () => ({
  stdout: JSON.stringify({ pane_id: 'w1:p2' }),
  status: 0
});
const machineProfile = {
  machine_profile_id: 'omarchy-quattro-primary',
  trust_state: 'verified',
  connectivity_state: 'live',
  platform: 'linux',
  architecture: 'x86_64',
  capabilities: [
    'host.omarchy',
    'runtime.hermes',
    'workspace.provision',
    'workspace.resume',
    'workspace.dispatch',
    'telemetry.lifecycle',
    'receipts.machine-scoped'
  ],
  last_verified_at: '2026-09-21T03:58:00.000Z',
  credential_reference: 'must-not-leak'
};

test('builds bounded Omarchy HERDR evidence from a fresh verified machine profile', () => {
  const evidence = verifyOmarchyHerdrEvidence({
    runner,
    env,
    machineProfile,
    missionId: 'hermes-mission-arc-1',
    now
  });

  assert.equal(evidence.host_environment, 'omarchy');
  assert.equal(evidence.machine_profile_id, 'omarchy-quattro-primary');
  assert.equal(evidence.runtime, 'hermes');
  assert.equal(evidence.herdr.verification_state, 'runtime_matched');
  assert.match(evidence.evidence_id, /^[a-f0-9]{64}$/);
  assert.equal('credential_reference' in evidence, false);
});

test('fails closed for quarantined machine profile', () => {
  assert.throws(
    () => verifyOmarchyHerdrEvidence({
      runner,
      env,
      machineProfile: { ...machineProfile, trust_state: 'quarantined' },
      missionId: 'hermes-mission-arc-1',
      now
    }),
    { code: 'OMARCHY_PROFILE_NOT_VERIFIED' }
  );
});

test('fails closed for stale machine verification', () => {
  assert.throws(
    () => verifyOmarchyHerdrEvidence({
      runner,
      env,
      machineProfile: { ...machineProfile, last_verified_at: '2026-09-20T20:00:00.000Z' },
      missionId: 'hermes-mission-arc-1',
      now
    }),
    { code: 'OMARCHY_PROFILE_STALE' }
  );
});

test('fails closed when HERDR pane does not match managed context', () => {
  const mismatchRunner = () => ({
    stdout: JSON.stringify({ pane_id: 'w1:p9' }),
    status: 0
  });

  assert.throws(
    () => verifyOmarchyHerdrEvidence({
      runner: mismatchRunner,
      env,
      machineProfile,
      missionId: 'hermes-mission-arc-1',
      now
    }),
    { code: 'HERDR_CONTEXT_MISMATCH' }
  );
});
