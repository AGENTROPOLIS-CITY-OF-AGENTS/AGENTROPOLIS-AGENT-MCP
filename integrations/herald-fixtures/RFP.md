# RFP: bounded Herald integration evaluation

This is a nonbinding request-for-proposal analysis, not procurement, a compute
allocation, a spending authorization or a revenue claim.

## Objective and ownership

Evaluate whether selected Herald desktop intents can use the existing Agent MCP
membrane while 54T/AEGIS retain authority and VERITY independently reviews evidence.
HERMES retains orchestration, scheduler, provider routing and transport ownership.
No bidder should propose rebuilding those systems or the whole operating system.

## Work packages and estimate assumptions

| Package | Effort assumption | At assumed $100/hour | Acceptance |
| --- | ---: | ---: | --- |
| Phase 1 contracts/fixtures/tests/review | 40-64 hours | $4,000-$6,400 | Exact bindings, adversarial tests, reviewable evidence |
| Independent review | 8-16 hours | $800-$1,600 | Named review, resolved findings, no self-certification |
| Conditional isolated Phase 2 | Additional 24-40 hours | $2,400-$4,000 | Authenticated existing authority and containment gates |
| Maintenance | 8 hours/month | $800/month | Pin drift, test and advisory review |

These are planning estimates, not measured labor or invoices. Actual engineering
labor, model/token cost and future inference pricing were not measured. Phase 1
uses deterministic fixtures and makes no model API calls.

## Alternatives and value hypothesis

- Existing Hermes only: lowest new dependency/attack surface; no Herald desktop
  convenience. Retain this baseline for comparison.
- Reuse selected intent/UI concepts with this membrane: bounded integration effort
  and no duplicated scheduler/router/authority. Recommended experiment.
- Whole Herald OS: materially larger OS, signing, update and support burden; reject
  from this RFP scope. No credible whole-OS estimate was established.

At twenty operator hours saved/month and $100/hour value, less eight maintenance
hours, assumed net benefit is $1,200/month. Phase 1 plus independent review
($4,800-$8,000) would recover in about 4.0-6.7 months if that value is observed.
At eight hours saved/month, net operating benefit is zero. With a conditional
Phase 2 included, assumed recovery becomes 6.0-10.0 months. No benefit is claimed
until task timing and quality are independently measured.

## Bid/evaluation requirements

Require fixed scope, exact source pins, no new authority or provider transport,
zero live credentials, dependency/license disclosure, replay/evidence failure
tests, rollback demonstration and review rights. Score containment and evidence
before convenience or cost. Reject hidden persistence, broad grants, operational
certification claims or production attachment inside Phase 1.

Measure successful task time, approval burden, denial quality, failure recovery,
model/compute cost, maintenance time and evidence completeness against existing
Hermes. Expansion requires positive net value and every Phase 2 admission gate.
