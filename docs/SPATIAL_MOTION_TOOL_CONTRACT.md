# Agent MCP Spatial Motion Tool Contract

Agent MCP exposes a capability-scoped facade for AGENTROPOLIS `media.spatial.*`.

## MCP-visible operations
- `spatial_depth_extract`
- `spatial_pose_extract`
- `spatial_choreo_extract`
- `spatial_camera_extract`
- `spatial_control_compose`
- `spatial_motion_transfer`
- `spatial_preview_render`
- `spatial_job_status`

## Request envelope
Every request carries consumer, mission, requested capability, artifact references, constraints, and budget scope. References point to governed artifacts; they do not contain raw provider secrets.

## Response envelope
Return normalized control/artifact IDs, validation state, policy state, metering receipt, provenance receipt, and bounded error information.

## Security boundary
MCP clients MUST NOT receive provider source code, worker filesystem paths, raw model internals, shell access, or credentials. The Utility Grid privately selects approved providers behind 54-T and ASBE policy gates.
