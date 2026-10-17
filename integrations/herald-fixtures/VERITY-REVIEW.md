# VERITY review packet: Herald Phase 1

Status: AUTHOR EVIDENCE ONLY / NOT_INDEPENDENTLY_REVIEWED.
No operational AEGIS, VERITY or 54T certification is claimed. No finding is closed
by an independent reviewer in this packet.

## Mandate and outcome

Implement a fixture-only Herald intent-to-governance example in the existing
Agent MCP integration membrane. Contribution modes: asset creation and capital
protection. Measure by reproducible denial coverage, exact bindings, zero live
invocation paths, and reviewable evidence; do not invent financial savings.

The adapter returns only synthetic document/file-plan previews from committed
transcripts. All paths set execution_authorized=false and invocation_performed=false.
Unknown/malformed inputs deny; ASK has no preview; evidence failure returns no
packet. No scheduler, provider router, authority system or transport was added.

## Evidence inventory

- `baseline.lock.json` and `GOVERNANCE.md`: exact source and governance pins.
- `contracts/v1.json`: versioned request, decision, denial and review contracts.
- `adapter.mjs`, `contracts.mjs`, `fixtures/catalog.v1.json`: reviewed implementation.
- `tests/herald-fixtures.test.mjs`: adversarial test cases.
- `evidence/fixture-tests.tap`: permission-constrained fixture run.
- `evidence/regression-tests.tap`: full repository root-test run.
- `evidence/validation.txt`: existing validation scripts.
- `evidence/test-summary.json`: actual commands, runtime, counts and limitations.
- `evidence/source-manifest.json`: SHA-256 source/artifact correlation, excluding
  the evidence directory and self-referential hashes.
- `evidence/review-samples.json`: generated synthetic ALLOW, ASK and DENY packets.
- `CLAIMS.md`, `THREAT-MODEL.md`, `DEPENDENCIES-LICENSES.md`, `RFP.md`:
  claims, threats, license/dependency disposition and nonbinding economics.

Exact reviewed implementation is the PR head commit that contains this packet;
GitHub supplies its immutable identity without a circular self-hash in this file.
The checkout was reconstructed from pinned GitHub blobs (216 content hashes
verified). No live API token or model credential was supplied to the PoC.

## Review requests

1. Independently rerun the commands and inspect all denial cases against the
   exact PR head. Verify that every catalog value is synthetic and output
   authority flags cannot become true.
2. Check binding completeness, raw/semantic digest distinction, target rules,
   replay scope, evidence failure handling, and absence of host I/O/extensions.
3. Confirm that fixtures and test outcomes have not been presented as policy
   implementation, authenticated authority, durable evidence or certification.
4. Confirm owner repository licensing and any external redistribution rights.
5. Record reviewer identity, evidence/source digest, findings, PASS/FAIL/BLOCKED,
   conditions and a decision about a separately authorized Phase 2.

## Limits and unresolved gates

- Private root-city canon and deployed policy/runtime evidence are unverified.
- Policy outcomes are authored fixtures with a fixed evaluation time.
- Evidence and replay state are memory-only and capped; restart clears them.
- No real principal authentication, lease issuance/verification, durable budget
  accounting, production Secret Shield, sealed keys or authority transport.
- No actual Herald/Hermes/Electron/Omarchy compatibility or containment test.
- Node runtime supply chain/advisories and repository licensing lack clearance.
- Node 22 and required remote CI status require the draft PR run; local runtime
  is Node v24.19.0. Build/deploy dry-run tooling was not downloaded locally.
- A packet persistence failure is reported honestly as unavailable, not as a
  fabricated successfully persisted denial receipt.

## Review disposition

Author assessment: PASS for fixture-only behavior; BLOCKED for operational
admission/certification. Existing Herald governance gaps from the audit remain
FAIL for production admission. Independent reviewer: unassigned. Human approval:
pending. Memory writeback: not performed; no memory destination was authorized.
Recommended next action: independent review of this draft PR, then resolve the
Phase 2 gates in THREAT-MODEL.md. No merge without explicit user authorization.
