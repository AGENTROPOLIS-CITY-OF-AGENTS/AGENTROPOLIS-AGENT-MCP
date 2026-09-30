# AGENTROPOLIS GRIDKIT

GRIDKIT is the installable operating kit for agents attached to the Agentropolis Intelligence Grid.

It borrows the useful category pattern demonstrated by modern agent harness kits such as ECC — agents, skills, commands, hooks, MCP configuration, memory, continuous learning, and cross-harness adapters — but implements those ideas as Agentropolis-native governed infrastructure rather than copying another project's runtime assumptions.

## Why GRIDKIT exists

A coding agent should not need a new operating doctrine every time the operator changes harnesses. The same is true for research, media, commerce, security, recruitment, and district work.

GRIDKIT packages reusable intelligence once and projects it into supported runtimes while preserving Agentropolis authority rules.

```text
MISSION CONTROL
     |
     v
AGENTROPOLIS GRIDKIT
     |
     +-- agents/          specialized workers and councils
     +-- skills/          CHAOS SKILL contracts
     +-- commands/        ergonomic entry points / compatibility shims
     +-- hooks/           local enforcement and validation triggers
     +-- policies/        AEGIS authority envelopes
     +-- memory/          continuity and learning contracts
     +-- adapters/        harness-specific projections
     +-- mcp/             governed capability attachments
     +-- receipts/        Sentinel-6 evidence contracts
     +-- collectives/     bounded district coordination
     |
     v
AGENTROPOLIS AGENT MCP -> D1 RECEIPT -> SENTINEL-6 / AEGIS
```

## Design rules

1. **Skills first.** Commands are convenience shims, not the canonical intelligence unit.
2. **Runtime portable.** Hermes, Codex, Claude Code, NemoClaw/Nemotron, BotBae, OpenCode, Cursor, Gemini and future harnesses receive adapters, not forks of the architecture.
3. **Authority is runtime constrained.** A prompt cannot grant a skill more authority than its policy envelope.
4. **Learning proposes; governance promotes.** Repeated patterns may become candidate skills, but no agent may silently self-install, self-publish, mutate canon, or expand its own permissions.
5. **District collectives are bounded.** Agents may discover peers, delegate work, share findings and coordinate, but only inside a declared mandate, capability budget, expiry window and receipt chain.
6. **Receipts are mandatory for consequential work.** The system must be able to explain what ran, with which authority, against which evidence, and what changed.
7. **BUZZ is collaboration, not authority.** Human/agent channels, events and workflows may carry coordination signals but never bypass Identity -> Mandate -> Policy -> Tool permission -> Execution -> Receipt -> Audit.

## Initial surfaces

### Agents

Starter roles should cover planning, architecture, implementation, verification, security, research, memory, routing, district stewardship and incident response. Districts can publish additional specialist agents without changing the core harness.

### Skills

Skills follow the CHAOS SKILL contract: one job, explicit triggers, explicit requirements, predictable outputs and declared handoffs.

### Continuous learning

GRIDKIT can inspect approved session summaries, Git history, diffs, issue/PR patterns, test failures and operator corrections. It extracts candidate patterns with provenance and confidence. Candidates enter a quarantine queue and require evaluation before registry promotion.

### District collectives

Each district can instantiate a temporary Collective Cell. Cells can:

- discover eligible agents
- assign bounded sub-tasks
- request specialist help
- share source-backed findings
- reconcile conflicting outputs
- emit an aggregate result

Cells cannot:

- increase their own permissions
- create hidden communication channels
- bypass AEGIS
- publish, pay, sign, deploy or mutate canon without the required execution corridor
- persist indefinitely without an operator-approved mandate

## Runtime targets

| Target | Role |
| --- | --- |
| Hermes | mission-control orchestration, durable bots, peer coordination, cron/continuity |
| Codex | coding and repo execution adapter |
| Claude Code | coding harness adapter |
| NemoClaw / Nemotron | sovereign/local runtime and model lane |
| BotBae | first-class agent/application surface |
| OpenCode | portable coding harness adapter |
| Cursor | IDE harness adapter |
| Gemini | model/harness adapter |
| BUZZ | collaboration, signed events, channels, DMs, workflows and audit relay |

## Promotion loop

```text
observe -> extract -> candidate -> quarantine -> evaluate -> approve -> register -> measure -> evolve
```

No candidate becomes a trusted Skill merely because it was repeated often.

## Status

Foundation scaffold. The authoritative execution surface remains the Agentropolis Agent MCP capability membrane. GRIDKIT must attach to that membrane rather than routing around it.
