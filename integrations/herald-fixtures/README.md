# Herald Phase 1: fixture-only integration boundary

Status: local fixture PoC; not operational AEGIS, VERITY or 54T certification.

Owner: `AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AGENT-MCP`.
Placement: public-safe interoperability example under the existing capability
membrane. This follows `docs/SYSTEMWIDE_REPO_ROLE.md` and
`docs/PUBLIC_PRIVATE_BOUNDARY.md`. Explicit user authorization to publish this
synthetic-only draft PR was received on 2026-10-17. No private engine or policy
implementation is published.

The October 16 audit baseline is Herald
`04fba92585165d7407bc639efc8408b15217cd37`. `baseline.lock.json` preserves the
four exact AGENTROPOLIS governance revisions. Current Agent MCP main was still
`254e2ed593e5e251533ff1f9a9f422b302223285` at implementation start.

## Boundary

`serialized synthetic intent -> strict contract/digest checks -> exact committed
fixture transcript -> in-memory evidence/readback -> synthetic preview`

The adapter exposes only `review(serializedRequest)`. It has no tool runner,
network client, filesystem reader/writer, callback transport, capability issuer,
policy evaluator, provider router, scheduler or execution method. It is not
registered in `src/`, Worker routes, MCP tools, hooks, cron or Hermes.

`ALLOW` is a fixture-transcript label. Every decision and receipt sets
`execution_authorized: false` and `invocation_performed: false`. `ASK` returns no
preview and uses the non-executing denial-receipt contract. Unknown inputs deny.

Only exact committed synthetic requests can return their fixture preview. A
read returns a fixed synthetic document, bounded at 4096 bytes; a file operation
returns one synthetic move plan. It never opens a URI or applies a plan. Paths
are identifiers in `fixture://documents/` or `fixture://workspace/`, not OS paths.

The negative policy outcomes are manually authored test transcripts, NOT live
54T responses or evidence that identity, leases, approvals or budgets are
operationally verified. The adapter preserves those decisions without
implementing a parallel authority. New unregistered bindings deny even when a
caller recomputes an action digest.

## Contracts and binding

`contracts/v1.json` defines versioned request, decision, denial-receipt,
observation-receipt and review-packet contracts. Unknown properties fail.
`contracts.mjs` implements only the schema vocabulary used there; it is not a
general JSON Schema validator. Unsupported schema keywords fail at module load.

Requests bind principal, profile, session, mandate, capability, exact action,
SHA-256 action digest, target, policy revision, capability epoch, lease metadata,
request/lease expiry, budget and occurrence. Approval fixtures also bind the
request excluding its approval envelope. The canonical full-request digest
binds ALL request fields, including approval. The raw request digest separately
captures exact submitted JSON bytes. Duplicate keys, structural depth above 12,
inputs above 32 KiB, arbitrary paths, unknown routes and unknown fields deny.

No request may supply an authority verdict. Only the committed catalog supplies
fixture decisions. Catalog and contract canonical hashes must match the lock;
there is no fallback policy. This detects drift relative to the reviewed lock,
not malicious changes to code AND lock: PR review owns that trust boundary.

## Evidence and failure semantics

`FixtureEvidenceStore` is a bounded, branded, synchronous memory-only test store
(maximum 256 packets). It has atomic in-process replay consumption and a
readback check before returning a preview. Missing/write/readback/capacity
failures return `DENY`, `evidence_status: unavailable`, and `packet: null`.
No successful or durable receipt is claimed for an evidence failure.

Occurrence IDs are scoped to principal/profile/session. Successful fixture
approval IDs are single use in the shared store. Replay protection does NOT
survive process restart or a new store. There is no persistent authority or
replay service in Phase 1. The evaluation time is a fixed fixture timestamp,
not a live clock or lease expiry service.

Only committed synthetic bindings enter evidence. Unregistered or secret-bearing
input is never echoed; only its digest and a bounded reason code are returned.
Nested sensitive keys, common credential forms, encoded payload markers and
credential-bearing HTTP URLs are rejected. This bounded rejector is not a
complete Secret Shield, LYTA classifier or credential detector. Exact fixture
matching is the additional boundary that excludes arbitrary data.

## Reproduce without installation

From the repository root, with an existing Node >=22 runtime:

```sh
node --test --test-isolation=none --test-reporter=tap tests/herald-fixtures.test.mjs
node --test --test-isolation=none --test-reporter=tap tests/*.test.mjs
node scripts/validate-deployment.mjs
node scripts/validate-pre-canary.mjs
```

For an extra filesystem/process permission check on a compatible Node runtime:

```sh
node --permission --allow-fs-read="$PWD" --test --test-isolation=none tests/herald-fixtures.test.mjs
```

No installation, npx, Electron, Hermes or Herald invocation is needed. The Node
permission run gives test/module reads to this repository only and grants no
filesystem writes, subprocesses or workers. It is not a network sandbox or a
Phase 2 containment attestation.

See `THREAT-MODEL.md`, `CLAIMS.md`, `DEPENDENCIES-LICENSES.md`, `RFP.md`,
`VERITY-REVIEW.md`, and `evidence/` for limits and review materials.
