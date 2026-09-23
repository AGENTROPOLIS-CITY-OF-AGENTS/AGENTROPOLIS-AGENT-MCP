import { createHash } from 'node:crypto';
import { HerdrAdapterError } from './adapter.mjs';
import { verifyManagedHerdrSession } from './session-context.mjs';
import { verifyUtilityGridAttestation } from './utility-grid-attestation.mjs';

const SAFE_ID = /^[A-Za-z0-9:._-]{1,128}$/;
const CAPABILITY_ID = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+){1,4}$/;
const MAX_CAPABILITIES = 32;
const MAX_CAPABILITY_LENGTH = 64;
export const REQUIRED_CAPABILITIES = Object.freeze([
  'host.omarchy',
  'runtime.hermes',
  'workspace.dispatch',
  'receipts.machine-scoped'
]);
export const DEFAULT_MAX_MACHINE_PROFILE_AGE_MS = 15 * 60 * 1000;

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

export function boundCapabilities(value) {
  if (!Array.isArray(value)) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_CAPABILITY_INVALID', 'machine profile capabilities must be an array');
  }
  if (value.length > MAX_CAPABILITIES) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_CAPABILITY_INVALID', 'machine profile advertises too many capabilities', {
      count: value.length,
      max: MAX_CAPABILITIES
    });
  }
  const capabilities = new Set();
  for (const entry of value) {
    if (typeof entry !== 'string' || entry.length > MAX_CAPABILITY_LENGTH || !CAPABILITY_ID.test(entry)) {
      throw new HerdrAdapterError('OMARCHY_PROFILE_CAPABILITY_INVALID', 'machine profile capability identifier is malformed', {
        length: typeof entry === 'string' ? entry.length : null
      });
    }
    capabilities.add(entry);
  }
  return [...capabilities].sort();
}

export function verifyOmarchyHerdrEvidence({
  runner,
  env = process.env,
  machineProfile,
  trustedIssuers,
  missionId,
  now = new Date(),
  maxMachineProfileAgeMs = DEFAULT_MAX_MACHINE_PROFILE_AGE_MS
} = {}) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }
  if (!Number.isFinite(maxMachineProfileAgeMs) || maxMachineProfileAgeMs <= 0 || maxMachineProfileAgeMs > DEFAULT_MAX_MACHINE_PROFILE_AGE_MS) {
    throw new TypeError(`maxMachineProfileAgeMs must be positive and at most ${DEFAULT_MAX_MACHINE_PROFILE_AGE_MS}`);
  }

  const attested = verifyUtilityGridAttestation({ signedProfile: machineProfile, trustedIssuers, now });
  const profile = attested.profile;

  const machineProfileId = assertSafeId(profile.machine_profile_id, 'machine_profile_id');
  const hermesMissionId = assertSafeId(missionId, 'mission_id');

  if (profile.trust_state !== 'verified') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_NOT_VERIFIED', 'machine profile trust_state must be verified');
  }
  if (profile.connectivity_state !== 'live') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_NOT_LIVE', 'machine profile connectivity_state must be live');
  }
  if (String(profile.platform ?? '').toLowerCase() !== 'linux') {
    throw new HerdrAdapterError('OMARCHY_PROFILE_PLATFORM_INVALID', 'Omarchy host profile must be Linux');
  }

  const capabilities = boundCapabilities(profile.capabilities);
  const missing = REQUIRED_CAPABILITIES.filter((capability) => !capabilities.includes(capability));
  if (missing.length > 0) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_CAPABILITY_MISSING', 'machine profile does not advertise required Omarchy/Hermes capabilities', { missing });
  }

  const machineVerifiedAt = assertFreshTimestamp(profile.last_verified_at, now, maxMachineProfileAgeMs);

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
    attestation: {
      issuer: attested.issuer,
      key_id: attested.key_id,
      issued_at: attested.issued_at,
      expires_at: attested.expires_at
    },
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
