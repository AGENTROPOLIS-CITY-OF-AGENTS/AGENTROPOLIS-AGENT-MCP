# Governed Fleet Execution Capability Lane

**Status:** architecture contract, not a declaration that mutating public MCP tools are already registered.

AGENTROPOLIS-AGENT-MCP is the capability and adapter boundary for fleet execution. ATG:FLEET defines semantics; Utility Grid schedules and meters; AEGIS controls risk; Dock admits runtimes; Mission Control owns human controls; Sentinel-6 verifies.

This document deliberately does **not** add mutating tools to the current public read-only MCP surface.

## Capability families

A future authenticated fleet adapter may expose bounded capabilities equivalent to:

```text
fleet.inspect
fleet.plan
fleet.cell.prepare
fleet.cell.dispatch
fleet.cell.pause
fleet.cell.resume
fleet.cell.revoke
fleet.cell.status
fleet.verify
fleet.integration.prepare
fleet.receipt.read
```

Names above are contract vocabulary. They are not proof that deployed endpoints exist.

## Registration requirements

Before any mutating fleet capability is registered, require:

- explicit implementation owner;
- ATG:FLEET request/response schema;
- AEGIS policy profile and risk review;
- approved runtime/harness adapters;
- operation-level authority checks;
- credential isolation;
- origin/destination controls where remote execution is used;
- idempotency/replay semantics for consequential actions;
- bounded cost/concurrency controls;
- receipt schema and Audit Ledger correlation;
- Sentinel-6 pressure tests;
- operator pause/revoke/kill integration;
- rollback/recovery semantics;
- versioned compatibility tests.

## Capability boundary

The adapter receives a compiled request. It must not infer authority from:

- agent identity alone;
- presence of a worktree or branch;
- model/provider capability;
- a successful previous task;
- tool discovery;
- network connectivity;
- a Context Capsule;
- a worker claiming that a reviewer approved the work.

Every mutating operation must resolve against current machine-enforced authority.

## Worktree and workspace adapters

The capability membrane may normalize implementations such as:

- Git worktrees;
- disposable repository clones;
- containers;
- VMs;
- remote developer workspaces;
- Hermes worktree execution;
- Devin workspaces;
- governed NemoClaw/Nemotron execution;
- other admitted harnesses.

The normalized contract should expose observable properties rather than provider branding:

```text
workspace_id
baseline_ref
mutation_ref
write_scope
isolation_profile
runtime_route
lease_ref
created_at
expires_at
state
```

## Shared developer services

Fleet adapters may consume shared language servers, indexes, package caches, compiler caches, static analyzers, and other developer services only through approved scoped interfaces. Shared infrastructure must not expose another execution cell's writable state or credentials.

## Public MCP boundary

The existing public MCP remains read-only unless a separately reviewed change explicitly alters that posture. Fleet inspection and architecture manifests may eventually be exposed read-only, but branch mutation, workspace creation, dispatch, pause/revoke, integration, deployment, or secret-bearing operations belong behind authenticated execution corridors.

## Receipt requirements

A mutating adapter receipt should capture at least:

- capability invoked;
- actor and mandate reference;
- Execution Envelope and risk-decision references;
- run/cell IDs;
- baseline;
- workspace/branch/ref;
- requested and effective scope;
- runtime route and capability epoch;
- result state;
- artifacts or commit refs;
- cost/resource telemetry when available;
- verification requirement;
- denial/escalation reason when not executed;
- audit correlation.

## Standing rule

> The MCP can carry a fleet command. It cannot invent the authority to issue one.
