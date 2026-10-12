# X-LONG MCP capabilities (proposal / disabled)

Canonical provider: AGENTROPOLIS-UTILITY-GRID X-LONG, draft PR #50.

Potential abstract tools:
- learning.xlong.status (read-only)
- learning.xlong.metrics (read-only, aggregate metering)
- learning.xlong.inspect (read-only authorized trajectory metadata, no raw content)
- learning.xlong.submit (future explicit-policy sandbox capability; not enabled)

MCP server MUST NOT expose trainer, GPU scheduling, authority promotion, receipt-signing or direct WikiVault write.
All requests require subject identity, mandate, capability policy, tenant isolation, task envelope, quota and audit.
Provider state progression: discovered != installed != loaded != live != authorized. Remain disabled until a formal integration PR proves scopes, isolation, redaction, tests and receipt verification.

This documentation is **not a functioning MCP tool registration**.
