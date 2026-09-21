# Typed Decision Coprocessor Contract

Status: CANDIDATE CONTRACT  
Date: 2026-09-21  
Owner: AGENTROPOLIS-AGENT-MCP  
Relationship: ADAPTER / CAPABILITY BOUNDARY

## Purpose

Define a provider-neutral interface for fast, typed, probabilistic decisions inside Agentropolis workflows.

The first external candidate is TypeSafe AI Jev. Future local decision models may implement the same contract after independent evaluation.

This contract does not create a new governance authority.

## Canonical rule

> A decision coprocessor may recommend a branch. It cannot grant authority.

## Placement

```text
caller
  -> bounded state construction
  -> Ingest Membrane / secret filtering
  -> typed-decision capability
  -> provider adapter
  -> typed result + uncertainty
  -> deterministic threshold policy
  -> Dispatch / AEGIS / human escalation
  -> receipt
```

## Primitives

The portable contract supports three primitive families:

- `choice`: select one key from an allowed set and return a distribution.
- `score`: score against an ordered rubric and return a distribution.
- `noul`: return a probability for a yes/no proposition.

Providers may use different names internally. Adapters normalize them into this contract.

## Authority boundary

Allowed initial uses:

- route among already-eligible agents
- choose among already-eligible skills
- rank review queues
- classify evidence relevance
- preclassify risk for later AEGIS evaluation
- decide when stronger reasoning or human review is required

Forbidden uses:

- create or expand a mandate
- grant tool, wallet, signing, deployment, or financial authority
- override AEGIS
- determine legal or regulatory status
- sign or submit transactions
- mutate entitlement or settlement state
- receive raw credentials, bearer tokens, seed phrases, private keys, or secret-bearing logs

## Request

```json
{
  "contract_version": "decision.v1",
  "request_id": "uuid-or-equivalent",
  "provider_profile": "candidate-or-approved-provider-id",
  "state": {},
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Choose an eligible route.",
      "criteria": {
        "route_a": "description",
        "route_b": "description"
      }
    }
  },
  "policy": {
    "authority": "advisory_only",
    "max_latency_ms": 1000,
    "max_cost_micro_usd": 1000,
    "sensitive_data": false
  }
}
```

## Response

```json
{
  "contract_version": "decision.v1",
  "request_id": "same-request-id",
  "provider_id": "resolved-provider",
  "model_id": "resolved-model-or-version",
  "answers": {},
  "usage": {},
  "observed_at": "RFC3339",
  "receipt": {
    "input_hash": "sha256",
    "output_hash": "sha256",
    "authority": "advisory_only"
  }
}
```

## Threshold law

Confidence or probability never becomes authority by itself.

Each decision type needs an evaluated threshold policy:

```text
high confidence + low consequence
  -> normal software branch may continue

borderline confidence
  -> stronger model or specialist review

high consequence
  -> deterministic policy + AEGIS + human gate as required
```

Thresholds are workload-specific and version-specific. A provider/model update invalidates unverified threshold assumptions.

## Provider requirements

Every provider profile must declare:

- provider and model/version
- data handling posture
- region/hosting posture when relevant
- latency and cost envelope
- supported primitive types
- maximum state size
- retry semantics
- idempotency behavior
- timeout behavior
- version pinning
- calibration evidence
- known failure modes
- fallback route
- secret handling restrictions
- production eligibility state

## Jev candidate profile

TypeSafe AI Jev is admitted only as a candidate provider because its public design is aligned with typed decision workflows. Vendor claims remain external evidence until reproduced by Agentropolis.

No production promotion until:

1. provider access and exact API contract are verified;
2. a pinned model/version is recorded;
3. labelled Agentropolis fixtures are run;
4. calibration, false-positive, and false-negative behavior is measured;
5. adversarial state injection is tested;
6. cost and latency are receipted;
7. fallback behavior is verified;
8. AEGIS and 54-T approve the permitted workload classes.

## Local future path

A local "Mini Jev" style model can implement the same `decision.v1` contract. Local execution changes privacy and cost properties but does not change authority.

## ARC use

ARC may consume typed-decision outputs only before the Arc settlement adapter and only as advisory evidence.

Examples:

- route an investigation to the correct specialist
- choose which simulation to run
- prioritize an anomaly queue
- decide whether a stronger review is needed

Non-examples:

- authorize a transfer
- choose an unapproved recipient
- decide that a token is legally eligible
- sign a transaction
- declare final settlement

ARC authority continues to flow through ATG, Execution Envelope, AEGIS, PAYRAIL, and signed settlement receipts.
