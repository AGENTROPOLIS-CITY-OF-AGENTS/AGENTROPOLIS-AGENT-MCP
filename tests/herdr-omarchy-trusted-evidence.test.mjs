import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyOmarchyHerdrEvidence, boundCapabilities } from '../integrations/herdr/omarchy-host-profile.mjs';
import { verifyUtilityGridAttestation } from '../integrations/herdr/utility-grid-attestation.mjs';
import { GovernedHerdrRuntime } from '../integrations/herdr/production-adapter.mjs';
import { makeIssuer, signProfile } from './fixtures/utility-grid-attestation.mjs';

const utilityGrid = makeIssuer();
const rogue = makeIssuer('utility-grid:rogue', 'rogue-key');
const trustedIssuers = utilityGrid.trustedIssuers;

const now = new Date('2026-09-21T04:00:00.000Z');
const env = {
  HERDR_ENV: '1',
  HERDR_WORKSPACE_ID: 'w1',
  HERDR_TAB_ID: 'w1:t1',
  HERDR_PANE_ID: 'w1:p2'
};
const runner = () => ({ stdout: JSON.stringify({ pane_id: 'w1:p2' }), status: 0 });
const profile = {
  machine_profile_id: 'omarchy-quattro-primary',
  trust_state: 'verified',
  connectivity_state: 'live',
  platform: 'linux',
  architecture: 'x86_64',
  capabilities: ['host.omarchy', 'runtime.hermes', 'workspace.dispatch', 'receipts.machine-scoped'],
  last_verified_at: '2026-09-21T03:58:00.000Z'
};
const base = { runner, env, trustedIssuers, missionId: 'hermes-mission-arc-1', now };

test('unsigned machine profile is never trusted', () => {
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, machineProfile: profile }),
    { code: 'UTILITY_GRID_ATTESTATION_REQUIRED' }
  );
});

test('profile tampered after signing fails signature verification', () => {
  const signed = signProfile(profile, utilityGrid);
  const tampered = { ...signed, profile: { ...signed.profile, machine_profile_id: 'omarchy-forged' } };
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, machineProfile: tampered }),
    { code: 'UTILITY_GRID_ATTESTATION_INVALID' }
  );
});

test('attestation from a non-allowlisted issuer is rejected', () => {
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, machineProfile: signProfile(profile, rogue) }),
    { code: 'UTILITY_GRID_ISSUER_UNTRUSTED' }
  );
});

test('attestation claiming a trusted issuer but signed by another key is rejected', () => {
  const forged = signProfile(profile, rogue, { issuer: utilityGrid.issuer, keyId: utilityGrid.keyId });
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, machineProfile: forged }),
    { code: 'UTILITY_GRID_ATTESTATION_INVALID' }
  );
});

test('expired attestation is rejected even with a valid signature', () => {
  const expired = signProfile(profile, utilityGrid, {
    issuedAt: '2026-09-21T01:00:00.000Z',
    expiresAt: '2026-09-21T03:00:00.000Z'
  });
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, machineProfile: expired }),
    { code: 'UTILITY_GRID_ATTESTATION_EXPIRED' }
  );
});

test('attestation TTL longer than 24h is rejected', () => {
  const longLived = signProfile(profile, utilityGrid, {
    issuedAt: '2026-09-21T03:00:00.000Z',
    expiresAt: '2026-09-23T03:00:00.000Z'
  });
  assert.throws(
    () => verifyUtilityGridAttestation({ signedProfile: longLived, trustedIssuers, now }),
    { code: 'UTILITY_GRID_ATTESTATION_INVALID' }
  );
});

test('missing trusted issuer configuration fails closed', () => {
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, trustedIssuers: {}, machineProfile: signProfile(profile, utilityGrid) }),
    { code: 'UTILITY_GRID_ISSUERS_UNCONFIGURED' }
  );
});

test('capabilities are bounded in count and shape', () => {
  assert.throws(() => boundCapabilities('host.omarchy'), { code: 'OMARCHY_PROFILE_CAPABILITY_INVALID' });
  assert.throws(() => boundCapabilities(['host.omarchy', 'bad capability!']), { code: 'OMARCHY_PROFILE_CAPABILITY_INVALID' });
  assert.throws(
    () => boundCapabilities(Array.from({ length: 200 }, (_, i) => `cap.${i}`)),
    { code: 'OMARCHY_PROFILE_CAPABILITY_INVALID' }
  );
  const oversized = signProfile({ ...profile, capabilities: Array.from({ length: 200 }, (_, i) => `cap.${i}`) }, utilityGrid);
  assert.throws(
    () => verifyOmarchyHerdrEvidence({ ...base, machineProfile: oversized }),
    { code: 'OMARCHY_PROFILE_CAPABILITY_INVALID' }
  );
});

test('evidence records attestation provenance and no credential material', () => {
  const evidence = verifyOmarchyHerdrEvidence({ ...base, machineProfile: signProfile({ ...profile, credential_reference: 'secret' }, utilityGrid) });
  assert.equal(evidence.attestation.issuer, utilityGrid.issuer);
  assert.equal(evidence.attestation.key_id, utilityGrid.keyId);
  assert.equal(JSON.stringify(evidence).includes('secret'), false);
  assert.equal(JSON.stringify(evidence).includes(utilityGrid.publicKeyPem), false);
});

function makeAdapter(paneId = 'w1:p2') {
  return {
    contract: { adapter: 'herdr' },
    runner: () => ({ stdout: JSON.stringify({ pane_id: paneId }), status: 0 })
  };
}

test('governed runtime verifies Omarchy host with runtime-owned trusted inputs', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter(), env, trustedIssuers, clock: () => now });
  const evidence = runtime.verifyOmarchyHost(signProfile(profile, utilityGrid), 'hermes-mission-arc-1');
  assert.equal(evidence.herdr.verification_state, 'runtime_matched');
});

test('caller options cannot replace runner, env, clock, issuers, or freshness', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter('w1:p9'), env, trustedIssuers, clock: () => now });
  const signed = signProfile(profile, utilityGrid);
  for (const override of [
    { runner },
    { env: { ...env, HERDR_PANE_ID: 'w1:p9' } },
    { now: new Date('2030-01-01T00:00:00.000Z') },
    { trustedIssuers: rogue.trustedIssuers },
    { maxMachineProfileAgeMs: Number.MAX_SAFE_INTEGER },
    { machineProfile: signed },
    { missionId: 'other' }
  ]) {
    assert.throws(
      () => runtime.verifyOmarchyHost(signed, 'hermes-mission-arc-1', override),
      { code: 'OMARCHY_OPTION_FORBIDDEN' },
      `override ${Object.keys(override)[0]} must be refused`
    );
  }
  assert.throws(
    () => runtime.verifyOmarchyHost(signed, 'hermes-mission-arc-1'),
    { code: 'HERDR_CONTEXT_MISMATCH' }
  );
});

test('governed runtime without configured issuers cannot be talked into trusting a profile', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter(), env, clock: () => now });
  assert.throws(
    () => runtime.verifyOmarchyHost(signProfile(profile, utilityGrid), 'hermes-mission-arc-1'),
    { code: 'UTILITY_GRID_ISSUERS_UNCONFIGURED' }
  );
  assert.throws(() => { runtime.trustedIssuers['utility-grid:primary'] = {}; }, TypeError);
});
