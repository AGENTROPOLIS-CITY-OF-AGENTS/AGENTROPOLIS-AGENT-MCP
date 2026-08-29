# Agent DID MCP Boundary v1

Every privileged MCP invocation MUST carry or resolve an authenticated Agent DID plus a valid mandate/delegation context before tool execution.

Required flow:
Agent DID -> delegation validation -> AEGIS decision -> capability grant -> MCP tool -> signed receipt -> audit.

MCP discovery is never authorization. Servers MUST fail closed when identity or authorization context is absent or invalid. The NEURO root DID MUST NOT be reused as an agent runtime identity.

Cross-district MCP calls MUST additionally pass Dispatch Protocol authorization.

Canonical contract: AGENTROPOLIS-SOVEREIGNTY/docs/agent-did-runtime-standard-v1.md
