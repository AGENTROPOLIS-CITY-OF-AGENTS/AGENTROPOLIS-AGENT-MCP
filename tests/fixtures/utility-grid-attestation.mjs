import { generateKeyPairSync, sign } from 'node:crypto';
import { attestationMessage, ATTESTATION_SCHEMA } from '../../integrations/herdr/utility-grid-attestation.mjs';

export function makeIssuer(issuer = 'utility-grid:primary', keyId = 'ug-key-1') {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
  return {
    issuer,
    keyId,
    privateKey,
    publicKeyPem,
    trustedIssuers: Object.freeze({ [issuer]: Object.freeze({ [keyId]: publicKeyPem }) })
  };
}

export function signProfile(profile, issuerFixture, {
  issuedAt = '2026-09-21T03:58:00.000Z',
  expiresAt = '2026-09-21T05:58:00.000Z',
  issuer = issuerFixture.issuer,
  keyId = issuerFixture.keyId
} = {}) {
  const message = attestationMessage({ issuer, key_id: keyId, issued_at: issuedAt, expires_at: expiresAt, profile });
  const signature = sign(null, message, issuerFixture.privateKey).toString('base64');
  return {
    profile,
    attestation: {
      schema: ATTESTATION_SCHEMA,
      algorithm: 'ed25519',
      issuer,
      key_id: keyId,
      issued_at: issuedAt,
      expires_at: expiresAt,
      signature
    }
  };
}
