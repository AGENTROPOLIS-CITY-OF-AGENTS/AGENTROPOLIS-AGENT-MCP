# CITYFLIGHT Execution Corridor

CITYFLIGHT paid media generation requires a separate authenticated execution corridor. The existing public read-only MCP tools do not gain generation authority from this integration.

## Corridor

```text
ATG mandate
  -> identity and scope verification
  -> rights receipt verification
  -> spend ceiling verification
  -> provider capability check
  -> secret-reference resolution
  -> bounded generation call
  -> asset hash and cost evidence
  -> execution receipt
```

## Provider Adapter Contract

Adapters must report, without exposing secret values:

- adapter ID and version
- capability support for stills, start frame, end frame, aspect ratio, duration, and resolution
- credential reference status
- estimated maximum cost
- actual charged cost when available
- provider job ID
- returned asset references
- failure class and retry eligibility

## Fail-Closed Rules

Block execution when:

- the mandate is missing, expired, unsigned where signing is required, or outside scope
- rights status is unknown or rejected
- requested maximum cost exceeds the approved spend ceiling
- required start-frame or end-frame conditioning is unavailable
- credential references are absent
- the provider or model has not passed a current capability check
- the request attempts to expose raw secrets

## Receipt Minimum

```json
{
  "type": "cityflight.execution.receipt",
  "status": "succeeded_or_failed",
  "mandateRef": "",
  "adapter": {"id": "", "version": ""},
  "providerJobRef": "",
  "assetHashes": [],
  "estimatedCost": null,
  "actualCost": null,
  "secretValuesStored": false
}
```

No provider execution tool should be exposed publicly until authentication, authorization, rate limits, receipts, replay protection, cost controls, and operator rollback procedures are implemented and tested.
