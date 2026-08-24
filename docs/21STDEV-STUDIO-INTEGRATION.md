# 21st.dev Studio Integration

## Purpose
Use 21st.dev as a governed component discovery/source layer for the AGENTROPOLIS Studios frontend. It does not own runtime authority, documentary evidence, HERMES identity, or production policy.

## Official integration paths
21st.dev currently exposes both a CLI and MCP workflow. The development machine can authenticate with the 21st.dev CLI, initialize the supported client integration, search for components, and install selected source components into the frontend.

Repository helper commands:

```bash
npm run 21st:login
npm run 21st:init:codex
npm run 21st:install-skill
npm run 21st:search -- "cinematic hero"
```

The CLI/MCP is a development-time dependency only. The deployed GitHub Pages site must remain static and must not require a 21st.dev API key in the browser.

## AGENTROPOLIS policy
- Prefer motion, cinematic hero, shader/WebGL, scroll-storytelling, timeline, gallery, command/control, and video-oriented components.
- Copy only selected component source into the project and adapt it to AGENTROPOLIS visual canon.
- Do not reproduce the 21st.dev website or another creator's composition wholesale.
- Record source component URL/name, author if supplied, retrieval date, and license/provenance notes before promotion.
- Run the Skill Install Assurance Gate / 54-T review on any component that introduces packages, network calls, scripts, analytics, storage, or executable behavior.
- No component may receive HERMES authority merely because it renders an action button.
- No secrets, MCP credentials, provider keys, or tokens may be compiled into GitHub Pages.

## Visual target
The target is a hyperreal cinematic virtual-production studio: Stage 33, LED-volume language, premium motion, filmic transitions, documentary timeline, dailies/review surfaces, Bot Mode crew controls, and an original AGENTROPOLIS spatial identity. Avoid generic SaaS dashboards and static early-web layouts.

## Deployment boundary
21st.dev helps us build the source. GitHub Pages hosts the compiled/static frontend. HERMES, Cloudflare Worker execution, receipts, 54-T and consequential authority remain behind their existing governed interfaces.
