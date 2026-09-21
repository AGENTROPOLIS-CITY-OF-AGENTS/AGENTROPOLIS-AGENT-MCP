# FASTPATH + Capability Acquisition Gate

Status: governed integration contract

AGENTROPOLIS-AGENT-MCP owns the capability membrane. Hermes may discover or connect a missing MCP capability during an active task, but connectivity does not create execution authority.

## Corridor

```text
HERMES PLAN
  -> capability need
  -> AGENT-MCP discovery
  -> minimum useful tool surface
  -> user approval
  -> AEGIS scope approval
  -> connection / health check
  -> capability acquisition receipt
  -> resume task
```

## Required receipt

Every dynamic connection used by a governed task should emit:

- capability ID
- source type: MCP, skill, or connector
- connection ID
- exact tool surface
- permission scope
- user approval state
- AEGIS approval state
- acquisition timestamp
- optional expiry
- `grantsExecutionAuthority=false`

## FASTPATH relationship

FASTPATH specialists such as CUA-S1 are bounded decision engines. They may map known values to UI fields or choose among constrained actions, but they do not receive authority merely because AGENT-MCP exposes a tool.

## Security laws

- discovery is not authority
- connectivity is not permission
- tool presence is not mandate scope
- specialist confidence is not approval
- new write-capable tools remain behind AEGIS / Execution Envelope controls
- least privilege is mandatory
- consequential actions must remain receiptable
- capability acquisition must not silently widen an existing AuthorityLease

For economic work, AGENTROPOLIS-ARC consumes the acquisition receipt only as provenance. PAYRAIL, AEGIS, treasury controls, and the Execution Envelope remain authoritative.
