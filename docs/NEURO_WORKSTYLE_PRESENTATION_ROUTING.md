# NEURO Workstyle Presentation Routing

## Purpose

This contract lets HERMES and AGENTROPOLIS presentation adapters consume `ATG:COGNITION` without confusing human workstyle preferences with agent reasoning coverage or execution authority.

## Three independent axes

```text
technical presentation : MAIN_STREET | BUILDER | DEVELOPER
response length         : LOW | MEDIUM | HIGH
NEURO workstyle         : ARCHITECT | SPARK | ANCHOR | PHANTOM
```

## Runtime behavior

| Workstyle | Presentation / workflow routing |
|---|---|
| ARCHITECT | system map, dependencies, constraints, sequence, tradeoffs |
| SPARK | options, branching, novelty, rapid capture, converge after exploration |
| ANCHOR | checklist, current state, QA gate, fewer switches, predictable next action |
| PHANTOM | low interruption, bounded deep work, batched questions, concise handoff + receipt |

The implementation lives in `src/neuro-workstyle.js` and is covered by `tests/neuro-workstyle.test.mjs`.

## HERMES mapping

HERMES may map:
- `text_verbosity` to its response-length configuration
- `presentation_mode` to explanation depth
- `workstyle.primary` to task decomposition and communication cadence

A user-selected profile has precedence over adaptive suggestions.

## Critical boundary

Human workstyle mode is not the same thing as AGENTROPOLIS cognitive coverage routing.

`NI_FORESIGHT`, `NE_SCENARIOS`, `TI_CONSISTENCY`, `TE_EXECUTION`, `FI_INTEGRITY`, `FE_IMPACT`, `SI_PRECEDENT`, and `SE_REALITY` describe evidence/assessment coverage for agent work.

ARCHITECT, SPARK, ANCHOR, and PHANTOM describe how a human prefers the system to organize and present work.

Neither grants tool authority.

## Employment boundary

The workstyle adapter may support onboarding, accessibility, communication, task presentation, and voluntary workflow preferences. Its output must never feed candidate ranking, hiring, promotion, compensation, termination, eligibility, or automated performance scoring.
