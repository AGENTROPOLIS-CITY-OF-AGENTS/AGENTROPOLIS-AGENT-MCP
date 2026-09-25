# AGENTROPOLIS Runtime Guard Provider Contract

## Status
Proposed canonical interface for runtime enforcement providers.

## Doctrine
AGENTROPOLIS owns identity, mandate, policy, execution envelopes, receipts, audit semantics, and authority. Runtime security products are replaceable enforcement providers.

A provider may intercept and enforce. It may not author, enlarge, or weaken AGENTROPOLIS authority.

## Control path

```text
Identity
  -> Mandate
  -> Execution Envelope
  -> AEGIS decision
  -> Runtime Guard
  -> AGENT-MCP / tool / API / shell
  -> execution result
  -> receipt
  -> 54T assurance + audit
```

## Canonical action event

Every execution surface MUST normalize into a provider-neutral event before enforcement:

```json
{
  "event_version": "1.0",
  "trace_id": "string",
  "actor": {"agent_id": "string", "credential_id": "string"},
  "mandate_id": "string",
  "execution_envelope_id": "string",
  "tool": {"name": "string", "capability": "READ|WRITE|EXECUTE|NETWORK|MONEY|IDENTITY|SECRETS|DEPLOY|PUBLISH|ADMIN|GOVERNANCE"},
  "resource": "string",
  "input_digest": "sha256:...",
  "data_classification": "PUBLIC|INTERNAL|CONFIDENTIAL|RESTRICTED",
  "risk_tier": 0,
  "requested_at": "RFC3339"
}
```

## Decision contract

Providers MUST implement the semantics of:

- ALLOW
- DENY
- STEP_UP
- REDACT
- REWRITE
- SANDBOX
- QUARANTINE

No provider-specific decision may silently bypass this set. Provider-native verdicts MUST be translated into the canonical contract.

## Provider interface

```text
inspect(event)
evaluate(event)
intercept(event)
redact(result)
approve(event)
emit_finding(event)
health()
```

## Provider model

Initial providers:

- native
- prismor
- nemoclawm-native or equivalent runtime-native control
- mock/test

Prismor is an optional provider, not an architectural dependency.

## Mandatory invariants

1. A provider cannot grant authority absent a valid mandate and execution envelope.
2. A provider cannot modify its own governing AEGIS policy.
3. A provider cannot widen scope because a tool is technically available.
4. Secrets are referenced, not exposed to model context.
5. Every allow, deny, step-up, redaction, rewrite, sandbox, and quarantine decision emits a receipt.
6. Denied actions produce explicit denial evidence.
7. Provider failure defaults to policy-defined fail-closed behavior for consequential capabilities.
8. Economic actions require separate fiscal policy and are never inferred from generic tool permission.
9. Detection is evidence, not authority.
10. The system MUST remain operable if any single third-party provider is removed.

## Prismor adapter boundary

A Prismor adapter MAY supply:

- MCP interception
- framework hooks
- egress enforcement
- secret cloaking
- package and supply-chain checks
- prompt-injection findings
- approval UX
- telemetry

It MUST NOT own:

- Agentropolis identity
- credentials or reputation authority
- mandate issuance
- Execution Envelope semantics
- AEGIS source policy
- audit canon
- 54T assurance conclusions
- economic authorization

## Receipt minimum

Each runtime enforcement receipt records:

```text
trace_id
actor
mandate_id
execution_envelope_id
policy_version
provider
provider_version
requested_capability
decision
reason_code
approval_reference
result_digest
finding_references
timestamp
```

## Integration rule

AGENT-MCP is the capability membrane. Runtime Guard enforcement occurs before consequential capability execution and returns canonical decision evidence back into the receipt/audit corridor.
