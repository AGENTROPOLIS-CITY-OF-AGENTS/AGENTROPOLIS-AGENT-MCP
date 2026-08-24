# Runtime Adapters

The WikiVault core must work without any agent runtime installed. Runtime adapters are optional compatibility layers.

## Hermes

Expose the AgentSkills package plus local or remote MCP. Treat Hermes as a distribution and execution community, not the owner of the skill.

## OpenClaw and Claw-family runtimes

Prefer AgentSkills when supported and MCP when available. Do not assume compatibility from branding alone. Maintain a tested capability matrix.

## ChatGPT

Use the skill package for repeatable workflow guidance. When a remote WikiVault service is available, expose a compatible action or MCP bridge according to the client environment.

## Codex and Claude Code

Use local CLI, Git, AgentSkills where supported, and stdio or Streamable HTTP MCP adapters.

## Capability detection

Detect interfaces instead of hardcoding brands:

- AgentSkills
- MCP stdio
- MCP Streamable HTTP
- REST/OpenAPI
- local CLI
- filesystem access
- browser capability
- GitHub capability

Mark a runtime `SUPPORTED` only after conformance tests. Otherwise use `COMPATIBILITY_TARGET` or `UNVERIFIED`.
