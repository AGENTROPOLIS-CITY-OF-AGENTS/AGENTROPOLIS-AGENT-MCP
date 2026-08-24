# AGENTROPOLIS Agent MCP Model Council Routing

This MCP kit should not bind every agent to one model. It should expose a provider-aware routing layer where HERMES can select the right approved intelligence lane for each tool call.

## MCP Routing Lanes

| MCP Lane | Model Candidates | Use |
| --- | --- | --- |
| Planner Baseline | `deepreinforce-ai/Ornith-1.0-35B`, `deepreinforce-ai/Ornith-1.0-35B-FP8` | multi-step planning, agent routing, workflow decomposition |
| Planner Challenger | `Ornith-1.5-35B-A3B` profiles after provenance + BE evaluation | next-generation planner/tool-orchestration trials; never auto-promoted |
| Builder | `moonshotai/Kimi-K2.7-Code`, `Qwen/Qwen3-Coder-30B-A3B-Instruct` | code, repo edits, MCP scaffolds, implementation tasks |
| Fast Worker | `deepseek-ai/DeepSeek-V4-Flash` | summaries, tagging, extraction, small tool tasks |
| Native Low-Bit Local Worker | `fermionresearch/Neutrino-8B`, Neutrino 0.6B draft model | private local summaries, extraction, classification, triage, bounded planning, offline fallback |
| Research | `zai-org/GLM-5.2`, `Qwen/Qwen3.6-35B-A3B`, `moonshotai/Kimi-K2.6` | technical research, docs, comparisons, synthesis |
| Local Frontier / BYOK Cloud | `nvidia/GLM-5.2-NVFP4`, GLM-5.2 compatible open-weight endpoints, Nemotron/NVFP4 class endpoints | hardware-qualified local inference, BYOK cloud equivalent, long-context repo reasoning, private planning |
| Experimental Volume / Free Tier | NaraRouter OpenAI-compatible route, dashboard-selected Mistral / DeepSeek / GLM class models | high-volume low-risk drafts, coding-agent experiments, prompt evals, non-sensitive summaries |
| Council Review | `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4` | high-stakes review before elevated actions |
| Lightweight / Fallback | `google/gemma-4-31B-it`, `google/gemma-4-26B-A4B-it`, `meta-llama/Llama-3.1-8B-Instruct`, `openai/gpt-oss-20b` | cheap fallback, local-ish tasks, constrained execution |
| Open OSS | `openai/gpt-oss-120b`, `openai/gpt-oss-20b` | open-weight compatible assistant/reasoning fallback |

## R0B0T Model Watch Rule

R0B0T Model Watch is a candidate-intelligence source, not an MCP authority and not a production approval system.

```text
R0B0T signal
  -> provenance / WATCH
  -> 54-T effective-capability review
  -> BE evaluation
  -> Quantization Torque analysis
  -> Model Exchange lane tournament
  -> approved bounded profile or rejection
```

The evidence object should bind model/checkpoint + quantization + runtime + hardware + context + KV-cache policy + task/eval metrics. A model name alone is not a routable production profile.

Long-context truth rule:

```text
configured context capacity != occupied context validated under load
```

External benchmark claims remain WATCH/EVALUATION until reproduced or explicitly accepted by policy. They must never silently replace an approved Planner profile.

## NaraRouter Experimental Volume Rule

NaraRouter is an optional OpenAI-compatible provider lane.

It is tracked for reported high free-token capacity, but the exact daily quota must be verified in the operator dashboard before production use.

```text
allowed:
  low-risk drafts
  non-sensitive summarization
  coding-agent experiments
  prompt-pack evals
  creator workflow tests
  fallback-chain stress tests

not allowed until approved:
  wallet-capable execution
  private client data
  credential handling
  production mutation
  regulated legal / tax / medical / financial execution
```

See `docs/NARAROUTER_PROVIDER_LANE.md` for the full lane policy.

## Neutrino Native Low-Bit Local Worker Rule

