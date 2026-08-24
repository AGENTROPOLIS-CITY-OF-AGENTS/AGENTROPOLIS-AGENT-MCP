# Output Layout

Recommended portable vault:

```text
wikivault-export/
  manifest.json
  evidence.jsonl
  entities.jsonl
  relationships.jsonl
  conflicts.jsonl
  review-queue.jsonl
  retrieval-chunks.jsonl
  provenance.jsonl
  checksums.json
  nft/
    collections.jsonl
    tokens.jsonl
    traits.jsonl
    rarity-models.jsonl
    utilities.jsonl
    mint-phases.jsonl
    xrpl-links.jsonl
```

Hermes or other runtime-specific exports should be derived from this portable representation rather than becoming the canonical storage format.

Every export must include source scope, scan ID, schema version, creation timestamp, validation status, and checksum manifest.
