# SAM Post-RC6 Canary — 2026-09-27

## Status
SAM remains TEST. RC6 exposed multi-router and cross-language reachability/reliability failures; current main contains subsequent relay-recovery, Datalog-budget and py-libp2p fixes.

## Canary topology
- >=2 routers
- at least one JS/browser member
- at least one Python member
- dropped/restarted router scenarios
- randomized first-router selection
- throttled browser/event loop
- 300+ repeated Python stream cycles
- 24h+ soak before promotion

## Required invariants
- member identity != router identity
- configured router != proven reachability
- active relay reservation is observable
- signed events accelerate state; reconciliation establishes convergence
- key/ban/policy convergence survives dropped gossip
- browser IndexedDB identity does not imply fiscal or secret-bearing authority

## Receipt fields
member_id, admitted_router_set, active_reservation, observed_reachability, convergence_epoch, last_full_reconcile_at, event_seen_at, browser_origin, runtime_language.

Do not promote an RC tag solely because it exists. Promote only a tested commit/tag baseline with clean soak evidence.
