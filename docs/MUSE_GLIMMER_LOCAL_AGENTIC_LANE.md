# Muse Glimmer Local Agentic Lane

Status: sandbox candidate

Muse Glimmer is integrated as a replaceable local/edge model candidate behind the AGENTROPOLIS provider and model-routing layer. It is not granted autonomous authority by default.

## Placement

```text
request
  -> HERMES task classification
  -> risk score
  -> hardware capability check
  -> Muse Glimmer candidate lane when qualified
  -> sandboxed inference
  -> output validation
  -> policy / authority gate
  -> optional tool execution
  -> receipt
```

## Intended uses during sandbox phase

Allowed:

- tool-call planning without side effects
- coding drafts inside an isolated workspace
- multimodal analysis of approved inputs
- long-horizon task decomposition
- recovery suggestions after failed tool calls
- model-as-judge / council review in advisory mode
- local private inference on hardware that meets the selected runtime profile

Conditional after task-specific validation:

- structured tool-call generation
- repository mutation in disposable branches
- bounded browser actions in isolated sessions
- local agent loops with explicit step and token budgets

Not allowed during sandbox phase:

- direct wallet signing or transaction submission
- raw secret, seed phrase, recovery phrase, or credential exposure
- autonomous production deployment
- destructive filesystem actions outside disposable workspaces
- regulated legal, tax, medical, or financial decisions without separate high-stakes review
- unrestricted shell, browser, network, package-manager, or MCP authority
- memory writes that bypass provenance and review

## Security doctrine

Model capability does not imply transaction authority.

All Muse Glimmer executions must inherit AGENTROPOLIS containment rules:

- capability handles instead of raw secrets
- default-deny network egress unless explicitly allowed
- sandbox integrity verification before execution
- transitive capability checks for MCP servers and tools
- prompt-injection-resistant handling of tool returns and retrieved content
- immutable action and evaluation receipts
- human approval for irreversible or materially consequential actions

## Hardware and runtime rule

The router must select Glimmer only when the operator device profile is qualified for the chosen checkpoint/runtime. Hardware claims from vendors or community reports are treated as evidence, not as guaranteed production performance.

Every benchmark receipt must record at minimum:

- exact model/checkpoint identifier
- quantization or compression profile
- runtime/backend and version
- GPU and VRAM
- host RAM
- OS / architecture
- context length
- sampling settings
- tool schema version
- task class
- latency and throughput
- correctness score
- tool-call validity score
- recovery score
- prompt-injection / boundary-escape result
- execution authority state

## Promotion ladder

```text
ADOPT
  -> SANDBOX
  -> BENCHMARK
  -> LIMITED PILOT
  -> PRODUCTION-ELIGIBLE
```

Promotion is denied if the candidate fails containment, transitive-capability, prompt-injection, or unauthorized-action tests, even when task accuracy is high.

## Canon

Muse Glimmer is a local agentic foundation-model candidate.
HERMES remains the router.
The Intelligence Grid remains the substrate.
Policy and authority layers decide what may execute.
The model never self-grants permissions.
