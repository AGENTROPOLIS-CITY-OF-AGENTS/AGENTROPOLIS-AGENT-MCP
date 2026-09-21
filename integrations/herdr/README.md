# HERDR Runtime Adapter

HERDR is an optional local execution-runtime adapter for AGENTROPOLIS. It provides persistent terminal workspaces, panes, session continuity, and observable coding-agent lifecycle state without becoming a required core dependency.

## Placement

```text
HERMES / AGENTROPOLIS operator
  -> capability gateway
  -> policy + 54T / Swarm Immune checks
  -> HERDR adapter
  -> local HERDR server/socket
  -> Codex / Hermes / Claude / OpenCode / other supported agents
```

The public Cloudflare MCP remains read-only. Raw HERDR socket access, pane control, process control, and terminal execution are never exposed through the public MCP surface.

## Capability contract

The adapter normalizes HERDR operations behind AGENTROPOLIS capabilities:

- `runtime.agent.list`
- `runtime.agent.read`
- `runtime.agent.prompt`
- `runtime.agent.wait`
- `runtime.agent.spawn`
- `runtime.pane.list`
- `runtime.pane.read`
- `runtime.pane.run`
- `runtime.pane.wait`
- `runtime.session.inspect`

High-impact or destructive runtime actions remain denied by default.

## Omarchy host evidence

Omarchy is a supported Linux host and launcher surface. It does not grant agent or financial authority.

The production adapter can build a bounded Omarchy + HERDR evidence object only when all of the following are true:

- the caller is inside a complete HERDR-managed session;
- the current HERDR pane matches the inherited pane;
- a Utility Grid machine profile is supplied;
- the machine profile is `verified`, `live`, Linux, and not stale;
- the profile explicitly advertises `host.omarchy`, `runtime.hermes`, `workspace.dispatch`, and `receipts.machine-scoped`;
- a bounded Hermes mission identifier is supplied.

The evidence object contains identifiers, verification state, capabilities, timestamps, and a digest. It excludes credentials, socket paths, private keys, raw terminal transcripts, and secrets.

This closes the canonical path:

```text
Omarchy host
  -> Utility Grid machine profile
  -> HERDR managed workspace
  -> Hermes mission
  -> AGENT-MCP bounded evidence
  -> consumer policy / Execution Envelope
```

The machine profile remains owned by Utility Grid. AGENT-MCP verifies and transports bounded evidence; it does not invent machine trust.

## Lifecycle normalization

HERDR lifecycle states are normalized as:

| HERDR | AGENTROPOLIS runtime state |
| --- | --- |
| `working` | `working` |
| `blocked` | `blocked` |
| `done` | `done` |
| `idle` | `idle` |
| `unknown` | `unknown` |

These state transitions may be consumed by HERMES WATCHTOWER and the Workflow Genome as observable execution evidence. A lifecycle transition is evidence of agent activity, not proof that a task outcome is correct.

## 3D Swarm Room mapping

- HERDR workspace -> project/district workroom
- HERDR tab -> room lane or operational view
- HERDR pane -> workstation
- HERDR agent -> persistent agent avatar
- `working` -> active workstation
- `blocked` -> human-attention signal
- `done` -> completion signal pending verification
- `idle` -> available/settled
- `unknown` -> uncertain state, never promoted as success

## Security invariants

1. HERDR is optional and replaceable.
2. No raw secrets enter agent context.
3. No raw HERDR socket path or bearer credential is exposed to remote consumers.
4. Capability-scoped operations are preferred over shell passthrough.
5. Public remote MCP remains read-only.
6. Destructive session/server controls are denied by default.
7. Every governed runtime action should emit an action receipt.
8. WATCHTOWER may observe behavior but must not infer correctness from agent self-report.
9. Verified workflow promotion requires external evidence such as tests, receipts, objective task completion, or human approval.
10. HERDR output is untrusted runtime telemetry until normalized and screened.
11. Omarchy being the default desktop/terminal environment never expands the Execution Envelope.
12. A declared machine profile is not trusted unless Utility Grid marks it verified and fresh.

## Local prerequisites

- HERDR installed locally.
- The target agent is launched inside a HERDR-managed pane.
- `HERDR_ENV=1` is present for in-pane control.
- AGENTROPOLIS local execution corridor is enabled.

For Hermes Agent session continuity, install the upstream HERDR Hermes integration locally:

```bash
herdr integration install hermes
```

For Codex:

```bash
herdr integration install codex
```

Do not run upstream install scripts automatically from AGENTROPOLIS production code. Installation remains an explicit operator action.

## Runtime receipt shape

A normalized receipt should include at minimum:

```json
{
  "runtime": "herdr",
  "capability": "runtime.agent.prompt",
  "workspace_id": "w1",
  "pane_id": "w1:p3",
  "agent_name": "reviewer",
  "state_before": "idle",
  "state_after": "done",
  "policy_state": "allowed",
  "verification_state": "unverified",
  "timestamp": "RFC3339"
}
```

No receipt may include raw credentials, tokens, environment secrets, or full sensitive terminal transcripts by default.

## Beta acceptance criteria

- Detect HERDR availability without mutation.
- Enumerate workspaces/panes/agents through explicit handles.
- Normalize agent lifecycle states.
- Read bounded terminal output with truncation metadata.
- Prompt/wait only through capability-gated local execution.
- Emit receipts for governed actions.
- Preserve public MCP read-only authority.
- Confirm HERMES session restore path locally.
- Confirm Codex session restore path locally.
- Feed WATCHTOWER only normalized runtime events.
- Require external verification before any Workflow Genome promotion.
- Produce bounded Omarchy + HERDR host evidence from a verified Utility Grid machine profile.
