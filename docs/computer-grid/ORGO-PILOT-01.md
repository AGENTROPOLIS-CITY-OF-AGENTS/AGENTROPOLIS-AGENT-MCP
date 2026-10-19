# Computer Grid provider evaluation (ORGO-PILOT-01)

Status: PROPOSED / NOT DEPLOYED. Owner: Hermes. Assurance: VERITY + 54T. No production authority.

## Objective
Evaluate four independently licensed/self-hostable computer or agent-workspace projects for a bounded Hermes computer-provider interface. Do not assume equivalence or license compatibility.

## Candidates
- E2B (e2b-dev/E2B): disposable isolated execution; verify self-host instructions and licensing.
- Daytona (daytonaio/daytona): persistent developer workspace; verify current license, deployment support and APIs.
- Open WebUI Computer (open-webui/computer): operator desktop candidate; verify actual repository, features and licensing.
- Agent Zero (agent0ai/agent-zero): experimental specialist runtime; do not give orchestration authority.

## Adapter contract (proposal)
provision(template, resources, mandate_id) -> workspace_id
inspect(workspace_id) -> state, provenance
execute(workspace_id, command, authorization) -> bounded result
pause(workspace_id), resume(workspace_id), terminate(workspace_id)
collect_receipt(workspace_id) -> signed or hash-linked evidence

## Non-negotiable controls
Default deny egress; ephemeral least-privilege credentials; no wallet keys or production secrets; CPU/RAM/time/spend quotas; allowlisted tool permissions; audit log external to workspace; deterministic cleanup; human approval for privileged actions. Preserve branch protection and existing release holds. No auto-merges, deployment, cloud provisioning or third-party signup.

## Acceptance tests
1. Confirm each upstream URL, exact license at pinned commit, self-host requirements and maintenance health.
2. Compare isolation (VM/container), persistence, snapshot, browser/terminal, remote inspection, API, SSH and data export.
3. Run a disposable no-secrets sandbox and attempt denied egress, filesystem escape and unauthorized GitHub mutation.
4. Demonstrate pause/resume/terminate, quota enforcement, teardown and receipt verification.
5. Benchmark cold start, idle cost, task completion and recovery versus existing local Hermes.
6. Independent VERITY/54T review before promotion; no production integration until explicit authorization.

## Architecture
Hermes dispatch -> policy/authorization gate (planned) -> provider adapter -> sandbox -> external receipt store -> independent audit.

## Status ledger
- Candidate inventory: DRAFTED, NOT VERIFIED
- Adapters: SPECIFIED, NOT IMPLEMENTED
- Security tests: NOT RUN
- Deployment: NONE