Neutrino is an optional local-first worker lane. It is tracked for compact private inference on user-owned hardware, not as an automatic replacement for the planner, builder, research, or council-review lanes.

```text
allowed during pilot:
  non-sensitive and locally approved summarization
  classification and tagging
  local document extraction
  draft responses
  prompt-cost estimation
  routing suggestions
  tool shortlist generation without execution
  bounded planning with no side effects
  offline fallback

conditional on task-specific validation:
  structured JSON
  repository analysis
  code generation
  long-context synthesis
  agent-memory compression

not allowed during pilot:
  direct MCP tool execution based only on model output
  wallet signing or transaction submission
  credential or recovery-phrase handling
  autonomous file deletion or production mutation
  regulated legal / tax / medical / financial decisions
  high-stakes security decisions without council review
```

Current `fermion serve` package documentation describes an OpenAI-compatible chat/completions endpoint, but it does not implement native function calling or embeddings. AGENTROPOLIS must therefore treat Neutrino output as untrusted text or schema-constrained draft data until an adapter validates the requested capability and a separate authority gate approves execution.

Operational requirements:

- bind the local server to loopback by default
- require authentication and network policy before any non-loopback binding
- pin the package, model artifact, runtime, and custom fork commit
- run `fermion info` or equivalent integrity verification before serving
- record hardware, backend, package version, artifact hash, sampling settings, and evaluation results in the receipt
- escalate to a larger BYOH or governed BYOK lane when quality, context, or confidence is insufficient

Canonical city policy: `AGENTROPOLIS-CITY-OF-AGENTS/agentropolis/docs/NEUTRINO_NATIVE_LOW_BIT_MODEL_LANE.md`.

## Local Frontier / BYOK Cloud Rule

The local frontier lane is optional. It is for users with the hardware to run large open-weight models locally, or users who bring their own key to a cloud GPU or OpenAI-compatible endpoint.

```text
allowed:
  hardware-qualified local inference
  BYOK cloud equivalent
  open-source/open-weight compatible model endpoints

not allowed:
  pretending massive models run on ordinary laptops
  storing provider keys in repo
  hard-locking the MCP kit to one vendor
```

Config belongs in environment variables or secret managers only.

See `docs/local-frontier-model-lane.md` for the full lane policy.

## MCP Policy Pattern

```text
MCP request
  -> classify task
  -> score risk
  -> select approved model/runtime profile
  -> check tool authority
  -> governed execution interface
       -> optional Claw/NemoClaw adapter when selected
  -> execute
  -> validate output
  -> log receipt
```

## Tool Authority Rule

Wallet, credential, file-system, deployment, and data-mutating tools require elevated checks.

```text
low-risk text task
  -> fast worker lane
  -> native low-bit local worker when locally approved
  -> experimental volume lane only when data is non-sensitive

code or repo task
  -> builder lane
  -> native low-bit local worker for draft-only assistance after evaluation
  -> experimental volume lane for drafts only

long-context private planning or repo reasoning
  -> local frontier lane when hardware-qualified
  -> BYOK cloud equivalent when configured
  -> normal research lane when unavailable

wallet / credential / production mutation
  -> planner lane
  -> policy gate
  -> council review when needed
  -> human approval when required
```

## Canon

HERMES is the router/orchestrator.
BE is the evaluator.
ASBE is the Agentic Studios backend, not the model evaluator.
54-T governs effective capability and execution boundaries.
Quantization Torque governs compute, precision, memory, and context pressure against evidence-backed quality floors.
NemoClaw/Claw-class infrastructure is an optional governed execution/security adapter, not a mandatory sovereign dependency.
Nemotron is the research council.
The MCP kit is the tool lane, not the mayor.
Neutrino is a compact local worker candidate, not unrestricted authority.
Local frontier models are optional brains, not required infrastructure.
NaraRouter is optional free-capacity routing, not required infrastructure.
R0B0T Model Watch is an evidence feeder, not a promotion authority.
