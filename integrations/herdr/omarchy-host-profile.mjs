import { createHash } from 'node:crypto';
import { HerdrAdapterError } from './adapter.mjs';
import { verifyManagedHerdrSession } from './session-context.mjs';

const SAFE_ID = /^[A-Za-z0-9:._-]{1,128}$/;
const REQUIRED_CAPABILITIES = [
  'host.omarchy',
  'runtime.hermes',
  'workspace.dispatch',
  'receipts.machine-scoped'
];

function assertSafeId(value, label) {
  if (!SAFE_ID.test(String(value ?? ''))) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_INVALID', `${label} is missing or malformed`);
  }
  return String(value);
}

function assertFreshTimestamp(value, now, maxAgeMs) {
  const observed = Date.parse(String(value ?? ''));
  if (!Number.isFinite(observed)) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_STALE', 'machine profile verification timestamp is invalid');
  }
  const age = now.getTime() - observed;
  if (age < 0 || age > maxAgeMs) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_STALE', 'machine profile verification is outside the allowed freshness window', { age_ms: age });
  }
  return new Date(observed).toISOString();
}

export function verifyOmarchyHerdrEvidence({
  runner,
  env = process.env,
  machineProfile,
  missionId,
  now = new Date(),
  maxMachineProfileAgeMs = 15 * 60 * 1000
} = {}) {
  if (!machineProfile || typeof machineProfile !== 'object') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_REQUIRED', 'verified Utility Grid machine profile is required');
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }
  if (!Number.isFinite(maxMachineProfileAgeMs) || maxMachineProfileAgeMs <= 0) {
    throw new TypeError('maxMachineProfileAgeMs must be positive');
  }

  const machineProfileId = assertSafeId(machineProfile.machine_profile_id, 'machine_profile_id');
  const hermesMissionId = assertSafeId(missionId, 'mission_id');

  if (machineProfile.trust_state !== 'verified') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_NOT_VERIFIED', 'machine profile trust_state must be verified');
  }
  if (machineProfile.connectivity_state !== 'live') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_NOT_LIVE', 'machine profile connectivity_state must be live');
  }
  if (String(machineProfile.platform ?? '').toLowerCase() !== 'linux') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_PLATFORM_INVALID', 'Omarchy host profile must be Linux');
  }

  const capabilities = Array.isArray(machineProfile.capabilities)
    ? [...new Set(machineProfile.capabilities.map(String))].sort()
    : [];
  const missing = REQUIRED_CAPABILITIES.filter((capability) => !capabilities.includes(capability));
  if (missing.length > 0) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_CAPABILITY_MISSING', 'machine profile does not advertise required Omarchy/Hermes capabilities', { missing });
  }

  const machineVerifiedAt = assertFreshTimestamp(
    machineProfile.last_verified_at,
    now,
    maxMachineProfileAgeMs
  );

  const herdr = verifyManagedHerdrSession({ runner, env });
  const createdAt = now.toISOString();

  const core = {
    schema: 'agentropolis.omarchy_herdr_evidence.v1',
    machine_profile_id: machineProfileId,
    host_environment: 'omarchy',
    machine_trust_state: 'verified',
    connectivity_state: 'live',
    platform: 'linux',
    runtime: 'hermes',
    mission_id: hermesMissionId,
    capabilities,
    machine_verified_at: machineVerifiedAt,
    herdr: {
      workspace_id: herdr.workspace_id,
      tab_id: herdr.tab_id,
      pane_id: herdr.pane_id,
      context_fingerprint: herdr.context_fingerprint,
      verification_state: herdr.verification_state
    },
    evidence_created_at: createdAt
  };

  const evidenceId = createHash('sha256')
    .update(JSON.stringify(core))
    .digest('hex');

  return { ...core, evidence_id: evidenceId };
}
