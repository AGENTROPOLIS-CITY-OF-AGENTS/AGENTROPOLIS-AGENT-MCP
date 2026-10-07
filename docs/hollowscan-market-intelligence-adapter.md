# HollowScan Pattern Integration: Governed Market Intelligence Adapter

Status: proposed integration contract
Source pattern reviewed: https://www.hollowscan.com/
Canonical rule: signals are evidence, not orders.

## Purpose

AGENTROPOLIS adopts the useful architectural pattern behind HollowScan without cloning its product or delegating authority to an external scanner. Retail/TCG, DeFi yield, prediction-market, CEX and DEX observations enter the city as governed evidence.

## Canonical corridor

Data source -> FIN54 -> MarketEvidence -> Ontology/Thesis -> ATG compiled risk -> Execution Envelope -> AEGIS/Fiscal gates -> authorized execution adapter -> receipt -> audit/drift

No adapter may collapse evidence collection and execution authority into one uncontrolled step.

## Evidence families

### TCGMarketEvidence
- collectible identity and canonical product reference
- venue/source
- observed ask/bid/listing price
- availability/inventory signal
- estimated fees, spread and resale margin
- timestamp and jurisdiction
- provenance/evidence URI
- confidence and freshness
- simulation-only flag when used for game or paper portfolios

### YieldEvidence
- protocol/pool/asset
- APY/APR and TVL observations
- liquidity and concentration indicators
- chain/network
- timestamp and provenance
- confidence/freshness
- risk notes

### PredictionMarketEvidence
- market identifier and resolution source
- bid/ask/order-book observations
- liquidity and spread
- wallet/activity observations where lawfully available
- sentiment signal as non-authoritative evidence
- timestamp/provenance/confidence

## Authority boundaries

- Observation != recommendation
- Recommendation != authorization
- Authentication != authority
- Signal != order
- Adapter != brain
- Paper/simulated position != live financial position
- Installed != loaded != live != authorized

FIN54 normalizes and scores evidence. Ontology defines semantics and relationships. ATG compiles machine-readable risk/intent. AEGIS and fiscal policy determine whether consequential execution is permitted. Agent MCP exposes only capability-scoped interfaces. Execution adapters remain downstream and must emit receipts.

## Gaming / Agentic TCG use

TCGMarketEvidence may power:
- simulated collectible portfolios
- spread and margin challenges
- inventory-discovery quests
- provenance scoring
- market-literacy missions
- agent skill/reputation progression

Default state is simulation/paper mode. Live purchasing, listing, payment, wallet or trading actions require a separate authorized capability and Execution Envelope.

## World Grid placement

External market sources are registered as evidence providers at the World Grid boundary. Provider identity, jurisdiction, terms, freshness, trust score and allowed data classes must be explicit. World Grid routes evidence inward; it does not grant execution authority.

## Required receipts

Each consequential flow should be able to prove:
1. source observation
2. normalization/transformation
3. thesis or recommendation
4. risk compilation
5. policy decision
6. capability authorization
7. execution result, if any
8. post-execution audit/drift outcome

## Non-goals

- cloning HollowScan UX or branding
- scraping in violation of provider terms
- allowing scanners/bots to self-authorize trades
- treating sentiment as fact
- bypassing branch protection, validation, AEGIS or fiscal controls

## Integration acceptance criteria

- evidence schemas are versioned
- provenance + observed_at + freshness are mandatory
- execution fields are absent from raw evidence objects
- simulation mode is first-class
- capability scopes distinguish read/observe from execute
- all live execution paths require explicit policy gates
- receipts preserve source-to-action lineage
