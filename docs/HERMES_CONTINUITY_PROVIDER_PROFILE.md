# Hermes Continuity Provider Profile

Status: PROFILE / CANARY
Relationship: ADAPTER
Authority source: Continuity Plane + Context Capsule contract
Execution authority: none

## Purpose

Define how Hermes may participate in cross-runtime continuation without turning a runtime session, imported transcript, messaging surface, or provider-specific handoff into Agentropolis authority.

Hermes is a continuity provider. Agentropolis owns the portable continuity contract.

## Supported canary paths

The first validation lane covers:

```text
Claude Code session
  -> Hermes import
  -> bounded Context Capsule
  -> Hermes profile
  -> Telegram handoff
  -> continued work
  -> desktop/CLI resume
  -> receipt comparison
```

A second lane SHOULD repeat the same test with Codex as the source runtime.

## Continuity envelope

Every handoff SHOULD preserve or explicitly redact these fields:

```yaml
continuity_version:
continuity_id:
request_id:
source_runtime:
source_session_ref:
target_runtime:
target_surface:
agent_identity_ref:
mandate_ref:
workspace_ref:
objective:
decisions: []
constraints: []
unresolved_questions: []
evidence_refs: []
artifact_refs: []
tool_state_refs: []
authority_fingerprint:
redactions: []
created_at:
expires_at:
source_receipt_ref:
target_receipt_ref:
```

Raw credentials, bearer tokens, private keys, hidden chain-of-thought, provider secrets, and unrestricted tool handles MUST NOT enter the capsule.

## Security invariants

1. Imported session history is untrusted context, not permission.
2. Imported history MUST cross the Ingest Membrane before it can influence consequential execution.
3. A handoff MUST NOT increase mandate, tool authority, wallet authority, filesystem scope, network scope, or approval level.
4. Target surfaces MUST be allowlisted by policy.
5. Stable semantic identities MUST be used instead of treating ephemeral terminal, tab, topic, or thread IDs as identity.
6. `request_id` MUST be idempotent for a handoff attempt.
7. Missing, ambiguous, or mismatched delivery receipts MUST fail closed.
8. Context loss, redaction, and unsupported fields MUST be explicit in the receipt.
9. Returned channel content remains external input and is subject to normal provenance and injection defenses.
10. Runtime continuity never changes canonical ownership defined elsewhere in Agentropolis.

## Receipt contract

A successful handoff receipt SHOULD record:

```yaml
continuity_id:
request_id:
source_runtime:
target_runtime:
target_surface:
source_session_ref:
target_session_ref:
workspace_ref:
mandate_ref:
authority_fingerprint_before:
authority_fingerprint_after:
redaction_count:
context_items_sent:
context_items_accepted:
context_items_rejected:
receipt_status:
started_at:
completed_at:
```

`authority_fingerprint_before` MUST equal `authority_fingerprint_after` unless a separate, explicit, approved authority-changing workflow occurred outside the continuity operation.

## Canary pass criteria

The Hermes continuity canary passes only if all are true:

- same objective is preserved
- same workspace/project is preserved or intentionally remapped
- provenance remains attributable to the source runtime
- no secret is transferred unexpectedly
- authority does not increase
- unsupported context is reported rather than silently dropped
- destination identity is verifiable
- source and target receipts correlate by `continuity_id` and `request_id`
- resumed work can identify prior decisions and unresolved questions without inventing missing state
- rollback can return to the pre-handoff state

## Failure states

Use explicit terminal states:

```text
DELIVERED
PARTIAL
REJECTED
EXPIRED
DESTINATION_UNAVAILABLE
RECEIPT_MISSING
AUTHORITY_MISMATCH
PROVENANCE_MISMATCH
SECRET_POLICY_BLOCK
INGEST_POLICY_BLOCK
```

A `PARTIAL` handoff is not equivalent to success for workflows that require complete state transfer.

## Provider neutrality

The contract MUST remain usable when either side is Hermes, Codex, Claude Code, Devin, NemoClaw/Nemotron, BotBae, or another admitted runtime. Provider-specific commands belong in adapters, not in the canonical capsule schema.

## Smallest implementation step

Run one read-only/bounded canary using a non-sensitive repository and synthetic test session. Record the complete before/after capsule and receipts. Do not grant production credentials or consequential execution authority during the first canary.
