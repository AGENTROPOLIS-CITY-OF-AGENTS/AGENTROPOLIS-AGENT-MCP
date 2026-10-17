# Phase 1 threat model and Phase 2 gates

Assets: host files and credentials, governance authority, accurate review
claims, immutable fixture provenance, exact request bindings and evidence.
Untrusted inputs: all submitted JSON, route/capability/path strings, approvals,
lease claims, encoded/nested values and candidate fixture-policy data.
Trusted test base: reviewed source, baseline lock, committed synthetic catalog,
Node runtime and private in-memory store. Same-process arbitrary code execution,
a compromised Node executable, or malicious replacement of source AND lock are
outside Phase 1 assurance and require independent supply-chain review.

| Threat | Phase 1 control | Evidence/limitation |
| --- | --- | --- |
| Forged identity, lease or budget | Exact full-request fixture match; preserve explicit denial transcripts | Synthetic outcomes only; no live attestation verification |
| Target/action substitution | Action SHA-256, target equality, exact request match | Digest is integrity, not authorization |
| Approval or occurrence replay | Atomic single-use tracking in shared memory evidence store | Resets on restart/new store; durable protection is Phase 2 |
| CLI/terminal/UI/hooks/cron/MCP bypass | Only route `fixture`; review-only API; no host I/O imports | Does not repair Herald's underlying alternate routes |
| Nested secret leakage | Recursive rejector plus no unregistered bindings in evidence | Not general Secret Shield certification |
| Policy corruption | Catalog/contract hash mismatch denies | Reviewed lock itself must remain protected |
| Evidence failure | No preview until memory commit/readback; no packet on failure | No production durable evidence claim |
| Input/resource exhaustion | 32 KiB, depth 12, bounded schemas, 256 evidence packets | No concurrency/persistence benchmark |
| Misleading certification | Explicit synthetic source and NOT_INDEPENDENTLY_REVIEWED state | Requires independent reviewer decision |

## Rollback

There is no production attachment to roll back. Close the unmerged PR and
remove the review branch if the owner rejects it; retain the evidence according
to owner policy. Delete only the disposable local checkout when appropriate.
Do not alter HERMES_HOME, jobs, hooks, plugins or production configuration.
If admitted after review, removal consists of removing this unregistered
example and its tests through another PR, without touching live Worker routes.

## Phase 2 admission gates (all currently BLOCKED)

1. Independent governance/VERITY owner review of the exact PR head and evidence;
   explicit human authorization for a separately scoped Phase 2. Phase 1 ALLOW
   is never admission evidence for live execution.
2. Confirm private root-city canon and deployed governance revisions; resolve
   repository license/release status and refresh advisories/SBOM for any actual
   runtime or Herald artifact that would be admitted.
3. Use the existing 54T authority and its supported MCP boundary. Establish an
   independently authenticated authority transport, live Secret Shield,
   containment, approvals, sealed keys and production receipt/replay providers.
   Do not reinterpret beta test MACs or in-memory transcripts as production proof.
4. AEGIS must bind identity, profile, session, mandate, exact action/target,
   policy revision, capability epoch, attenuated lease, expiry, budget,
   approval ancestry and occurrence. Revocation propagates; ASK remains deny
   for effects. Test stale epochs, parent revocation and concurrent replay.
5. Attest an unprivileged disposable execution domain with synthetic data,
   separate policy/evidence ownership, bounded writes, no host home, desktop
   sockets, credential mounts, session bus, clipboard, microphone or display;
   default-deny egress includes localhost and LAN. If this needs new elevation,
   remain blocked under the current mandate.
6. Prove every admitted command route is mediated, including Herald Python,
   Electron IPC, Linux `os`/`os-run`, terminal/subprocesses and delegation.
   Keep hooks, cron, messaging, installers, updates and process control disabled.
7. Supply durable pre-effect receipts, verified readback, independent result
   validation and protected checkpoints. Inject disk-full/crash/retry failures;
   uncertain outcomes halt and reconcile rather than auto-replay.
8. Pin and test actual Hermes client/runtime/plugin versions. Only then evaluate
   an optional disposable UI/Omarchy pilot and rollback against host baselines.
   This PR authorizes none of those launches or installations.
