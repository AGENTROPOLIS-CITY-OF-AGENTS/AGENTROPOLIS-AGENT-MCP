# Nemotron 3.5 Lightning + NeMo Switchyard Routing Fabric

## Decision

AGENTROPOLIS adopts NVIDIA Nemotron 3.5 Lightning and NeMo Switchyard as optional components inside the Intelligence Grid model-routing layer.

They are not sovereign dependencies.

- AGENTROPOLIS owns the routing contract.
- Switchyard is a replaceable routing adapter.
- Nemotron 3.5 Lightning is a worker-class model candidate.
- Frontier and judge lanes remain provider-agnostic.
- Policy/Risk retains authority over whether any side effect is permitted.

## Placement

```text
Task Graph
  -> Dispatch Protocol selects agent
  -> Model Routing Fabric selects intelligence lane
  -> Runtime Router selects execution location
  -> Policy/Risk checks authority
  -> Provider adapter performs inference
  -> Validator/Judge checks result when required
  -> Audit Ledger records receipt
```

The Model Routing Fabric belongs to AGENTROPOLIS infrastructure. It must not be embedded as vendor-specific logic inside a district or application.

## Routing dimensions

The router evaluates at least:

1. capability fit
2. expected quality
3. latency target
4. estimated cost
5. privacy classification
6. context-window need
7. hardware fit
8. requested tool authority
9. task risk

The default economic objective is `cheapest_capable`, subject to quality, privacy, and governance constraints.

## Nemotron 3.5 Lightning lane

Nemotron 3.5 Lightning is classified as a high-volume Worker lane candidate.

Suitable pilot workloads:

- classification
- extraction
- summarization
- code review
- routine tool planning
- security-alert triage
- document processing
- routine agent turns
- bounded validation

It does not receive unilateral authority for destructive operations, credential access, wallet signing, production mutation, or regulated high-stakes decisions.

## Escalation pattern

```text
request
  -> worker
  -> validate
  -> pass: receipt
  -> fail/uncertain: specialist
  -> validate
  -> fail/high complexity: frontier
  -> high risk: judge + policy gate + human approval when required
```

Model identity may change across steps without changing the agent's durable identity, permissions, memory boundary, district membership, or skill contract.

## Switchyard adapter rule

Switchyard may provide routing algorithms and provider translation behind the AGENTROPOLIS contract.

It must be:

- feature-flagged
- replaceable
- sandboxed during pilot
- prevented from bypassing Policy/Risk
- prevented from receiving raw secrets
- prevented from granting itself execution authority
- covered by fallback routing

If Switchyard is unavailable or disabled, the native AGENTROPOLIS policy router must remain functional.

## BYOH / BYOK execution

The Model Routing Fabric may route across:

- local RTX / workstation GPU workers
- NVIDIA NIM endpoints
- Ollama or other local OpenAI-compatible servers
- cloud BYOK providers
- remote workers enrolled through the device fabric

Hardware qualification is mandatory before selecting a local model. AGENTROPOLIS must never imply that every device can host every model.

## Receipt contract

Every routed inference should produce or contribute to a routing receipt containing:

- task ID
- route reason
- selected tier
- provider
- model
- risk score
- policy decision
- latency
- token counts when available
- estimated cost when available
- escalation history
- timestamp

Receipts flow to the Audit Ledger and can later train routing heuristics only through governed evaluation pipelines.

## Anti-Moloch rules

1. No vendor owns the city router.
2. No model chooses its own authority.
3. No cost optimization may bypass safety or privacy constraints.
4. No raw secrets enter model context.
5. No silent production mutation.
6. No automatic self-escalation of permissions.
7. No learned router is promoted without replayable benchmark evidence.

## Relationship to existing routing work

This lane consolidates rather than duplicates existing model work:

- Graph Engine determines what work exists.
- Dispatch Protocol determines which agent owns the work.
- Model Routing Fabric determines which model intelligence performs each inference.
- Runtime Router determines where the inference executes.
- Policy/Risk determines whether execution is allowed.
- Audit Ledger records the decision and outcome.

Hermes may consume this routing fabric, but Hermes is not required for the core routing contract.

## Pilot exit criteria

Switchyard or any learned routing adapter may leave experimental status only after:

- deterministic fallback behavior is verified
- routing receipts are complete
- private-data routing tests pass
- cost and latency claims are reproduced locally
- quality regression thresholds are defined
- failure and timeout tests pass
- high-risk task escalation tests pass
- no route can bypass Policy/Risk authority

Until then, the adapter remains optional and feature-flagged.
