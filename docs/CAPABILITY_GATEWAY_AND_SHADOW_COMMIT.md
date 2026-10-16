# Capability Gateway and Shadow Commit

AGENTROPOLIS-AGENT-MCP is the governed capability membrane between isolated civic applications and external resources. AEGIS issues the enforceable policy decision; Agent MCP issues capabilities, binds principals, enforces permissions, controls commits, and produces execution receipts. HERMES presents approvals but never grants its own authority.

## Default rule

Agents and applications receive no ambient connector access. Every resource introduction must identify the account, resource, scope, permitted actions, duration, budget, and approval class, and must bind the requesting principal.

## Capability namespace

```text
civic.app.build
civic.app.preview
civic.app.request_capability
civic.app.simulate_action
civic.app.submit_approval_bundle
civic.app.revalidate_action
civic.app.commit_action
civic.app.read_receipt
```

## Execution classes

- Observe: bounded reads only
- Analyze: local transformation and scoring
- Draft: produces proposed content or mutations
- Simulate: changes shadow state only
- Commit: performs an approved external mutation

Commit is never implied by any lower class.

## Capability grant binding

Every capability grant must bind all of the following fields:

```text
human_principal_id
agent_principal_id
application_id
workspace_id
session_id
external_account_id
resource_id
permitted_actions
scope
budget
issued_at
expires_at
revocation_state
policy_receipt_id
```

Every invocation must prove that the caller matches the intended capability principals. A capability ID shared, stolen, or reused across principals is invalid even if the token authenticates.

## Approval evidence binding

Approval evidence must bind the exact simulated operation:

```text
capability_id
human_principal_id
agent_principal_id
application_id
workspace_id
external_account_id
resource_id
normalized_action_digest
simulation_hash
predicted_resource_version
approval_class
approver_identities
issued_at
expires_at
idempotency_key
policy_receipt_id
```

Any change to a bound field invalidates the approval. An approval cannot be replayed against a different resource, action, predicted version, or simulation.

## Shadow Commit contract

A simulated response must be labeled simulated, carry the predicted resource version, and remain isolated from the real service.

Before commit, the gateway must revalidate identity, capability validity, external resource version, policy, budget, and approval. The version condition must be applied atomically with the mutation — a separate preflight version check is not sufficient.

### Commit corridor

The commit corridor must support:

- Atomic version preconditions: compare-and-swap, `If-Match`, transaction locks, provider revisions, or an equivalent mechanism applied atomically with the mutation.
- Stable idempotency keys.
- Replay detection.
- Returning the original result for a repeated successful commit request.
- Fail-closed behavior when atomicity is unavailable.
- Short-lived capability handles.
- Revocation checks at execution time.
- Actual-versus-simulated result comparison after each dependent action; drift halts the remaining bundle and requires re-approval or compensation.
- Receipts for success and all non-success terminal outcomes: denied, cancelled, expired, failed, revoked, revalidation blocked, rolled back.

### Budget reservation

Budget must be reserved atomically and tied to the commit idempotency key before provider invocation. An advisory budget recheck is not sufficient; concurrent commits must not be able to collectively exceed the approved ceiling.

### Pending receipt

A durable pending receipt (intent record carrying the receipt ID) must be persisted before provider invocation, then finalized or reconciled afterward. A successful external mutation must never be left without a durable receipt because the process or receipt store failed.

### Post-commit validation

After commit, validate the external state against the approved simulation. When the observed state differs (partial mutation, unexpected version, or normalization drift), roll back or quarantine and emit a receipt. A provider success response alone does not prove the approved outcome occurred.

## Fail-closed rule

Hard authorization failures — unverifiable identity, expired capability, revoked capability, or a failed mandatory gate — produce denial or quarantine, perform no privileged action, expose no secrets, and create a denial receipt. They are not returned to HERMES as reviewable drift. Only correctable resource drift (version mismatch, changed external state) may return to HERMES for review.

## Receipt requirements

Receipts record capability ID, resource reference, requested action, normalized action digest, simulation hash, predicted resource version, approval evidence reference, approval class, approver identities, idempotency key, revalidation result, commit result, timestamps, policy decision, drift result, and rollback status. Receipts are written for success and every non-success terminal outcome. Secrets and raw bearer tokens are prohibited.
