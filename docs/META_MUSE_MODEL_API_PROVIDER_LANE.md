# Meta Muse Model API — non-executing provider candidate

**State:** PROPOSED / DISABLED / NOT VERIFIED. Existing Muse Glimmer local sandbox work remains in [PR #48](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AGENT-MCP/pull/48); do not duplicate or silently merge it.

Official docs: https://dev.meta.ai/docs/overview

## Provider registration intent

```yaml
provider_id: meta-muse-standard
kind: model_api_provider
base_url: https://api.meta.ai/v1
api_protocol: openai_compatible
credential_source: secret_broker_only
credential_env: MODEL_API_KEY
default_model: muse-spark-1.3
contributor_models_allowed: false
status: candidate
production_enabled: false
invocation_enabled: false
sensitive_data_allowed: false
authority_ceiling: DRAFT_ONLY
required_controls: [identity, mandate, aegis_policy, 54t_containment, budget, scoped_egress, validation, receipt]
```

**Note:** `a egis_policy` in this illustrative control list means the AEGIS policy decision. The list is descriptive and not a deployable policy manifest.

Additional independent candidates: `muse-image-1.0`, `muse-voice-transcribe-1.0` (speech-to-text only), `sam-3.1`. Muse Glimmer is self-hosted, not a Meta Model API call. Muse Code is a CLI harness, not a Model API model.

## Hard denials

- Contributor tier for proprietary or sensitive workflows; no undocumented privacy guarantees.
- Keys or account details in prompts, repository config, logs or receipt bodies.
- Direct, ungated MCP tool invocation using model output.
- Wallet, payment, production mutation, deploy, and irreversible writes.
- Autonomous CLI installation or `--yolo`, `--disable-sandbox`, `--disable-approval` under Muse Code.
- Model self-approval and automatic promotion by benchmark position.

## Required implementation before any first call

1. Secret-broker identity and endpoint verification with explicit destination allowlist.
2. Human-approved synthetic-data canary, bounded spend and complete request/response metadata redaction.
3. 54T/AEGIS threat review, dataset rights review for media and independent VERITY challenge set.
4. No production adapter integration until PR review and runtime tests show fail-closed default, rollback and denial receipts.

## Receipt contract

Fields: `mandate_id`, `model_id`, `data_class`, `approval_ref`, `policy_version`, `request_hash`, `model_revision`, `tokens_in`, `tokens_out`, `estimated_usd`, `actual_usd_if_known`, `latency_ms`, `egress_decision`, `output_validation`, `deny_reason`, `verifier_ref`.

No execution path is wired by this document. This is intentional: public MCP remains read-only and provider eligibility is never inferred from availability.
