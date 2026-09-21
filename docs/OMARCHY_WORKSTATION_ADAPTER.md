# Omarchy Workstation Adapter

## Purpose

This adapter makes an Omarchy workstation usable as a governed local execution environment for AGENTROPOLIS without turning the workstation into an authority root.

Omarchy provides local developer/operator ergonomics. AGENTROPOLIS provides authority, policy, capability brokerage, verification, receipts, and audit.

## Canonical path

```text
Human / Mission Control
  -> Omarchy workstation
  -> HERDR managed workspace
  -> AGENTROPOLIS-AGENT-MCP local capability membrane
  -> Builder Commons Local Dock
  -> Hermes orchestration
  -> Codex / approved specialist worker
  -> AEGIS / 54T / VERITY
  -> receipt + audit
```

## Machine profile

`createOmarchyMachineProfile()` creates a descriptive profile only.

A profile:
- starts `quarantined` and `offline` by default;
- never sets execution authority;
- uses an opaque `machine_profile_id`;
- carries capability names, not raw credentials;
- can be projected into Builder Commons without exposing credential references.

## Trust and connectivity

Trust:
- quarantined
- verified
- degraded
- revoked

Connectivity:
- offline
- live
- stale

Compute may be advertised only when:
- host environment is Omarchy;
- trust state is `verified`;
- connectivity is `live`; and
- `compute.advertise` is declared.

Advertisement is still descriptive. Reservation and execution require separate governed capability checks.

## Security rules

**MACHINE ACCESS != AUTHORITY.**

Never infer execution permission from:
- local login;
- shell presence;
- repo checkout;
- desktop launcher;
- local user/group membership;
- runtime availability;
- browser session; or
- network reachability.

The local adapter must not expose raw:
- API keys;
- SSH keys;
- wallet secrets;
- browser cookies;
- environment variables;
- Docker socket access;
- unredacted terminal history; or
- private agent memory.

## Runtime roles

- Hermes: orchestration and persistent mission coordination
- Codex: software engineering worker
- Grok or other creative worker: optional bounded review/creative lane
- VERITY: evidence validation
- 54T: assurance orchestration
- AEGIS: policy/risk gate

Worker identity never implies authority.

## Continuity

Omarchy can host the local workspace used for cross-runtime continuation, but the durable handoff should use a bounded Context Capsule containing references, decisions, constraints, task state, tests, and receipt/evidence links.

Do not put secrets, unrestricted transcripts, or hidden reasoning into Context Capsules.

## Portability

Omarchy is an approved workstation implementation, not a platform dependency. The same contract can be implemented for Ubuntu, macOS, Windows, DGX, edge nodes, and cloud workstations.
