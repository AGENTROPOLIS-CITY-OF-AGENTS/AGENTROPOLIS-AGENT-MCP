import { createPublicKey, verify as cryptoVerify } from 'node:crypto';
import { HerdrAdapterError } from './adapter.mjs';

export const ATTESTATION_SCHEMA = 'agentropolis.utility_grid_machine_profile_attestation.v1';
const SAFE_ISSUER = /^utility-grid:[A-Za-z0-9._-]{1,64}$/;
const SAFE_KEY_ID = /^[A-Za-z0-9._-]{1,64}$/;
const MAX_ATTESTATION_TTL_MS = 24 * 60 * 60 * 1000;

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}

export function attestationMessage({ issuer, key_id, issued_at, expires_at, profile }) {
  return Buffer.from(
    canonicalize({ schema: ATTESTATION_SCHEMA, issuer, key_id, issued_at, expires_at, profile }),
    'utf8'
  );
}

function parseTime(value, label) {
  const parsed = Date.parse(String(value ?? ''));
  if (!Number.isFinite(parsed)) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', `${label} is not a valid timestamp`);
  }
  return parsed;
}

export function verifyUtilityGridAttestation({ signedProfile, trustedIssuers, now }) {
  if (!signedProfile || typeof signedProfile !== 'object' || Array.isArray(signedProfile)) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_REQUIRED', 'verified Utility Grid machine profile is required');
  }
  const { profile, attestation } = signedProfile;
  if (!attestation || typeof attestation !== 'object' || Array.isArray(attestation)) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_REQUIRED', 'machine profile must carry a Utility Grid attestation');
  }
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw new HerdrAdapterError('OMARCHY_PROFILE_REQUIRED', 'machine profile envelope must contain a profile object');
  }
  if (!trustedIssuers || typeof trustedIssuers !== 'object' || Object.keys(trustedIssuers).length === 0) {
    throw new HerdrAdapterError('UTILITY_GRID_ISSUERS_UNCONFIGURED', 'no trusted Utility Grid issuers are configured');
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }

  const { schema, issuer, key_id: keyId, algorithm, issued_at: issuedAt, expires_at: expiresAt, signature } = attestation;
  if (schema !== ATTESTATION_SCHEMA) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', 'unsupported attestation schema');
  }
  if (algorithm !== 'ed25519') {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', 'unsupported attestation algorithm');
  }
  if (!SAFE_ISSUER.test(String(issuer ?? '')) || !SAFE_KEY_ID.test(String(keyId ?? ''))) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', 'attestation issuer or key_id is malformed');
  }
  const issuerKeys = Object.prototype.hasOwnProperty.call(trustedIssuers, issuer) ? trustedIssuers[issuer] : null;
  if (!issuerKeys || typeof issuerKeys !== 'object') {
    throw new HerdrAdapterError('UTILITY_GRID_ISSUER_UNTRUSTED', 'attestation issuer is not an allowlisted Utility Grid issuer', { issuer });
  }
  const publicKeyPem = Object.prototype.hasOwnProperty.call(issuerKeys, keyId) ? issuerKeys[keyId] : null;
  if (typeof publicKeyPem !== 'string') {
    throw new HerdrAdapterError('UTILITY_GRID_ISSUER_UNTRUSTED', 'attestation key_id is not registered for the issuer', { issuer, key_id: keyId });
  }

  const issued = parseTime(issuedAt, 'attestation.issued_at');
  const expires = parseTime(expiresAt, 'attestation.expires_at');
  if (expires <= issued || expires - issued > MAX_ATTESTATION_TTL_MS) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', 'attestation validity window is invalid');
  }
  if (issued > now.getTime()) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_EXPIRED', 'attestation is not yet valid');
  }
  if (expires <= now.getTime()) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_EXPIRED', 'attestation has expired', { expires_at: new Date(expires).toISOString() });
  }

  let signatureBytes;
  try {
    signatureBytes = Buffer.from(String(signature ?? ''), 'base64');
  } catch {
    signatureBytes = Buffer.alloc(0);
  }
  if (signatureBytes.length !== 64) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', 'attestation signature is malformed');
  }

  let publicKey;
  try {
    publicKey = createPublicKey(publicKeyPem);
  } catch {
    throw new HerdrAdapterError('UTILITY_GRID_ISSUER_UNTRUSTED', 'registered issuer key is not a usable public key', { issuer, key_id: keyId });
  }
  if (publicKey.asymmetricKeyType !== 'ed25519') {
    throw new HerdrAdapterError('UTILITY_GRID_ISSUER_UNTRUSTED', 'registered issuer key is not ed25519', { issuer, key_id: keyId });
  }

  const message = attestationMessage({ issuer, key_id: keyId, issued_at: issuedAt, expires_at: expiresAt, profile });
  const valid = cryptoVerify(null, message, publicKey, signatureBytes);
  if (!valid) {
    throw new HerdrAdapterError('UTILITY_GRID_ATTESTATION_INVALID', 'attestation signature does not verify against the issuer key', { issuer, key_id: keyId });
  }

  return Object.freeze({
    issuer,
    key_id: keyId,
    issued_at: new Date(issued).toISOString(),
    expires_at: new Date(expires).toISOString(),
    profile
  });
}
