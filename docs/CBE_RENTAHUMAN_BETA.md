# CBE RentAHuman Production Beta

## Position

RentAHuman is an external human-execution provider for the Chaos Builders Exchange (CBE). It is not the CBE system of record, professional identity graph, reputation authority, or payment authority.

The beta keeps the existing public AGENTROPOLIS MCP membrane read-only. The provider adapter is intentionally not registered as a public MCP tool until canary and operator approval complete.

## Canonical flow

```text
CBE Opportunity Graph
  -> HERMES planner
  -> 54-T risk and authority gate
  -> CBE Human Execution Gateway
  -> provider router
  -> RentAHuman adapter
  -> normalized external worker records
  -> receipt + provenance
```

## Beta authority ceiling

Allowed:
- worker.search
- worker.inspect (next increment, after schema confirmation)
- provider health/availability checks
- normalization of public/provider-returned profile metadata

Blocked in this beta:
- conversation.start
- message.send
- bounty.create
- application.accept
- service.book
- escrow.create
- payment.release
- dispute.open
- any autonomous spend
- any autonomous physical-world task dispatch

No write or payment tool may be enabled by changing a prompt. Promotion requires code, policy, tests, review, and a separate authenticated execution corridor.

## Secret handling

`RENTAHUMAN_API_KEY` is a runtime secret.

It must never be:
- committed to GitHub
- included in `.env.example`
- returned in API/MCP responses
- stored in D1 receipts
- logged in diagnostics
- written to WikiVault, Obsidian, gBRAIN, or HERMES memory
- placed in browser/client-side state

The adapter accepts the key only through the runtime environment and sends it to the provider as an authentication header. CBE-facing results contain provider references, never credentials.

## Required runtime flags

```text
CBE_RENTAHUMAN_ENABLED=true
RENTAHUMAN_API_KEY=<encrypted runtime secret>
RENTAHUMAN_API_URL=https://rentahuman.ai/api
```

Keep `CBE_RENTAHUMAN_ENABLED` false until the read-only canary is approved.

## CBE normalized worker contract

```json
{
  "cbeWorkerRef": "rentahuman:<provider-id>",
  "provider": "rentahuman",
  "providerWorkerId": "<provider-id>",
  "displayName": "...",
  "headline": "...",
  "skills": [],
  "city": "...",
  "country": "...",
  "hourlyRateUsd": 0,
  "rating": 0,
  "completedTasks": 0,
  "verified": false,
  "provenance": {
    "provider": "rentahuman",
    "trust": "external",
    "verification": "provider-asserted",
    "importedAt": "ISO-8601"
  }
}
```

Provider verification is not equivalent to CBE verification. CBE must preserve that distinction.

## Audit layers

### Layer A - supply-chain and licensing
- Pin provider protocol assumptions to official documentation.
- Do not vendor the provider MCP package into the public Worker.
- Review npm dependency provenance separately if the stdio package is later adopted.
- Keep the HTTP adapter replaceable.

### Layer B - credential isolation
- Runtime secret only.
- No model-context exposure.
- No client-side exposure.
- Redaction tests required before promotion.
- Rotation and revocation procedure documented before write scopes are considered.

### Layer C - capability governance
- Read-only provider adapter in beta.
- Default deny for all mutation/payment operations.
- Public MCP authority remains READ_ONLY.
- High-impact future actions require authenticated execution corridor plus human approval.

### Layer D - input/output containment
- Strict allowlist for search fields.
- Bounds on strings, pagination, and result count.
- Provider response mapped into a bounded CBE schema.
- Unknown provider fields are discarded.

### Layer E - provenance and receipts
- Every future exposed CBE search call must produce an AGENTROPOLIS receipt.
- Receipt stores hashes and bounded metadata, not raw secrets.
- External worker data is labeled `EXTERNAL_UNVERIFIED_PROFILE_DATA` until CBE verification exists.

### Layer F - resilience
- Provider disabled state fails closed.
- Provider rate limits map to bounded CBE errors.
- Schema mismatches fail closed.
- No fallback may silently trigger a write-capable provider path.

### Layer G - human and physical safety
- Physical task dispatch is out of beta scope.
- Future dispatch must classify legality, physical risk, privacy, identity exposure, financial impact, and location sensitivity.
- No credential sharing, account takeover, identity impersonation, unauthorized surveillance, deceptive review activity, authentication bypass, harassment, illegal delivery, or dangerous physical work.

## Production beta phases

### Phase 0 - contract freeze
Exit criteria:
- provider role documented
- CBE normalized schema documented
- read-only authority ceiling documented
- secret boundary documented

### Phase 1 - unit and contract tests
Run:

```bash
npm test
npm run validate
npm run deploy:dry
```

Exit criteria:
- input validation tests pass
- fail-closed provider-disabled test passes
- credential non-leak test passes
- 429 translation test passes
- existing MCP tests remain green

### Phase 2 - isolated canary
Use a non-public operator environment with `CBE_RENTAHUMAN_ENABLED=true`.

Canary query:

```text
skill=photography
city=Los Angeles
limit=5
```

Expected behavior:
- GET-only provider request
- no messages
- no bounty
- no booking
- no escrow
- no payment
- normalized results only

### Phase 3 - receipt-backed operator preview
Wire the adapter behind an operator-only CBE endpoint or internal HERMES capability handle.

Exit criteria:
- each call has a receipt ID
- raw API key absent from request/response logs and receipts
- provider latency/error telemetry available
- provider data provenance visible to operator

### Phase 4 - CBE graph projection
Project selected worker metadata into a disposable CBE external-provider view. Do not promote external provider claims to canonical CBE reputation without independent evidence.

Exit criteria:
- stable `cbeWorkerRef`
- provider source preserved
- freshness timestamps preserved
- deletion/refresh path defined

### Phase 5 - limited beta
Allow approved HERMES operators to search RentAHuman through CBE.

Success metrics:
- search success rate
- provider latency
- schema failure rate
- zero credential leakage
- zero unintended mutations
- zero provider-write calls

### Phase 6 - write-capability design review
Do not activate automatically.

Before any message/hire/payment capability is implemented, require:
- separate write adapter
- explicit 54-T policy schema
- human approval token
- spend caps
- idempotency keys
- transaction/dry-run preview where supported
- immutable execution receipt
- dispute/cancel/rollback process
- kill switch
- canary environment

## Rollback

Immediate rollback is:

```text
CBE_RENTAHUMAN_ENABLED=false
```

Because the adapter is not registered in the public MCP tool registry during this phase, disabling the feature flag removes network access without changing the public capability surface.

## Promotion rule

Production beta means read-only discovery is proven under receipts and policy. It does not mean autonomous hiring is approved.
