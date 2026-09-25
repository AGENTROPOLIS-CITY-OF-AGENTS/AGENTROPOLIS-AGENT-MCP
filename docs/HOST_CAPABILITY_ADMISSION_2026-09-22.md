# Host Capability Admission

## Principle
Capability availability is a live host fact, not a static property of a skill or MCP declaration.

## Discovery phases
1. locate
2. inspect
3. probe
4. admit

## Required evidence
- declared application/runtime prerequisite
- host OS/platform
- minimum version
- observed application version
- liveness state
- endpoint generation
- last successful probe
- capability epoch
- admission verdict

## Dispatch behavior
Unknown, unsupported, missing, stale, or unavailable prerequisites must fail closed.

Dispatch must never route work solely because a skill is installed or listed in a registry.

## Portability
Keep Hermes-specific discovery details behind the AGENT-MCP capability membrane so NemoClaw and future runtimes can expose equivalent host-capability evidence.
