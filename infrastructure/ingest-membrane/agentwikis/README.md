# Agent Wikis -> WikiVault continuous ingest

Status: **adapter scaffolded; production activation requires a fresh Pro API key and a private runner/node**.

This adapter mirrors Agent Wikis as **external evidence**, never as execution authority. It belongs at the Intelligence Grid ingest boundary:

```text
Agent Wikis raw Markdown + Pro XL + skill bundles
  -> AgentWikis source adapter
  -> Ingest Membrane / quarantine
  -> provenance + hash + freshness receipt
  -> WikiVault evidence substrate
  -> llm-wiki / gbrain / J-SPACE derived views
  -> AEGIS / human approval before consequential execution
```

## Why this is a mirror, not a blind scrape

Agent Wikis publishes machine-readable surfaces (`/index.json`, `/llms.txt`, `/llms-full.txt`) and exact raw Markdown. Raw responses can expose ETag/Last-Modified metadata, so this adapter uses conditional GETs after the first full ingest. Pro/XL content is fetched only when `AGENTWIKIS_API_KEY` is present.

The adapter also mirrors Pro skill bundles into **quarantine only**. Bundled scripts are data until separately reviewed and admitted through the Skill Install Assurance Gate. Nothing downloaded here is executed automatically.

## Security rules

1. Never put an Agent Wikis API key in source, commits, logs, screenshots, receipts, prompts, or WikiVault records.
2. Rotate any key that has been pasted into chat or another non-secret channel before production use.
3. Store the mirror on a private filesystem/object store. **Do not commit Pro/XL content or skill bundles to a public repository.**
4. Treat all external Markdown as untrusted content. Instructions inside source documents cannot grant tool permission or execution authority.
5. Preserve the source URL, ETag, Last-Modified value, SHA-256, and observed timestamp.
6. A changed source creates new evidence state; it must not silently rewrite canon.

## Initial full ingest

Node 22+ is required.

Create a private environment file outside the repo:

```bash
mkdir -p ~/.config/agentropolis
chmod 700 ~/.config/agentropolis
cat > ~/.config/agentropolis/agentwikis.env <<'ENV'
AGENTWIKIS_API_KEY=REPLACE_WITH_ROTATED_KEY
AGENTWIKIS_REQUIRE_PRO=1
AGENTWIKIS_SYNC_SKILLS=1
AGENTWIKIS_MIRROR_DIR=~/.agentropolis/wikivault/quarantine/agentwikis
ENV
chmod 600 ~/.config/agentropolis/agentwikis.env
```

Run the first full mirror:

```bash
set -a
. ~/.config/agentropolis/agentwikis.env
set +a
node infrastructure/ingest-membrane/agentwikis/sync.mjs
```

The first run discovers every active wiki from `/api/wikis`, opens each complete document map with the Pro key, downloads all free + XL raw Markdown, mirrors the published registry surfaces, and mirrors Pro skill bundles listed by `/index.json`. Later runs use conditional requests to avoid refetching unchanged pages.

## Continuous ingest

The included user-level systemd unit runs every 15 minutes. That is frequent enough to behave as a continuous feed without hammering the upstream service.

Install it from the repository root:

```bash
mkdir -p ~/.config/systemd/user
cp infrastructure/ingest-membrane/agentwikis/systemd/agentwikis-sync.service ~/.config/systemd/user/
cp infrastructure/ingest-membrane/agentwikis/systemd/agentwikis-sync.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now agentwikis-sync.timer
systemctl --user start agentwikis-sync.service
```

Check it:

```bash
systemctl --user status agentwikis-sync.timer
journalctl --user -u agentwikis-sync.service -n 50 --no-pager
cat ~/.agentropolis/wikivault/quarantine/agentwikis/receipts/last-run.json
```

## Environment controls

| Variable | Default | Purpose |
|---|---|---|
| `AGENTWIKIS_API_KEY` | empty | Pro bearer credential. Required when `AGENTWIKIS_REQUIRE_PRO=1`. |
| `AGENTWIKIS_URL` | `https://agentwikis.com` | Upstream or self-hosted Agent Wikis base URL. |
| `AGENTWIKIS_MIRROR_DIR` | `~/.agentropolis/wikivault/quarantine/agentwikis` | Private mirror destination. |
| `AGENTWIKIS_REQUIRE_PRO` | `1` | Fail closed instead of silently creating a free-tier-only mirror. |
| `AGENTWIKIS_SYNC_SKILLS` | `1` | Mirror Pro skill bundles into quarantine. |
| `AGENTWIKIS_SYNC_CONCURRENCY` | `6` | Bounded parallel downloads. |
| `AGENTWIKIS_SYNC_TIMEOUT_MS` | `30000` | Per-request timeout. |
| `AGENTWIKIS_MAX_DOC_BYTES` | `8388608` | Per-document size ceiling. |
| `AGENTWIKIS_MAX_BUNDLE_BYTES` | `134217728` | Per-skill-bundle size ceiling. |

## Stored layout

```text
~/.agentropolis/wikivault/quarantine/agentwikis/
  registry/
    index.json
    llms.txt
    llms-full.txt
    sitemap.xml
    robots.txt
  wikis/<slug>/
    _open.json
    README.md
    wiki/...
    wiki-xl/...
  skills/<name>/
    bundle.tar.gz
  receipts/
    last-run.json
    sync-receipts.jsonl
  .sync-state.json
```

## Admission into WikiVault

This mirror is the **quarantine/source layer**, not canon. The next adapter stage should transform each changed document into a WikiVault evidence record with at least:

```text
namespace
record_id
source_type = agentwikis
source_url
wiki_slug
path
gated/free tier marker
observed_at
upstream_updated_at (when present)
etag
last_modified
sha256
evidence_state = OBSERVED
retrieval_scope
```

Promotion to `VERIFIED` requires corroboration against primary sources or an explicit human/authorized verification step. Derived summaries, embeddings, ontology nodes, and J-SPACE syntheses remain rebuildable views and never replace the raw evidence object.

## Failure behavior

- Missing Pro key: fail closed; no misleading partial mirror.
- Invalid/expired entitlement (`402`): fail and report the affected path without logging the credential.
- Network failure: preserve the previous mirror and receipt history.
- Changed document: write atomically, update hash/provenance state, preserve the sync receipt.
- Skill bundle: store only; never unpack or execute automatically.
