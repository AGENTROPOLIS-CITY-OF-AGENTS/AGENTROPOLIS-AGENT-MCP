# Preserved audit references

All references remain pinned to the October 16 audit; they are not silently
upgraded to whatever `main` contains later.

| Source | Exact revision | Relevant contract |
| --- | --- | --- |
| Herald OS | `04fba92585165d7407bc639efc8408b15217cd37` | [bridge](https://github.com/iamlukethedev/Herald-OS/blob/04fba92585165d7407bc639efc8408b15217cd37/docs/SYSTEM-BRIDGE.md) |
| HERMES-CITY | `25e727aad42ec01ec011ff1f4b0c6ff494b9d5b2` | [systemwide stack](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/HERMES-CITY/blob/25e727aad42ec01ec011ff1f4b0c6ff494b9d5b2/docs/HERMES_CITY_SYSTEMWIDE_AGENT_STACK.md) |
| Agent MCP | `254e2ed593e5e251533ff1f9a9f422b302223285` | [54T enforcement](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AGENT-MCP/blob/254e2ed593e5e251533ff1f9a9f422b302223285/docs/54T_MCP_ENFORCEMENT.md) |
| AEGIS Assurance | `e89c9ee156f9bc6921c0a65896c602adedc6b239` | [Hermes runtime assurance](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AEGIS-ASSURANCE/blob/e89c9ee156f9bc6921c0a65896c602adedc6b239/docs/HERMES_RUNTIME_ASSURANCE_PROFILE.md) |
| AGENTROPOLIS-54T | `a92ac15c926288eb9b93b4d0eb9daae09772efb2` | [authoritative routing](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-54T/blob/a92ac15c926288eb9b93b4d0eb9daae09772efb2/docs/AUTHORITATIVE-ROUTING-CONTRACT.md) |

54T owns capability issuance, effective capability graphs, authorization and
revocation. The existing [54T MCP beta boundary](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-54T/blob/a92ac15c926288eb9b93b4d0eb9daae09772efb2/beta/54t-mcp-adapter-v1/README.md)
is the future integration reference. Its test transport is not a live authority
connection. Phase 1 imports none of its implementation and does not create a
substitute transport.

AEGIS's runtime profile prohibits duplicating the scheduler, provider fallback,
peer transport, plugin updater, SQLite lifecycle or subagent scheduler. This PoC
adds none of them and never accesses Hermes operational stores.

The pinned 54T receipt schema uses allow/deny and additionalProperties:false.
This PoC uses a separately named fixture namespace, never claims to emit those
operational receipts, and never passes its ALLOW or ASK to an executor. Phase 2
must explicitly map ASK to a non-executing review-required decision at the
existing authority boundary and preserve route/authorization/action separation.

## Existing branch protection

Read on 2026-10-17: active ruleset `20543443`, AGENTROPOLIS Main Protection,
applies to the default branch. It requires a PR, linear history, resolved strict
`validate` status checks, and disallows deletion/non-fast-forward updates. No
bypass actors were returned; current-user bypass was `never`. It requests
Copilot review on draft pushes. The approving-review count is ZERO; this is
not evidence that human approval is technically enforced. The classic branch
protection endpoint returned 403 to the integration; ruleset details were readable.

[Ruleset](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AGENT-MCP/rules/20543443)
remains unchanged. Only a feature branch and draft PR may be created. No
self-approval, direct main update, merge or deployment is authorized. Independent
human review and explicit user merge authorization remain mandatory regardless
of the ruleset's zero-review setting.
