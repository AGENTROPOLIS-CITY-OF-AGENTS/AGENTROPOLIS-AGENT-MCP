# Claim-to-evidence matrix

All tests live in `tests/herald-fixtures.test.mjs`; test names below are stable
review locators. Raw TAP and hashes are in `evidence/`.

| Claim | Tests/evidence | Scope and verdict |
| --- | --- | --- |
| Bounded synthetic read and file plan | `transcript/bounded_document_read`, `transcript/synthetic_move_plan`, `document result`, `file plan` | PASS fixture scope |
| Identity and lease denial preservation | `transcript/unknown_identity`, `expired_lease`, `revoked_lease`, `lease_target_mismatch` | PASS transcript mapping; live policy BLOCKED |
| All required context is bound | `binding/*`, `lease/*`, `approval digest`, catalog/contract lock test | PASS exact-match boundary |
| Action/target changes cannot gain permission | `action alteration*`, `root target*` | PASS |
| Replay denies | `same occurrence*`, `approval cannot be replayed*` | PASS shared process/store only |
| Budget/expiry denials | `transcript/over_budget`, `expired_request` | PASS transcript mapping; live clock/accounting BLOCKED |
| ASK never authorizes or previews | `ASK remains non-executing*`, all transcript assertions | PASS |
| Evidence failure withholds preview | `evidence/*`, `absent or arbitrary evidence*`, `bounded evidence store*` | PASS injected memory failures; durability BLOCKED |
| Corrupt fixture policy cannot fall back to allow | `policy/catalog corruption*`, `contract and catalog*` | PASS reviewed-lock integrity only |
| Nested input does not leak | `secrets/*`, `unregistered innocently named*` | PASS supplied cases; general Secret Shield BLOCKED |
| No execution routes or host I/O | `route/*`, `capability/*`, `path/*`, `adapter exposes review only`, `fixture modules import no host I/O` | PASS Phase 1 API/source boundary; Herald bypass repair BLOCKED |
| Strict versioned contracts | `strict contracts*`, malformed inputs, duplicate keys | PASS supported vocabulary only |
| Receipt provenance/correlation | `denial receipts are correlated*`, lock and sample packets | PASS unkeyed hashes; independent attestation BLOCKED |
| Existing production code unchanged | 216 baseline blob hashes checked; only integration and one new root test file added | PASS local comparison |
| Existing regression suite | Recorded full-suite TAP and validate outputs | PASS local Node 24; remote CI recorded separately |
| No added third-party dependencies | Import review; unchanged package/lockfiles | PASS; owner licensing disposition BLOCKED |
| Independent VERITY acceptance | `VERITY-REVIEW.md` | BLOCKED, author packet only |

The transcript assertions demonstrate that the adapter preserves synthetic policy
outcomes. They do not independently validate those outcomes against a live
AEGIS/54T implementation. In-process replay and memory evidence do not satisfy
production persistence, restart recovery, concurrent authority or sealed-key gates.
