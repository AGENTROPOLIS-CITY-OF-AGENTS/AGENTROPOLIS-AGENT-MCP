# AGENTROPOLIS WikiVault - Final Scan and SWOT

## Scan boundary

This review covers the current `wiredchaos/agentropolis` root doctrine, the public `wiredchaos/AGENTROPOLIS-AGENT-MCP` capability membrane, the Intelligence Observatory extension, the shared MCP client contract, security invariants, and the new `agentropolis-wikivault` skill branch.

The scan is architecture-focused. It does not claim that a full account-wide knowledge extraction has already run.

## Current baseline

Strength already present in the platform:

- Agentropolis has a canonical root repository and explicit doctrine inheritance.
- The MCP repository already exposes a public read-only capability membrane with receipts, origin checks, rate limiting, D1 persistence, and a separate operator token.
- The Intelligence Observatory already models topology, thermodynamics, memory evolution, skill development, and bounded observation windows.
- The shared MCP contract already enforces `public-read`, `write_default: deny`, and human approval for consequential actions.
- Hermes is already treated as a client and operator bridge instead of the sovereign control plane.

The WikiVault branch adds the missing portable knowledge-refinery workflow: provenance schemas, repository inventory, conflict/canon separation, browser evidence rules, NFT/XRPL lanes, runtime adapters, output contracts, validation, and checksum bundling.

# SWOT

## Strengths

1. **Governance before autonomy.** Existing public MCP authority is read-only and receipt-backed, which is a strong foundation for a public scanner.
2. **Portable architecture.** WikiVault is defined as Agentropolis-owned but runtime-neutral, avoiding dependence on Hermes, OpenClaw, or a single model provider.
3. **Provenance as a first-class primitive.** The design retains source, commit, path, line, hash, evidence state, canon state, and conflict state instead of flattening everything into embeddings.
4. **Existing observability doctrine.** Thermodynamics, entropy, drift, and bounded telemetry already exist in the MCP project and can be extended to knowledge quality.
5. **Domain expansion path.** NFT/XRPL and browser evidence are optional lanes rather than hardwired assumptions.
6. **Persistent-control/disposable-compute model.** This is well suited to large repository scans and hostile inputs.

## Weaknesses

1. **The public MCP service is not yet a scan engine.** It routes and observes Agentropolis but does not yet execute repository census, extraction, or portable vault export.
2. **No canonical public WikiVault data specification has independent versioning yet.** Without this, runtime adapters can drift.
3. **No conformance suite across Hermes/OpenClaw/generic MCP yet.** Compatibility is an architectural target, not demonstrated coverage.
4. **Browser evidence is doctrine, not a shipped sandboxed adapter.** The risk model is defined before implementation.
5. **No account-wide incremental scan scheduler yet.** Checkpoint logic is specified, but webhook/delta execution is not implemented.
6. **Skill packaging and MCP service are still separate surfaces.** A discovery manifest is needed so runtimes know which capabilities are local, remote, or unavailable.

## Opportunities

1. **Become the portable provenance layer for agent memory.** Most repo/RAG tools optimize retrieval; WikiVault can own the harder problem of evidence, conflict, state, and review.
2. **Use Hermes as the first distribution community without surrendering ownership.** This gives a real adoption channel while keeping the format vendor-neutral.
3. **Serve OpenClaw and other MCP agents through the same capability contract.** AgentSkills + MCP + CLI creates a broad compatibility surface.
4. **Create a public WikiVault Interchange Format.** JSONL + manifests + checksums can become useful even for teams that never run Agentropolis.
5. **Offer domain packs.** Software architecture, lore/canon, NFT/ledger, research, compliance, and enterprise knowledge can share the same core.
6. **Turn knowledge quality into observability.** Contradiction rate, stale-source ratio, duplicate ratio, unresolved conflicts, and context truncation can become measurable system health.
7. **Build an eval/conformance moat.** Public fixtures for prompt injection, secrets, large repos, forks, conflicting docs, and ledger mismatch can make trust measurable.
8. **Create a hosted final lane without breaking sovereignty.** Local inventory/extraction plus optional hosted heavy analysis can support both hobbyists and teams.

## Threats

1. **Platform-native repository memory.** GitHub, model vendors, and agent runtimes may offer increasingly capable indexing and memory.
2. **MCP and AgentSkills fragmentation.** Runtime-specific extensions may reduce portability if WikiVault does not maintain a strict core contract.
3. **Prompt injection and supply-chain attacks.** A public scanner will ingest adversarial repositories by design.
4. **Privacy, licensing, and data-retention risk.** Scanning private repos or copyrighted corpora requires source and export policy controls.
5. **Cost explosion on large accounts.** Naive full-context extraction can become expensive and slow.
6. **Truth overclaiming.** If planned code, deployed behavior, and verified external state are mixed, WikiVault loses its differentiator.

# Opportunity maximization plan

## Priority 0 - Make the format useful without Agentropolis

Ship the Skill, schemas, inventory tool, validator, portable output layout, and checksum builder as a self-contained open package. A user must be able to run a useful local read-only workflow without Hermes, OpenClaw, Cloudflare, or a hosted model.

## Priority 1 - Publish a stable capability contract

Add a machine-readable WikiVault manifest containing schema version, supported source adapters, evidence states, authority ceiling, output formats, and runtime compatibility status. Runtime adapters consume this manifest instead of guessing features.

## Priority 2 - Build the GitHub read-only scanner

Implement account/repository census, safe file discovery, commit-aware incremental scanning, resumable checkpoints, and provenance receipts. Keep publisher credentials separate.

## Priority 3 - Add the conformance suite

Test:

- secret quarantine
- prompt injection fixtures
- symlink/path traversal
- truncation continuation
- exact duplicates and forks
- conflicting active documents
- planned vs deployed state
- NFT metadata vs ledger state
- runtime adapter discovery

## Priority 4 - Browser Evidence Harness

Ship Playwright or an equivalent backend only after domain allowlists, SSRF defense, ephemeral profiles, download quarantine, and action ceilings are enforced in code.

## Priority 5 - Community distribution

Package Agentropolis WikiVault for the Hermes community first, then publish OpenClaw/generic MCP setup examples and a compatibility matrix. Community adoption should validate the interchange format, not fork it.

# Executed in this phase

- Created and hardened the Agentropolis WikiVault Skill.
- Added deterministic repository inventory with secret, oversized-file, and symlink quarantine.
- Added JSONL evidence validation.
- Added portable vault manifest and checksum generation.
- Added architecture, security, schema, browser, NFT/XRPL, runtime adapter, MCP, and output references.
- Added runtime compatibility and MCP configuration examples.
- Added CI-oriented tests for inventory, validation, and bundling.
- Prepared the project for a reviewable pull request instead of mutating the public execution corridor directly.

# Next implementation gate

After this PR is reviewed, the next engineering milestone is a read-only GitHub scanner service with persistent scan state and a machine-readable WikiVault capability manifest. That is the point where a Hermes execution prompt becomes useful for live end-to-end community testing.
