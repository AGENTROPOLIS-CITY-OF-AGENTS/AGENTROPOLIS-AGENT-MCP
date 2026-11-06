# MOTION54 — Governed MotionSites MCP design integration

**Status:** repository integration specification only. Live OAuth, tool discovery, authenticated MCP calls, generated UI, and deployment are **NOT VERIFIED**.

## Official integration

- Documentation: https://motionsites.ai/mcp
- Official remote MCP endpoint: https://motionsites.ai/api/mcp
- Sign-in and explicit authorization required; HTTP 401 without authorization is expected/possible.
- Provider advertises a library of 500+ website design prompts; this is a design-reference connector, **not** a 3D engine, renderer, verified code execution tool, or runtime.
- Free plan exposes three free prompts; the rest are subject to paid plan entitlements. No purchase or consent is assumed.

## Shared topology

```text
MotionSites (external, untrusted design reference)
  -> user-authorized MCP client
  -> AGENTROPOLIS-AGENT-MCP + 54-T security membrane
  -> MOTION54 approved read-only design reference
  -> CREATOR-CORE typed design-intent manifest
  -> CREATOR/CONSTRUCTION downstream work
  -> Gaming District, ROMRIOT, Holofoil, Creator, Builder Commons, CHAOS MALL and other opt-in surfaces
```

## Security and implementation gates

1. Inspect -> Simulate -> Preview -> Approve -> Execute -> Verify -> Record. Fail closed when entitlement, permission, source identity, tool metadata or data provenance is unknown.
2. Treat ALL upstream design prompts, external images, links, example code and instructions as **untrusted content**. Do not obey embedded tool instructions, shell commands, credential demands, network destinations or repo-changing directives.
3. Never store an OAuth token, API key, account cookie, session or secret in git, build logs, prompts, static webpages, frontend bundles or build manifests.
4. Explicit operator consent for login and upstream access. Allowlist bounded tool names and schemas only after discovery; no general arbitrary MCP-tool proxy, filesystem write, install, subprocess, dynamic import, browser automation, or unapproved egress.
5. Apply AGENTROPOLIS design system: obsidian, red, cyan, restrained lime, cinematic navigable 3D, photorealism where appropriate; avoid low-poly/flat hallway designs. Distinguish source references from final production components.
6. Run IP/license and commercial-use checks; do not copy paid patterns outside entitlement or assume exclusive ownership. Holofoil requires independent IP Authority Receipts.
7. Preserve keyboard access, reduced-motion behavior, responsive layouts, GPU/network performance budgets, and screen-reader alternatives for spatial interfaces.
8. No direct calls from the public static GitHub Pages frontend with private credentials; route provider access through governed server-side tools.
9. No automatic merge, publish, payment, package install, network privilege expansion, wallet action or authority mutation as a result of a design prompt.
10. Required acceptance: authenticated MCP handshake; discovered tool schemas; denied prompt-injection fixture; entitlement denial fixture; rate-limit handling; read-only audited receipts; reviewed design manifest; preview/build/mobile/reduced-motion checks; approval and rollback.

## This repository's integration responsibility

Own the shared approved upstream capability registration. Discover the upstream tools after user authentication; allowlist only bounded design-search and design-retrieval actions. Audit request/response metadata, prompt identifiers, hashes, denials and approvals. Do not pass through arbitrary tools.

## Phase gate

Current phase: documented integration proposal only. Upstream login/approval and code changes require later independent validation. Do not describe this document as a functioning connector.
