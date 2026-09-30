# Future Capability Fabric Boundary

Status: CANONICAL DIRECTION

AGENTROPOLIS-AGENT-MCP is an execution environment and adapter surface. It is not the permanent architecture, and MCP itself is not assumed to be permanent.

## Future-facing abstraction

AGENTROPOLIS routes governed work through a Capability Fabric that can include:

- MCP tools;
- future tool protocols;
- local applications and binaries;
- browsers;
- models;
- agents and collectives;
- cloud and local compute;
- devices, sensors, robots, and vehicles;
- APIs and external services;
- storage and networks.

MCP is one transport/adapter family beneath that abstraction.

## Canonical relationship

```text
AGENT-ENTITY
  -> ATG / Atralith expression
  -> Execution Envelope
  -> capability discovery + eligibility
  -> governed adapter / runtime
  -> result + evidence
  -> receipt
  -> audit / world-state update
```

## Economic boundary

ATG may express economic intent and constraints. AGENT-MCP may transport or execute approved calls, but it does not own settlement routing.

Economic execution crosses into the Economic Fabric and PAYRAIL:

```text
ATG economic intent
  -> Execution Envelope
  -> AEGIS / economic policy
  -> PAYRAIL
  -> Arc / Base / XRPL / bank / future settlement adapter
  -> verified receipt
```

## AGENT-ENTITY boundary

A runtime session, MCP connection, model session, wallet connection, or application session is not an AGENT-ENTITY.

AGENT-ENTITY persists above replaceable runtime and transport implementations.

## Standing rule

> Protocol connectivity advertises capability. It never grants authority. AGENTROPOLIS owns the entity, mandate, policy, execution, receipt, continuity, and audit contracts above replaceable adapters.
