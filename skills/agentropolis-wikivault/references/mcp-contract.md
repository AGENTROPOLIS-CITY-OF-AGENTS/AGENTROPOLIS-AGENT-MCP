# MCP Contract

## Transports

Support local stdio and remote Streamable HTTP through adapters. Keep authentication, rate limits, origin validation, and authority ceilings explicit.

## Authority profiles

- OBSERVE: read inventory and evidence.
- ANALYZE: extract, compare, normalize, and score.
- DRAFT: prepare change plans and pull requests.
- EXECUTE: perform approved mutations through a separate authenticated execution corridor.

Default public authority is OBSERVE + ANALYZE only.

## Tool families

Discovery:
- wikivault.list_sources
- wikivault.list_repositories
- wikivault.inventory_repository
- wikivault.search_sources

Scanning:
- wikivault.start_scan
- wikivault.get_scan_status
- wikivault.get_scan_report

Extraction:
- wikivault.extract_entities
- wikivault.extract_relationships
- wikivault.extract_decisions
- wikivault.extract_timelines

Governance:
- wikivault.list_conflicts
- wikivault.inspect_conflict
- wikivault.propose_resolution

Exports:
- wikivault.export_jsonl
- wikivault.export_markdown
- wikivault.export_graph
- wikivault.export_rag
- wikivault.export_portable_vault

Browser evidence tools and publication tools must live behind separate capability gates.

## Resources

Recommended resource URIs:

- wikivault://manifest
- wikivault://sources
- wikivault://scans/{scan_id}
- wikivault://entities/{entity_id}
- wikivault://conflicts
- wikivault://review-queue
- wikivault://provenance/{record_id}

## Prompts

Recommended reusable workflows:

- repository-census
- full-knowledge-scan
- architecture-recovery
- canon-review
- conflict-review
- nft-collection-audit
- xrpl-reconciliation
- prepare-rag-export
