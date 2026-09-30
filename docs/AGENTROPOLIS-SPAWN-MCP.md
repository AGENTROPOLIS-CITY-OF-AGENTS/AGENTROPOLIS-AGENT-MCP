# Agentropolis Spawn MCP Contract

`AGENTROPOLIS-AGENT-MCP` exposes bounded, receipt-backed tools for the Agentropolis project spawn corridor.

Construction is owned by `AGENTROPOLIS-CREATOR` as a CREATOR function through RCP. Agent MCP does not become the construction authority. It gates tool access, validates authority, invokes approved adapters when authorized, and records execution evidence.

## Canonical corridor

```text
Docking intake
  -> spawn_request
  -> CREATOR Construction / RCP
  -> Agent MCP bounded tools
  -> HERMES-CITY preview/runtime
  -> BE verification
  -> release proposal
```

## Recommended tool surface

### spawn_plan
Read-only. Returns semantic classification, target Agentropolis role, required contracts, estimated capability needs, and unresolved authority/rights questions.

### spawn_validate
Read-only. Validates provenance, source identity, rights state, RCP compatibility, required scene metadata, camera/fallback declaration, and target runtime bindings.

### spawn_compile_dry_run
Non-deploying. Produces a proposed RCP Agentropolis Spawn package without mutating the source repository or publishing a runtime.

### spawn_preview
Bounded write. Requests a temporary preview only when an authoritative execution receipt grants the required capability. Provider invocation remains governed by existing readiness and canary controls.

### spawn_release_proposal
Proposal-only. Assembles a release packet and BE evidence bundle. It MUST NOT silently deploy or merge source changes.

### spawn_status
Read-only. Returns lifecycle state, receipt chain, BE findings, preview/runtime targets, provenance, and unresolved blockers.

## Authority rules

- Source ownership is preserved.
- Write authority is fail-closed.
- Provider invocation, deployment, source-repo mutation, and release require explicit existing execution authority.
- A valid spawn request does not itself authorize execution.
- External providers and model adapters remain replaceable.
- The tool surface MUST distinguish `DRY_RUN`, `CANARY`, and `LIVE` execution state.

## Spatial requirements

Spawn validation should check for:

- stable `agentropolis_spawn_id`;
- `agentropolis.spatial-scene.v1` compatible manifest;
- orthographic overview by default or documented exemption;
- optional authored perspective/cinematic camera path;
- WebGL baseline;
- reduced-motion and no-WebGL fallback;
- progressive rendering tier;
- semantic object mapping;
- truthful telemetry state;
- BE receipt/evaluation target.

## Evaluator rule

BE is the system evaluator for spawned Agentropolis forms. ASBE remains scoped to the Entertainment District.

## Non-goal

Agent MCP is not a city generator by itself. It is the governed callable boundary through which Docking, CREATOR, HERMES-CITY, Mission Control, and approved agents coordinate spawn operations.
