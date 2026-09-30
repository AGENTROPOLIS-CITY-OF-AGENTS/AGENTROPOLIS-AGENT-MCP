# Architecture

## Operating principle

The model is replaceable. The control plane is persistent. The compute plane is disposable. The evidence is traceable.

## Layers

1. Control plane: scan state, policy, provenance, approvals, checkpoints, budgets, and receipts.
2. Source adapters: GitHub, local files, uploads, browser evidence, ledger, database, and future connectors.
3. Ingest membrane: quarantine, secret detection, prompt-injection handling, MIME and size checks, source policy.
4. Ephemeral compute: repo clone, parser, browser, code analysis, NFT normalization, and test sandboxes.
5. Knowledge refinery: extract, normalize, deduplicate, relate, conflict-check, and classify.
6. Memory and graph: evidence records, entities, relationships, conflicts, review queue, retrieval chunks.
7. Export layer: portable vault, Markdown, JSONL, RAG, graph, Hermes, OpenClaw, and generic MCP consumers.

## Context budget governor

Do not hardcode a context window. Probe or configure the model budget, reserve output and tool space, and process repositories hierarchically.

Recommended task envelope fields:

- task_id
- task_type
- required_capabilities
- input_token_estimate
- output_reserve
- tool_reserve
- safe_context_target
- checkpoint_id
- model_binding
- budget_state

When context, result size, or time limits are reached, persist a checkpoint and continuation token. Never restart an account-wide scan from zero.

## Model routing

Select models by task, not by vault identity. Preserve state outside the model.

- deterministic lane: hashing, manifests, validation, file classification
- small model lane: normalization and narrow extraction
- bulk model lane: entity and relationship extraction
- strong model lane: conflict review and architecture synthesis
- specialist lane: vision, source-code parsing, ledger verification

Every model call should produce a receipt containing model/provider identifier, task ID, policy state, input provenance references, and output record IDs without storing raw secrets.

## Thermodynamic observability

Track the cost and stability of the refinery itself:

- evidence growth rate
- contradiction rate
- unresolved conflict count
- duplicate ratio
- stale-source ratio
- retry rate
- tool failure rate
- context truncation rate
- average cost or latency per accepted record
- drift between current canon and newly observed evidence

Use these signals to trigger review, not autonomous canon changes.
