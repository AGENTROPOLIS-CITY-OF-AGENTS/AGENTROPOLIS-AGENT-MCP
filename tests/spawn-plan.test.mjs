import test from 'node:test';
import assert from 'node:assert/strict';

import { SPAWN_PLAN_TOOL, buildSpawnPlan, validateSpawnPlanArgs } from '../src/spawn-plan.js';

const selfRequest = {
  source: {
    id: 'agentropolis-agent-mcp',
    kind: 'service',
    canonical_ref: 'https://agentropolis-agent-mcp.chaoswired.workers.dev/',
    owner_or_steward: 'AGENTROPOLIS-CITY-OF-AGENTS',
    rights_state: 'verified',
    provenance_ref: 'https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AGENT-MCP',
  },
  requested_role: 'service',
  target_district: 'Infrastructure / Agent Runtime',
  authority: {
    requestor: 'system test',
    source_mutation_allowed: false,
    public_release_allowed: false,
    authority_receipt: null,
  },
  execution_mode: 'PLAN',
  spatial: {
    orthographic_overview: true,
    cinematic_path_requested: true,
    webgl_baseline: true,
    reduced_motion_fallback: true,
    no_webgl_fallback: true,
  },
  provider_requirements: [],
  risk_flags: [],
};

test('spawn_plan is explicitly read-only', () => {
  assert.equal(SPAWN_PLAN_TOOL.annotations.readOnlyHint, true);
  assert.equal(SPAWN_PLAN_TOOL.annotations.destructiveHint, false);
});

test('Agent MCP can plan its own Agentropolis spatial twin without mutation', () => {
  assert.equal(validateSpawnPlanArgs(selfRequest), null);
  const plan = buildSpawnPlan(selfRequest, {
    serviceVersion: '1.2.0-jspace-projection-beta',
    executionMode: 'DRY_RUN',
  });

  assert.equal(plan.state, 'SPAWN_PLANNED');
  assert.equal(plan.authority, 'READ_ONLY_PLAN');
  assert.equal(plan.construction.owner, 'AGENTROPOLIS-CREATOR');
  assert.equal(plan.construction.function, 'Construction');
  assert.equal(plan.placement.classification_owner, 'DOCKING DISTRICT');
  assert.equal(plan.spatial_twin.camera.overview, 'orthographic');
  assert.equal(plan.spatial_twin.browser_baseline, 'WebGL');
  assert.equal(plan.spatial_twin.dedicated_gpu_required, false);
  assert.equal(plan.runtime.target, 'HERMES-CITY');
  assert.equal(plan.runtime.provider_invocation_performed, false);
  assert.equal(plan.mcp.write_authority, 'NOT_GRANTED');
  assert.equal(plan.evaluation.evaluator, 'BE');
  assert.equal(plan.source.mutation_performed, false);
  assert.equal(plan.release.state, 'APPROVAL_OR_RIGHTS_REQUIRED');
});

test('spawn_plan refuses execution escalation', () => {
  const invalid = structuredClone(selfRequest);
  invalid.execution_mode = 'LIVE';
  assert.equal(validateSpawnPlanArgs(invalid), 'spawn_plan only accepts execution_mode PLAN');
});

test('spawn_plan requires WebGL baseline when spatial settings are supplied', () => {
  const invalid = structuredClone(selfRequest);
  invalid.spatial.webgl_baseline = false;
  assert.equal(validateSpawnPlanArgs(invalid), 'spatial.webgl_baseline must be true');
});
