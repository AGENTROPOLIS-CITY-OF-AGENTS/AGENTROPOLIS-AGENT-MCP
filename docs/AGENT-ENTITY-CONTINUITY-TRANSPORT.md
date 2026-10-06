# AGENT-ENTITY Continuity Transport

AGENT-MCP may transport governed identity and runtime-binding references across capability boundaries. It does not mint identity truth.

## Transportable references

- `agent_entity_id`
- Agent DID
- `runtime_binding_id`
- mandate reference
- capability request reference
- policy decision reference
- receipt reference

## Prohibited transport

Raw private keys, bearer tokens, sealed credentials and unrestricted continuity payloads MUST NOT be copied into MCP tool arguments or public receipts.

## Invariants

```text
MCP CONNECTED != IDENTITY VERIFIED
MCP CAPABILITY LISTED != AUTHORIZED
MCP SESSION != AGENT-ENTITY
```

Where supported, receipts SHOULD bind material tool execution to both the persistent entity and the active runtime binding.
