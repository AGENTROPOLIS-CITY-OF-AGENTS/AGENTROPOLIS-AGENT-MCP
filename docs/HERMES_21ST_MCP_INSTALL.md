# HERMES 21st.dev MCP Install

Purpose: connect HERMES/OpenCode to the 21st.dev remote MCP endpoint without committing the API key into Agentropolis source control.

## Remote endpoint

```text
https://21st.dev/api/mcp
```

## Configuration

Start from:

```text
config/hermes-mcp.21st.example.json
```

Copy the example into the local HERMES/OpenCode MCP configuration location and replace:

```text
REPLACE_LOCALLY_DO_NOT_COMMIT
```

with the 21st.dev key on the local machine only.

Expected local shape:

```json
{
  "mcpServers": {
    "21st": {
      "url": "https://21st.dev/api/mcp",
      "transport": "streamable-http",
      "headers": {
        "x-api-key": "<local-key>"
      }
    }
  }
}
```

## Guardrails

- Do not commit the local key.
- Do not write it into HERMES-CITY source files.
- Do not write it into AGENTROPOLIS-DEPLOY Worker code.
- Do not expose it in public client-side JavaScript.
- Treat 21st.dev as an external design/component MCP source, not a source of Agentropolis authority or canon.
- Imported UI/component material remains external-origin until explicitly reviewed and adopted.

## HERMES/OpenCode activation

1. Open the fresh HERMES/OpenCode session intended for HERMES-CITY.
2. Add the `21st` server using the local configuration above.
3. Restart or reload MCP servers.
4. Confirm `21st` reports connected before asking HERMES to use it.
5. Use it for Docking District UI/component discovery only; do not let it override governed runtime, spatial-event, identity, provenance, or execution contracts.

## Docking District use

Approved first use:

- search for high-quality dashboard, observatory, command-center, agent-card, feed, status, and navigation components;
- adapt presentation into the existing HERMES-CITY Docking District visual system;
- preserve the existing Three.js spatial runtime and governed spatial-event feed;
- do not substitute UI mock data for LIVE Agentropolis state.

## Verification

A successful integration requires all of the following:

```text
21ST_MCP_CONNECTED: YES
HERMES_CITY_RUNTIME_REPLACED: NO
GOVERNED_SPATIAL_EVENT_CONTRACT_PRESERVED: YES
FAKE_LIVE_STATE_INTRODUCED: NO
LOCAL_KEY_COMMITTED: NO
```
