# DISTRICT COLLECTIVE CELL

A District Collective Cell is a temporary, governed coordination fabric for agents operating inside one Agentropolis district or an explicitly declared cross-district mission.

The useful behavior is intentional coordination: peer discovery, delegation, shared findings, specialist requests, reconciliation, and persistent mission continuity. The failure mode we reject is unauthorized coordination outside the mandate or tool boundary.

## Cell contract

Every cell MUST declare:

- `cell_id`
- `district`
- `mandate_id`
- `operator_or_governor`
- `purpose`
- `allowed_agents`
- `allowed_skills`
- `allowed_tools`
- `evidence_policy`
- `budget`
- `expiry`
- `receipt_policy`

## Lifecycle

```text
PROPOSE -> AUTHORIZE -> DISCOVER -> DELEGATE -> EXECUTE -> RECONCILE -> RECEIPT -> DISSOLVE/RENEW
```

### PROPOSE
Mission Control or a permitted district governor proposes the cell and its bounded objective.

### AUTHORIZE
AEGIS validates authority, risk tier, allowed capabilities, budget and expiry.

### DISCOVER
The cell may discover only agents eligible under the mandate. Discovery is not permission escalation.

### DELEGATE
Work is decomposed into explicit sub-mandates. Each agent receives only the least privilege needed for its task.

### EXECUTE
Agents execute through registered Skills and the governed MCP/execution corridor.

### RECONCILE
Conflicting findings are surfaced. A council may compare evidence, confidence and counterexamples. Consensus is never silently treated as truth.

### RECEIPT
Sentinel-6 records the consequential actions, evidence lineage, participating agents, authority envelope and result.

### DISSOLVE / RENEW
Cells expire by default. Renewal requires a new or extended authorization. Indefinite self-persistence is forbidden.

## Communication

Permitted coordination substrates may include HERMES peer messaging and BUZZ signed events/channels/DMs/workflows. Communication transports coordination state only. It cannot grant tool authority, wallet authority, deployment authority, publishing rights or canon rights.

## Cross-district work

Cross-district cells use the Dispatch Protocol. The originating district does not inherit the destination district's permissions. Each district retains its own policy and evidence rules.

## Hard prohibitions

A cell MUST NOT:

- create undisclosed side channels
- recruit agents outside the authorized eligibility set
- expand its own capability budget
- change its own expiry
- self-promote a learned Skill
- publish or deploy without the appropriate execution corridor
- sign wallets or move funds without explicit financial authority
- mutate verified canon without the applicable governance path
- conceal dissent, failed attempts, or contradictory evidence from the aggregate result

## Minimal receipt

```yaml
cell_id: ...
mandate_id: ...
district: ...
participants: []
subtasks: []
evidence_refs: []
tool_calls: []
policy_decisions: []
conflicts: []
result_ref: ...
started_at: ...
expires_at: ...
status: dissolved
```

## Core principle

**Coordination is a capability. Authority is not.**
