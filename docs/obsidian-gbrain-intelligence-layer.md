<!--
Reference copy. Canonical edition (PROPOSED, NEURO decision 2026-10):
  AGENTROPOLIS-CITY-OF-AGENTS/PUBLIC-PORT-DISTRIBUTION-MEMBRANE:docs/obsidian-gbrain-intelligence-layer.md
Provenance: this file previously held a tailored full copy (blob 11cd069e, commit 2c07f0a2, 2026-07-05 PT; never edited
since). Its core sections conflicted with current law in this repo (src/jspace.js: "Obsidian is human-editable memory, not
automatic proof"; docs/JSPACE_PRODUCTION_BETA_RUNBOOK.md: "No JSpace path may ... write directly to gBRAIN"), and it
recommended a direct `gbrain` upsert write surface. Core text is replaced by the reference below; the MCP-specific overlay is
kept and rewritten to the governed staging/projection contract. Prior text is recoverable from git history.
Guarded by tests/knowledge-doc-drift.test.mjs. Prepared by Grok Bot (bounded implementation); not independently verified by VERITY.
-->

# Obsidian + gBRAIN Intelligence Layer (AGENTROPOLIS-AGENT-MCP reference)

The canonical edition of this document lives in
`AGENTROPOLIS-CITY-OF-AGENTS/PUBLIC-PORT-DISTRIBUTION-MEMBRANE` at `docs/obsidian-gbrain-intelligence-layer.md`.
This repository keeps this reference plus the MCP overlay below. Overlays may add detail; they may not contradict the
canonical Layer Roles or the Governed Write Contract.

| Layer | Role |
| --- | --- |
| WikiVault | Owns governed evidence and canon (promotion-gated). |
| Obsidian | Human-readable / human-editable knowledge; not canon until promoted. |
| gBRAIN | Derived, rebuildable claims graph; written only by the projection job. |
| J-Space | Contextual reasoning; derived and read-only. |
| MCP | Tool boundary that exposes approved read surfaces and governed staging surfaces to agents. |

## AGENTROPOLIS-AGENT-MCP overlay: MCP Exposure Rules

Expose knowledge to agents as bounded tools, not unrestricted memory soup. **No MCP tool may write directly to gBRAIN.**

Read surfaces:

- `vault.search`
- `vault.fetch_note`
- `gbrain.search_claims`
- `gbrain.list_entity_context`

Governed staging surfaces (proposals only; never served as fact):

- `claims.stage_proposal` (new claim, entity link, or bet resolution proposal)
- `claims.get_proposal_status`

Every staged proposal must carry:

- holder
- kind
- statement
- source (WikiVault id, note path, or URL) and source content hash
- confidence
- proposed_by (agent id)
- created date
- resolution status and criteria for bets

Promotion is performed by a non-producing reviewer (VERITY or delegated reviewer; NEURO for canon locks) into
WikiVault/Obsidian with a promotion receipt. gBRAIN is then updated only by the deterministic projection job, which stamps
`projected_from` and `projection_run_id` on every claim, so gBRAIN can always be rebuilt from governed sources.
