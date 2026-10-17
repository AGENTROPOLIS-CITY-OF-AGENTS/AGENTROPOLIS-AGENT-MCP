# ADR-0001: MNEMOS54 governed agent memory (proposal)
Status: PROPOSED — no production integration authorized.

## Decision sought
Create a dedicated AGENTROPOLIS-MNEMOS54 repository after architectural review. Use Tencent Hy-Memory as a comparative reference, not an assumed runtime dependency. Hermes remains the current build orchestrator; AGENTROPOLIS gates are target architecture, not live controls.

## Scope
Eight logical memory domains: identity, episodic, semantic, procedural, mission, engineering, economic, audit. Logical domains do not imply separate databases. Audit records must reference independently verifiable off-host receipts, never treat mutable memories as authoritative proof.

## MVP
- Local-first SQLite with FTS5; optional embeddings/graph behind adapters.
- Typed memory record: id, tenant_id, agent_id, workspace_id, repository_id, domain, source_ref, evidence_hash, asserted_at, observed_at, valid_from, valid_until, confidence, status, supersedes_id, classification, retention_policy, payload.
- append-only revision log and explicit tombstone/deletion workflow with retention controls.
- APIs: add, search, reconcile, supersede, revoke, export, audit_refs. Every read/write requires explicit identity, mandate and scope; deny by default.
- Source content is untrusted data: quarantine injection patterns, never promote memory to instructions or tool authority.
- Git adapter captures commit SHA, diff hash, test evidence, branch and review status; no automatic merge authority.
- Hermes adapter operates sandbox-only and cannot alter existing Hermes memory by default.

## Evaluation gates
1. Inventory Hermes session persistence and existing AGENTROPOLIS memory implementations to prevent duplication.
2. Review upstream Hy-Memory license, implementation, model requirements and supply-chain risk.
3. Build isolated benchmark corpus with seeded contradictions, expired facts, poisoning attempts, cross-tenant retrieval attempts, coding revisions and multi-session handoffs.
4. Compare identical retrieval budgets and tasks: recall precision/recall, conflict resolution, leakage rate (target zero), evidence attribution, p50/p95 latency, tokens per task and cost.
5. Require threat model, RFP cost-benefit analysis, independent VERITY review and PASS/FAIL/BLOCKED evidence before approval.

## Authority separation
Memory -> candidate context only. Identity + mandate + policy -> authorization. Tool execution -> bounded execution envelope. Receipt -> independently validated evidence. No retrieved text can confer permission.

## Next steps
Codex drafts prototype in a dedicated repository after repo creation; Hermes coordinates; VERITY independently reviews. No deploy, merge, secrets access or cross-repository write without separate approval.

## Reference
https://github.com/Tencent-Hunyuan/Hy-Memory
https://huggingface.co/tencent/Hy-Memory-30B-A3B
