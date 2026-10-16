# AGENTROPOLIS AGENT MCP KIT

The governed remote MCP capability membrane for the **Agentropolis Intelligence Grid**.

This repository deploys as one Cloudflare Worker serving a cyber-noir command surface, a stateless Streamable HTTP MCP endpoint, fourteen public read-only tools, D1 execution receipts, security events, rate limiting, operator-only receipt APIs, the Agentropolis 3D Intelligence Observatory, and the J-SPACE ∞ Cognitive Commons.

> Infrastructure becomes the terrain others must build on.

## Architecture

```text
HERMES / MCP client / Agentropolis 3D
  -> Cloudflare request guards
  -> authentication + rate limit
  -> MCP capability membrane
  -> bounded READ_ONLY tool
  -> WikiVault / J-SPACE / Observatory derived view
  -> D1 receipt
  -> structured response
```

## J-SPACE ∞ Cognitive Commons

J-SPACE ∞ is the model-agnostic deliberation layer above the provenance-backed knowledge substrate. It composes WikiVault, Obsidian, llm-wiki, gbrain, the versioned Mind Vault, specialist lenses, an attention market, cognitive assemblies, a Heretic slot, and Meta-J auditing.

The public MCP does **not** expose hidden chain-of-thought or model activations. It exposes governed architecture manifests, source-backed Mind Vault contracts, WikiVault bridge rules, and bounded council assembly plans.

The source deliberately marks the historical 200+ mind roster as **rehydration required** until the exact dataset is recovered with provenance.

See [`docs/JSPACE_WIKIVAULT_COGNITIVE_COMMONS.md`](docs/JSPACE_WIKIVAULT_COGNITIVE_COMMONS.md).

## Agentropolis 3D + Intelligence Observatory

The GitHub Pages surface in `github-pages/3d/` is the integrated liquid-glass 3D city and HERMES docking terminal.

The city includes a selectable **Intelligence Observatory** structure and drawer with four governed views:

- district and infrastructure topology
- thermodynamics, entropy, drift, friction, and stability
- memory evolution, provenance, confidence, and contradictions
- skill development, verification gates, and citizenship readiness

The drawer calls the same deployed `/mcp` endpoint and displays the returned receipt ID. Before a Worker is connected, it renders a clearly labeled canonical preview. It shows **live** only when the response contains D1 receipt-backed observability.

The Observatory never exposes hidden chain-of-thought, private model state, bearer tokens, or raw secrets.

See [`docs/INTELLIGENCE_OBSERVATORY.md`](docs/INTELLIGENCE_OBSERVATORY.md).

## HERMES launcher

The repository includes a GitHub Pages installer surface in `github-pages/`.

It:

- checks the deployed Worker health and MCP manifest
- generates native Streamable HTTP HERMES configuration
- generates a Node-based command bridge fallback
- avoids the fragile local Python `mcp` import path
- preserves the read-only public authority ceiling
- embeds the MCP-backed Observatory inside the 3D city

After merging the launcher workflow and selecting **GitHub Actions** as the repository Pages source, the expected URL is:

```text
https://wiredchaos.github.io/AGENTROPOLIS-AGENT-MCP/
```

The 3D route is:

```text
https://wiredchaos.github.io/AGENTROPOLIS-AGENT-MCP/3d/
```

See [`docs/HERMES_REMOTE_MCP_INSTALL.md`](docs/HERMES_REMOTE_MCP_INSTALL.md).

## MCP tools

### Core capability membrane

- `route_front_desk`
- `list_agentropolis_districts`
- `assess_mcp_request_risk`
- `get_agentropolis_capability_map`
- `get_cloudflare_deployment_manifest`

### J-SPACE ∞ Cognitive Commons

- `get_jspace_manifest`
- `get_wikivault_jspace_bridge`
- `assemble_cognitive_council`
- `get_mind_vault_contract`

### Intelligence Observatory

- `get_agentropolis_topology`
- `get_agentropolis_thermodynamics`
- `get_agentropolis_memory_evolution`
- `get_agentropolis_skill_development`
- `get_agentropolis_observatory_snapshot`

All fourteen public tools are read-only. No wallet signing, payment, publishing, permission mutation, settlement, destructive action, autonomous canon mutation, or autonomous self-promotion is registered.

## Endpoints

```text
GET  /                         command surface
GET  /health                   Worker and D1 health
GET  /.well-known/mcp.json     deployment manifest
POST /mcp                      Streamable HTTP MCP
GET  /api/tools                complete public tool registry
GET  /api/districts            district registry
GET  /api/observatory          governed observatory snapshot
GET  /api/jspace               governed J-SPACE static views
POST /api/route                Front Desk routing
POST /api/risk                 risk assessment
GET  /api/receipts             operator-only receipts
GET  /api/receipts/:id         operator-only receipt
```

J-SPACE examples:

```text
GET /api/jspace?view=manifest
GET /api/jspace?view=wikivault
GET /api/jspace?view=mind-vault
```

Observatory examples:

```text
GET /api/observatory?view=all
GET /api/observatory?view=topology
GET /api/observatory?view=thermodynamics
GET /api/observatory?view=memory_evolution
GET /api/observatory?view=skill_development
```

## Validate

```bash
npm ci
npm run validate
npm test
npm run deploy:dry
```

## Deploy

```bash
npm run deploy
```

Wrangler automatically provisions D1 because `wrangler.jsonc` declares the `DB` binding without an account-specific resource ID. The deploy command then applies `migrations/0001_core.sql`.

For Cloudflare Workers Builds, custom domains, secrets, smoke tests, and rollback, see [`docs/CLOUDFLARE_DEPLOYMENT.md`](docs/CLOUDFLARE_DEPLOYMENT.md).

## Operator token

```bash
npx --yes wrangler@4.114.0 secret put MCP_API_TOKEN
```

Operator receipt APIs always require this encrypted Worker secret. Set `MCP_AUTH_MODE` to `token` to protect the full MCP endpoint.

## Security invariants

- Authority is a runtime constraint, not a prompt.
- Public tools remain read-only.
- WikiVault evidence/canon separation is preserved across J-SPACE deliberation.
- Obsidian notes and llm-wiki retrieval do not automatically become verified canon.
- Mind Vault profiles are source-backed reasoning lenses, not identity impersonations.
- Raw request bodies and bearer tokens are not stored in receipts.
- Every successful tool call returns a receipt ID and persistence status.
- Browser-originated cross-site requests must pass the origin allowlist.
- High-impact actions require a separate authenticated execution corridor.
- Canonical preview data is never presented as live telemetry.
- Hidden chain-of-thought and private model activations are never exposed.
- Agent progression remains human governed; self-promotion is disabled.


## Omarchy workstation adapter

AGENTROPOLIS can treat Omarchy as a governed local operator/developer workstation through the existing HERDR integration.

The workstation path is:

```text
Omarchy host
  -> HERDR workspace
  -> AGENTROPOLIS-AGENT-MCP local capability membrane
  -> Builder Commons Local Dock
  -> Hermes / Codex / approved workers
  -> Execution Envelope / policy / verification / receipt
```

Omarchy does not grant authority. The workstation adapter exposes descriptive machine/workspace capability and bounded local execution only through explicit capabilities.

Implemented support:
- authority-free Omarchy machine profile
- quarantine/verified/degraded/revoked trust state
- live/offline/stale connectivity state
- safe Builder Commons projection that excludes credential references
- compute advertisement only when the profile is both verified and live

See `integrations/herdr/omarchy-profile.mjs` and `docs/OMARCHY_WORKSTATION_ADAPTER.md`.
