# Cognitive Delivery Layer

## Purpose

The Cognitive Delivery Layer standardizes how AGENTROPOLIS explains the same underlying system to people with different levels of domain familiarity.

It is not an intelligence classifier.

The user selects the communication mode. Behavioral adaptation may refine delivery only within the limits of that choice.

## Canonical modes

- **MAIN_STREET** — plain language, short steps, define jargon, simple examples.
- **BUILDER** — assumes general technical comfort and explains unfamiliar agentic concepts.
- **ENGINEER** — developer-native language, APIs, schemas, code, tests, implementation details.
- **ARCHITECT** — systems context, tradeoffs, governance boundaries, failure modes, cross-layer effects.
- **ADAPTIVE** — user explicitly authorizes the system to adjust delivery based on bounded interaction signals.

## Independent controls

```text
REASONING = how hard the system thinks
VERBOSITY = how much the system says
COGNITIVE DELIVERY = how the system explains it
```

These controls must remain independent.

A response may use high reasoning with low verbosity and MAIN_STREET delivery.

## Behavioral signals

Permitted adaptation signals include:

- explicit requests such as "simplify that" or "give me the developer version"
- repeated clarification on the same concept
- repeated task errors
- task success
- topic mastery
- response-length patterns
- navigation friction

These signals may adjust chunking, terminology, examples, repetition, pace, detail, and visual density.

They must not be converted into a global intelligence score or used to infer medical diagnoses, disability, or protected traits.

## User control

Priority order:

```text
explicit turn override
-> user-selected mode
-> user-approved adaptive support
-> domain familiarity
-> surface default
-> runtime default
```

The user-selected mode is authoritative until the user changes it. If adaptation is enabled, the system may refine delivery within that mode. Only ADAPTIVE mode or an explicit user instruction may authorize mode switching.

## ATG binding

The canonical machine-readable contract is owned by AGENTROPOLIS-ATG:

`contracts/core/communication-profile.schema.json`

AGENT-MCP consumes that contract as a behavior and routing input. It does not redefine ATG semantics.

## Runtime binding

Provider/runtime adapters should map supported fields to native controls.

Example:

```text
ATG verbosity=low
-> Hermes adapter
-> agent.text_verbosity=low
```

Unsupported fields fall back to prompt assembly and presentation controls.

## Receipts and telemetry

For governed or evaluated sessions, receipts may record:

- selected communication mode
- effective verbosity
- effective terminology mode
- adaptation enabled/disabled
- temporary delivery adjustments
- reason category for an adjustment

Do not persist raw private conversation content solely to support adaptation when a compact signal is enough.

## Invariant

**Adapt the explanation, not the dignity or authority of the person receiving it.**
