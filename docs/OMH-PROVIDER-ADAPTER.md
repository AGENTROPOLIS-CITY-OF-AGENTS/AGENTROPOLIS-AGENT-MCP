# Agent MCP: OMH Provider Adapter

Expose Oh My Hermes through a normalized workflow-provider adapter rather than leaking OMH-specific semantics into MCP consumers.

## Logical operations

- `workflow.capabilities`: read-only provider/version/capability discovery
- `workflow.plan`: plan without side effects
- `workflow.execute`: execute only under validated mandate/policy
- `workflow.status`: normalized state/evidence references
- `workflow.cancel`: stop bounded work

## Normalized states

`PLAN_NOT_RUN | RUNNING | REPORTED_DONE | VERIFIED | DENIED | FAILED`

The adapter must not issue VERIFIED based solely on OMH/executor testimony. Sentinel-6 or another independent verifier owns promotion to VERIFIED.

## Request envelope

Require request_id, identity reference, mandate_id, objective, policy context, allowed tools/data scopes, budget/deadline and optional provider preference.

## Result envelope

Return provider/version, executor/model, state, evidence refs, changed resources, denied actions, cost and timestamps.

Do not expose provider secrets through MCP resources, logs or receipts.