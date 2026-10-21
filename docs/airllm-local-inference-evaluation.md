# AirLLM local inference evaluation (proposal only)

Status: evaluation, NOT deployed or authorized for privileged use.
Upstream: https://github.com/lyogavin/airllm

## Objective
Evaluate layer-streamed inference as an optional, isolated backend for oversized models. Do not replace Hermes, NemoClaw/Nemotron, or existing model routing.

## Gates
1. Record target hardware: OS, CPU, RAM, GPU, VRAM, free SSD, storage throughput and Python/CUDA compatibility. No hardware assumptions.
2. Pin and review upstream commit, dependencies, model licenses, and model artifact provenance. Run in a disposable, unprivileged environment with no wallet keys, production credentials, or unrestricted network access.
3. Benchmark against an existing local baseline on identical prompts: cold start, first-token latency, tokens/sec, peak VRAM/RAM, disk usage, quality, failures, and energy where measurable. Record model revision, quantization, context length and environment.
4. Only consider a feature-flagged router adapter after tests and review. Default disabled, explicit opt-in; fail closed on errors; no silent cloud fallback.
5. Keep signals as evidence, never orders. No trading, payments, privileged tools, or wallet authority. Require mandate, execution envelope, policy approval, receipts, and independent audit before consequential action.
6. VERITY/54T review required before merge or runtime activation. Never bypass branch protections.

## Acceptance criteria
- Reproducible hardware and benchmark receipt with exact versions and commands.
- Measured comparison demonstrates a worthwhile workload-specific tradeoff.
- Security and dependency review documented; no privileged capability introduced.
- Separate implementation PR for any adapter, with tests and rollback plan.

This document does not claim AirLLM compatibility, performance, installation, or operational integration on any AGENTROPOLIS device.
