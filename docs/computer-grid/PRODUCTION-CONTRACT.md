# Computer Grid production integration contract

Status: IMPLEMENTATION REQUIREMENTS; NOT PRODUCTION-READY. Applies to PR #133.

## Canonical sources (do not fork these contracts)
- [Design System](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-DESIGN-SYSTEM): README.md, DESIGN-CONTRACT.md, tokens/, runtime-surfaces/, js/loop-baseline.js, QUANTIZATION-CONTRACT.md.
- [Deployment Quantization Protocol v1](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-DEPLOY/blob/main/docs/QUANTIZATION-PROTOCOL.md): measured Q0-Q5 public-surface release gate.
- [Torque 2.0 Thermal Governor](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-SYSTEM-STEWARD/blob/main/docs/QUANTIZATION-TORQUE-2-THERMAL-GOVERNOR.md): context, compute, render and thermal governor; COOL/WARM/HOT/CRITICAL with hysteresis.
- [Quantization Torque cross-stack doctrine](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/PUBLIC-PORT-DISTRIBUTION-MEMBRANE/blob/main/docs/QUANTIZATION_TORQUE.md): precision, retrieval, context, cost-aware execution. Distinct from deployment payload quantization.
- [WORLDQ](https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-WORLDQ): separate spatial LOD/streaming; verify Q0-Q5 specification before implementation.

## Mandatory UI
Use version-pinned design tokens: obsidian neutral environment, cyan authorized/verified/connected, red risk/denial/approval-required. Primary operator experience should preserve semantic spatial city navigation, not become a generic SaaS dashboard. Dense diagnostics live in protected inspectors. Include operator takeover, workspace status, mandate, policy, receipts and audit states. Show real states only; never display simulated operational health as live.

Presentation tiers: FULL, ADAPTIVE, LITE, MINIMUM; preserve meaning, authorization, controls, receipts, accessibility and reduced-motion options at every tier. Client is a control surface; remote workers perform heavy compute when appropriate.

## Quantization release gates
Q0 preserve source; Q1 initial compressed JS <=358400 bytes, no nonessential 3D or film/audio before intent, no Three/R3F/Drei server path; Q2 load heavy systems only after explicit intent; Q3 use responsive AVIF/WebP, appropriate compressed 3D and LOD; Q4 produce measured receipt; Q5 block promotion if measured evidence fails or is absent. Receipt fields: artifact bytes, media bytes, initial compressed JS, pre-intent 3D/media bytes, server 3D execution, largest initial image, deferred systems, preserved exclusions, PASS/FAIL. No inferred waivers.

## Torque 2.0 routing
Device Passport -> capability profile -> runtime telemetry -> thermal governor -> context/compute/render/network policy -> provider selection -> execution receipt. State COOL/WARM/HOT/CRITICAL; transitions require hysteresis. HOT suspends optional local inference; CRITICAL stops nonessential local compute but preserves approvals and receipt access. Browser thermal telemetry must be labeled heuristic. Routing receipt records signal source, state, context policy, execution lane, quantization profile, render profile, fallback reason, policy state and benchmark state. No unsupported provider compaction fields.

## Bounded cognition
Cheap Gates -> Reflex Decision -> Confidence Gate -> QRAG -> Verify -> Dense Feedback -> Quantization Torque -> Receipt -> Audit. Classifier confidence is evidence, never authority. Use reviewed pinned loop-baseline.js rather than live mutable cross-repo script.

## Provider integration acceptance
E2B, Daytona, Open WebUI Computer and Agent Zero each require verified upstream URL, license, self-host feasibility, threat model, pinned version, adapter tests, revocation, quotas, off-host receipt evidence, and independently reviewed containment. No OpenClaw deployment. No production tokens, wallets, cloud provisioning or production merge from this documentation-only PR.

## Production promotion checklist
- [ ] Canonical token/version references pinned and UI implementation built
- [ ] Four upstream licenses and supported deployment modes verified
- [ ] Provider adapters implemented with contract and integration tests
- [ ] 54T isolation, egress, credential and transitive-capability checks passed
- [ ] Torque 2.0 state transitions and routing receipts tested
- [ ] Q0-Q5 measured payload receipt validated by AGENTROPOLIS-DEPLOY
- [ ] Accessibility, reduced-motion, FULL/ADAPTIVE/LITE/MINIMUM tested
- [ ] VERITY independent assurance receipt, AEGIS policy review, human release approval
- [ ] CI green, branch protections satisfied, deployment receipt and rollback plan

Never mark a checkbox complete without a reproducible artifact or independent evidence.
