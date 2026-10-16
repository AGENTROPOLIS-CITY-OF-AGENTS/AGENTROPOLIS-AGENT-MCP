# Candidate intelligence MCP capabilities
Status: registered proposals only; **not installed, reachable, live or authorized**.

| Capability candidate | Data classification | Ceiling | Owner |
|---|---|---|---|
| `fin54.social_claim.audit` | public financial claim | READ_ONLY | FIN54 |
| `osint.image_privacy_exposure.review` | consented image | READ_ONLY | 54T / OSINT |
| `hermes.bills.register.review` | operator-provided financial records | READ_ONLY | Hermes / financial policy |
| `model.local_layer_offload.benchmark` | non-sensitive model fixtures | TRIAL | Model council / BE |
| `model.nous_missingno.evaluate` | non-sensitive evaluation data | TRIAL | BE |
| `model.mistral_large4.evaluate` | non-sensitive evaluation data | TRIAL | BE |

All candidate adapters must declare version, input/output schema, provenance, credentials/scope policy, allowed destinations, rate/cost ceiling, data retention, failure handling and receipt emission. Unknown fields and authority gaps fail closed.

No wallet signer, seed phrase access, trade submission, broker account access, payment execution, passive targeted tracking, unrestricted web browser, or automated public publishing may be exposed by these capabilities. Gate external data through ingest membrane and prompt injection checks.

HERMES may dispatch only after adapter implementation + test proof + AEGIS authorization + a scoped runtime mandate. Candidate documentation is not an installation receipt.
