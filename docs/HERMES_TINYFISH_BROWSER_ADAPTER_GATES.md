# HERMES / TinyFish / browser adapter admission
Status: EVALUATION ONLY, no first-party integration installed or production traffic authorized. Date: 2026-10-09.

## Source distinction
A screenshot dated Oct 8, 2026 advertises TinyFish as a Hermes first-party plugin, `hermes plugins install tinyfish`, and claims Search/Fetch are free while Browser/Agent prompt before spending credits. This is a claim in supplied marketing imagery, not independently verified billing, signing, API support, provenance, scope or installed state. Do not execute installer or expose API tokens before source/authenticity and supply-chain review.

## Canonical corridor
`AGENT-ENTITY -> active credential and skill eligibility -> workspace+bot scope -> mandate -> ATG web action -> execution envelope -> AEGIS policy -> 54T independently verified containment + egress -> permissioned AGENT-MCP browser adapter -> sanitized observation -> signed receipt -> VERITY`.

## Capability registry candidate (disabled by default)
- `WEB_SEARCH`: read-only sanitized search result, no auth or session access.
- `WEB_FETCH`: only allowed domains/method GET, short TTL, strict response/body caps, injection quarantine.
- `BROWSER_NAVIGATE`: disposable browser with egress host allowlist, site-specific task scope, explicit approval of any login or write.
- `BROWSER_AGENT`: constrained multi-step tasks with per-step authorization and budget ceiling; no unattended administrative, billing, wallet or publication actions.

## Mandatory protections
1. Compare signed plugin version and exact hash against trusted developer docs and allowlist; verify installer execution model, license, outbound endpoints, data retention, telemetry, credential handling, prompts and charge schedule.
2. No command installation in operator host context, no import of operator's logged-in Chrome/Brave/Opera etc.; isolate all browser state in disposable execution.
3. Per-call `workspace_id`, `profile_id`, `bot_id`, credential reference, mandate, execution envelope, exact URL/method, capability epoch, approval digest, max price and expiry.
4. Never assume "free search/fetch" exempts egress, privacy, injected webpage, SSRF, tool or authorization checks.
5. Hostname validation with DNS rebinding / localhost / private IP / redirect defenses; separate READ from WRITE / admin and require step-up for side effects.
6. Deny if payment quote changes, approval missing, charge exceeds ceiling, runtime attestation stale, third-party provider unreachable, or receipt storage unavailable.
7. Output secret-redacted receipts: request id, principal, workspace, tool, plugin+epoch, scoped target, policy/verifier result, budget/actual charge when available, digest, timestamp; never cookies/tokens/browser profiles.
8. Do not expand authority when Hermes plugin capability changes; rerun 54T, AEGIS and VERITY review.

## Proof required before admission
Supplier verification; plugin pinning/SBOM; sandbox/egress negative tests; tenancy negative tests; billing consent dry-run with zero-credit guard; prompt-injection tests; output redaction; replay tests; independent exact-head audit and human approval.

Related: HERMES-CITY browser fleet PR #75, 54T containment contract, AEGIS runtime assurance profile, AGENT-MCP runtime guard provider contract. A proposal is not a running adapter.
