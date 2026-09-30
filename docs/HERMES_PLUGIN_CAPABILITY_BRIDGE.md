# Hermes Plugin Capability Bridge

## Role

Hermes is an AGENTROPOLIS capability runtime and plugin host.

AGENTROPOLIS-AGENT-MCP exposes those capabilities to the Grid without allowing the runtime or plugin catalog to become the authority layer.

Canonical relationship:

```text
Human / Agent Intent
  -> BotBae or application surface
  -> Skill Registry / Capability Registry
  -> ATG dispatch + risk compile
  -> Execution Envelope
  -> MCP Capability Membrane
  -> Hermes runtime
  -> approved plugin/tool
  -> receipt
  -> Audit Ledger
```

Hermes supplies muscles. AGENTROPOLIS supplies identity, mandate, policy, routing, continuity, receipts, and audit.

## CapabilityRecord

Every imported Hermes plugin should normalize into an AGENTROPOLIS `CapabilityRecord`.

Minimum fields:

```yaml
capability_id: hermes:<plugin-name>
source_runtime: hermes
source_catalog: nous-hermes-plugin-catalog
plugin_name: <catalog key>
plugin_repo: <https repo>
plugin_sha: <40-char pinned sha>
plugin_tier: official|community
category: <catalog category>
requires_hermes: <version constraint>
platforms: []
provides_tools: []
provides_hooks: []
provides_middleware: []
requires_env: []
provenance_status: verified|unverified|blocked
assurance_status: pending|approved|restricted|denied|revoked
risk_tier: low|medium|high|critical
district_owner: <district>
execution_modes: [attended]
credential_classes: []
network_scope: []
filesystem_scope: []
process_scope: []
device_scope: []
receipt_required: true
capability_epoch: <hash/version>
```

Do not copy secret values into records.

## Catalog ingest rules

The Hermes catalog is an upstream trust signal, not a replacement for AGENTROPOLIS assurance.

Ingest must:
- preserve exact pinned SHA
- preserve upstream repository and maintainer metadata
- preserve declared tools, hooks, middleware, environment requirements, platform constraints, and Hermes version requirements
- compute an AGENTROPOLIS capability fingerprint
- assign district ownership
- send the candidate through Skill Install Assurance / Sentinel / AEGIS
- reject capability drift between declared and observed behavior
- mark removals/revocations so stale catalog identifiers cannot silently reactivate

No auto-install merely because a plugin appears in the Hermes catalog.

## Discovery contract

Expose plugin-backed capabilities through the same discovery path as Skills and MCP tools.

Recommended logical operations:

```text
capability.search(intent, district, risk, platform)
capability.describe(capability_id)
capability.assurance(capability_id)
capability.resolve_runtime(capability_id)
capability.compile_binding(capability_id, mandate_ref)
capability.receipts(capability_id)
```

BotBae and applications should discover capabilities through this contract rather than querying the Hermes catalog directly for authority decisions.

## District Capability Packs

A District Capability Pack is a declarative collection of approved capability IDs with policy overlays.

Recommended initial packs:
- `voice-gateway`
- `media-production`
- `fifty4-tailors`
- `gaming-runtime`
- `continuity-memory`
- `business-operations`
- `sentinel-security`

A pack may simplify discovery and installation, but it must resolve to individual CapabilityRecords and individual assurance states.

## Execution rules

Before invocation:
1. resolve citizen identity and mandate
2. resolve CapabilityRecord and current assurance state
3. compile operation-level grants
4. bind credential class and secret broker reference
5. bind plugin SHA/capability epoch
6. compile approval requirements
7. invoke through Hermes under the Execution Envelope
8. capture result and external effects
9. emit a signed receipt

The MCP layer must fail closed when plugin identity, SHA, assurance state, permission scope, or runtime identity is ambiguous.

## Anti-duplication

Do not rebuild inside AGENT-MCP what Hermes already provides well, including plugin installation mechanics, desktop/browser drivers, scheduler transport, or plugin-local UI.

AGENT-MCP owns the membrane, normalization, routing contracts, observability, and receipts.

## Example

User: "Find something that can edit this documentary and prepare a rough cut."

Expected route:

```text
BotBae
  -> capability.search(media editing)
  -> approved DaVinci-class CapabilityRecord
  -> ATG compile
  -> Sentinel/AEGIS check
  -> Execution Envelope
  -> Hermes plugin invocation
  -> artifact + receipt
```

The plugin performs the edit. The Grid decides whether it may.
