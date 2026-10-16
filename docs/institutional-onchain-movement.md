# Agent MCP Contract: Institutional Market Evidence

## Purpose
Expose normalized FIN54 institutional onchain intelligence to authorized agents without turning market-data access into execution authority.

## Proposed read capabilities
- market_evidence.get
- institutional_regime.get
- iomi.snapshot.get
- asset_migration.get
- institutional_flow.get
- settlement_velocity.get
- network_concentration.get
- provenance.get

## Separation of capability
Read capability MUST be separate from any execution capability.

An agent authorized to read market evidence is not thereby authorized to trade, transfer, mint, burn, bridge, settle, or modify financial state.

## Required response metadata
- evidence_id
- source
- observed_at
- confidence
- jurisdiction
- asset_class
- network
- regime
- freshness
- receipt_reference

## Governance
Any request that would turn evidence into consequential action chains through ATG and AEGIS before an execution adapter is reachable.
