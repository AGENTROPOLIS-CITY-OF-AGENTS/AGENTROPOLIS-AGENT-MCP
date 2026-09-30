# Pi Runtime Adapter

## Decision

Adopt Pi as a governed developer execution adapter under the Agentropolis Intelligence Grid.

Pi is not a sovereign brain, not a replacement for HERMES, and not part of the public Cloudflare Worker execution path. It is an interchangeable coding/runtime substrate that may be selected by Dispatch when policy, budget, model availability, or locality makes it the best fit.

## Placement

```text
Mission Control / HERMES / J-SPACE / developer surfaces
  -> Intelligence Grid / Dispatch
  -> Policy and Risk gate
  -> Credential handle broker
  -> Approved local or sandboxed worker
  -> PiRuntimeAdapter
  -> Pi AgentSession
  -> bounded tools
  -> diff / result
  -> review / approval
  -> commit / PR / deploy lane
  -> execution receipt
```

## Authority modes

### ADVISORY

Tools: `read`, `grep`, `find`, `ls`.

No filesystem mutation. This is the default mode.

### DRAFT

Tools: advisory tools plus `edit`.

Mutation requires explicit policy or operator approval. Output remains inside the approved workspace and must be reviewed before publication or deployment.

### EXECUTE

Tools: draft tools plus `write` and `bash`.

Requires a verified sandbox and explicit approval. Network access, credentials, subprocess behavior, workspace mounts, and all transitive capabilities remain bounded by Agentropolis policy rather than prompt instructions.

## Security rules

1. Pi never receives raw secrets. Models receive scoped credential handles resolved at the worker boundary.
2. Pi may execute only in an approved local, BYOH, container, VM, microVM, or equivalent sandbox worker profile.
3. EXECUTE mode fails closed if sandbox attestation is missing.
4. Workspace identity must be verified before a session starts.
5. Effective tool and subprocess capabilities must be attested before execution.
6. Network egress is governed externally and defaults to policy-controlled access.
7. Capability escalation, sandbox loss, workspace mismatch, raw-secret requests, receipt failure, or revoked authority are kill conditions.
8. The public Agentropolis MCP remains read-only. Pi execution belongs in a separate authenticated execution corridor.
9. Every run emits an Agentropolis receipt envelope including adapter, mode, model, workspace, tool set, authority, sandbox state, and event summary.
10. No Pi extension, custom tool, package, model adapter, or external integration becomes trusted merely because Pi can load it; external components must pass Agentropolis containment and provenance checks first.

## Capability mapping

```text
agentropolis.dev.read  -> read / grep / find / ls
agentropolis.dev.edit  -> edit
agentropolis.dev.write -> write
agentropolis.dev.shell -> bash
```

## Routing doctrine

The Dispatch layer may route developer work to HERMES, Codex, Pi, OpenCode, local models, or other approved runtimes. Selection should consider task capability, cost, latency, privacy, model/tool compatibility, hardware availability, and policy state.

The user should see one Agentropolis task surface while execution engines remain replaceable underneath it.

## Implementation boundary

`src/runtime/pi-runtime-adapter.js` is a host-side scaffold and is deliberately not imported by the Cloudflare Worker entry point. The Worker remains the read-only MCP capability membrane. A future execution worker, CLI, HERMES City worker, or BYOH node can import this adapter where Node filesystem and subprocess capabilities are intentionally available.

The adapter dynamically imports `@earendil-works/pi-coding-agent` so the current public Worker build does not acquire Pi as a runtime dependency. Pinning a tested Pi SDK release belongs in the execution-worker package once that worker is activated.

## Activation checklist

- choose the execution-worker repository or package
- pin and verify the Pi SDK version
- add dependency provenance and checksum evidence
- resolve BYOK credentials through scoped handles
- implement sandbox and workspace attestations
- implement egress allowlists
- wire Pi session events to the Audit Ledger
- produce full execution receipts
- test ADVISORY, DRAFT, and EXECUTE authority boundaries
- run containment tests before enabling EXECUTE
- expose runtime health and routing state to Mission Control

## Non-goals

- no direct Pi shell exposed through the public MCP
- no silent shell execution
- no automatic privilege escalation
- no bypass of review or approval gates
- no replacement of Git as source of truth
- no replacement of Agentropolis memory, policy, identity, trust, or receipt layers
