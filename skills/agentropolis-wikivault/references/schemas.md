# Schemas

## Evidence record

Required fields:

```json
{
  "record_id": "ev_...",
  "record_type": "CLAIM",
  "namespace": "example",
  "canon_status": "UNKNOWN",
  "evidence_state": "OBSERVED",
  "confidence": 0.9,
  "content": "normalized claim or fact",
  "provenance": {
    "source_type": "github",
    "source": "owner/repo",
    "ref": "main",
    "commit_sha": "...",
    "path": "docs/example.md",
    "line_start": 10,
    "line_end": 14,
    "content_sha256": "...",
    "observed_at": "2026-08-07T00:00:00Z"
  }
}
```

Controlled `canon_status` values:

- LOCKED_CANON
- ACTIVE_CANON
- PROVISIONAL
- CONCEPT
- DEPRECATED
- SUPERSEDED
- CONTRADICTED
- UNKNOWN

Controlled `evidence_state` values:

- PLANNED
- IMPLEMENTED
- DEPLOYED
- OBSERVED
- VERIFIED
- UNVERIFIED

## Relationship record

```json
{
  "relationship_id": "rel_...",
  "from_id": "entity_a",
  "type": "IMPLEMENTS",
  "to_id": "entity_b",
  "namespace": "example",
  "confidence": 0.92,
  "provenance_ids": ["ev_..."]
}
```

## Conflict record

```json
{
  "conflict_id": "conf_...",
  "record_ids": ["ev_a", "ev_b"],
  "classification": "CONFLICT",
  "status": "OPEN",
  "recommended_action": "human_review",
  "reason": "two active sources disagree"
}
```

Conflict classifications:

- EXACT_DUPLICATE
- LIKELY_DUPLICATE
- VARIANT
- FORK
- SUCCESSOR
- CONFLICT
- INDEPENDENT

## Scan manifest

Store scan ID, source scope, started/completed timestamps, authority profile, adapters, model receipts, checkpoints, counts, omissions, quarantines, conflicts, validation state, and checksum root.
