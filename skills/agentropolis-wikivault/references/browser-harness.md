# Browser Evidence Harness

Use the browser only when structured Git, API, file, ledger, or database access cannot answer the task.

## Modes

- OBSERVE: open, read, snapshot, screenshot, inspect metadata, save evidence.
- NAVIGATE: click, scroll, filter, paginate, switch tabs on approved domains.
- AUTHENTICATE: use an isolated user-approved session without exposing credentials.
- INTERACT: fill forms, upload or download files only with explicit permission.
- EXECUTE: publish, purchase, mint, sign, delete, send, or mutate; default deny and require approval.

## Evidence requirements

Capture URL, final URL, title, backend, profile class, interaction mode, capture type, observed text or structured fields, timestamp, screenshot or snapshot hash, auth state, and provenance.

## Bounded assignments

Every browser job must define start URLs, allowed domains, maximum pages, maximum depth, timeout, extraction fields, prohibited actions, and download policy.

## Verification pattern

Use browser evidence to compare intent with deployment:

`PLANNED -> IMPLEMENTED -> DEPLOYED -> OBSERVED -> VERIFIED`

A visible UI does not prove backend behavior. A repository declaration does not prove deployment. Keep the states separate.
