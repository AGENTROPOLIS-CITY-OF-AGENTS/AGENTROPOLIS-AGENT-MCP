export const SPAWN_PLAN_TOOL = {
  name: 'spawn_plan',
  title: 'Plan Agentropolis Spatial Twin',
  description: 'Create a read-only CREATOR Construction plan for spawning an Agentropolis spatial twin of a project without mutating or deploying the source.',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['source', 'requested_role', 'authority', 'execution_mode'],
    properties: {
      source: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'kind', 'canonical_ref', 'owner_or_steward', 'rights_state'],
        properties: {
          id: { type: 'string', minLength: 1, maxLength: 200 },
          kind: { type: 'string', enum: ['repository', 'application', 'service', 'protocol', 'community', 'dataset', 'district_candidate', 'other'] },
          canonical_ref: { type: 'string', minLength: 1, maxLength: 2000 },
          owner_or_steward: { type: 'string', minLength: 1, maxLength: 300 },
          rights_state: { type: 'string', enum: ['verified', 'restricted', 'unknown', 'not_applicable'] },
          provenance_ref: { type: ['string', 'null'] },
        },
      },
      requested_role: { type: 'string', enum: ['district', 'building', 'floor', 'rail', 'skill', 'adapter', 'service', 'citizen', 'application'] },
      target_district: { type: ['string', 'null'], maxLength: 300 },
      authority: {
        type: 'object',
        additionalProperties: false,
        required: ['requestor', 'source_mutation_allowed', 'public_release_allowed'],
        properties: {
          requestor: { type: 'string', minLength: 1, maxLength: 300 },
          source_mutation_allowed: { type: 'boolean' },
          public_release_allowed: { type: 'boolean' },
          authority_receipt: { type: ['string', 'null'] },
        },
      },
      execution_mode: { const: 'PLAN' },
      spatial: {
        type: 'object',
        additionalProperties: false,
        properties: {
          orthographic_overview: { type: 'boolean', default: true },
          cinematic_path_requested: { type: 'boolean', default: false },
          webgl_baseline: { type: 'boolean', const: true },
          reduced_motion_fallback: { type: 'boolean', default: true },
          no_webgl_fallback: { type: 'boolean', default: true },
        },
      },
      provider_requirements: { type: 'array', items: { type: 'string' }, maxItems: 50 },
      risk_flags: { type: 'array', items: { type: 'string' }, maxItems: 50 },
    },
  },
};

const SOURCE_KINDS = new Set(['repository', 'application', 'service', 'protocol', 'community', 'dataset', 'district_candidate', 'other']);
const ROLES = new Set(['district', 'building', 'floor', 'rail', 'skill', 'adapter', 'service', 'citizen', 'application']);
const RIGHTS = new Set(['verified', 'restricted', 'unknown', 'not_applicable']);

export function validateSpawnPlanArgs(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'spawn request must be an object';
  const allowed = new Set(['source', 'requested_role', 'target_district', 'authority', 'execution_mode', 'spatial', 'provider_requirements', 'risk_flags']);
  for (const key of Object.keys(input)) if (!allowed.has(key)) return `unexpected argument: ${key}`;

  const source = input.source;
  if (!source || typeof source !== 'object' || Array.isArray(source)) return 'source must be an object';
  for (const key of ['id', 'canonical_ref', 'owner_or_steward']) {
    if (typeof source[key] !== 'string' || !source[key].trim()) return `source.${key} must be a non-empty string`;
  }
  if (!SOURCE_KINDS.has(source.kind)) return 'source.kind is invalid';
  if (!RIGHTS.has(source.rights_state)) return 'source.rights_state is invalid';
  if (!ROLES.has(input.requested_role)) return 'requested_role is invalid';
  if (input.execution_mode !== 'PLAN') return 'spawn_plan only accepts execution_mode PLAN';

  const authority = input.authority;
  if (!authority || typeof authority !== 'object' || Array.isArray(authority)) return 'authority must be an object';
  if (typeof authority.requestor !== 'string' || !authority.requestor.trim()) return 'authority.requestor must be a non-empty string';
  if (typeof authority.source_mutation_allowed !== 'boolean') return 'authority.source_mutation_allowed must be boolean';
  if (typeof authority.public_release_allowed !== 'boolean') return 'authority.public_release_allowed must be boolean';

  if (input.target_district !== undefined && input.target_district !== null && typeof input.target_district !== 'string') return 'target_district must be a string or null';
  if (input.provider_requirements !== undefined && (!Array.isArray(input.provider_requirements) || input.provider_requirements.some((item) => typeof item !== 'string'))) return 'provider_requirements must be an array of strings';
  if (input.risk_flags !== undefined && (!Array.isArray(input.risk_flags) || input.risk_flags.some((item) => typeof item !== 'string'))) return 'risk_flags must be an array of strings';

  const spatial = input.spatial || {};
  for (const key of ['orthographic_overview', 'cinematic_path_requested', 'webgl_baseline', 'reduced_motion_fallback', 'no_webgl_fallback']) {
    if (spatial[key] !== undefined && typeof spatial[key] !== 'boolean') return `spatial.${key} must be boolean`;
  }
  if (spatial.webgl_baseline === false) return 'spatial.webgl_baseline must be true';
  return null;
}

export function buildSpawnPlan(input, runtime = {}) {
  const problem = validateSpawnPlanArgs(input);
  if (problem) throw Object.assign(new Error(problem), { code: 'INVALID_SPAWN_REQUEST', status: 400 });

  const spatial = input.spatial || {};
  const rightsResolved = input.source.rights_state === 'verified' || input.source.rights_state === 'not_applicable';
  const releaseState = rightsResolved && input.authority.public_release_allowed ? 'RELEASE_ELIGIBLE_AFTER_BE' : 'APPROVAL_OR_RIGHTS_REQUIRED';
  const slug = String(input.source.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96) || 'project';

  return {
    schema: 'agentropolis.spawn-plan.v1',
    agentropolis_spawn_id: `spawn:${slug}`,
    state: 'SPAWN_PLANNED',
    authority: 'READ_ONLY_PLAN',
    source: {
      ...input.source,
      mutation_performed: false,
    },
    placement: {
      requested_role: input.requested_role,
      target_district: input.target_district || null,
      classification_owner: 'DOCKING DISTRICT',
    },
    construction: {
      owner: 'AGENTROPOLIS-CREATOR',
      function: 'Construction',
      protocol: 'RCP-0002 Agentropolis Spawn Profile',
      source_mutation_allowed: input.authority.source_mutation_allowed,
      deployment_performed: false,
    },
    spatial_twin: {
      scene_schema: 'agentropolis.spatial-scene.v1',
      camera: {
        overview: spatial.orthographic_overview === false ? 'documented-exemption-required' : 'orthographic',
        cinematic_path: Boolean(spatial.cinematic_path_requested),
      },
      browser_baseline: 'WebGL',
      dedicated_gpu_required: false,
      reduced_motion_fallback: spatial.reduced_motion_fallback !== false,
      no_webgl_fallback: spatial.no_webgl_fallback !== false,
      semantics: 'system-concepts-not-decoration-only',
    },
    runtime: {
      target: 'HERMES-CITY',
      current_service_version: runtime.serviceVersion || null,
      current_execution_mode: runtime.executionMode || null,
      provider_invocation_performed: false,
    },
    mcp: {
      tool: 'spawn_plan',
      execution_mode: 'PLAN',
      write_authority: 'NOT_GRANTED',
      public_release_requested: input.authority.public_release_allowed,
    },
    evaluation: {
      evaluator: 'BE',
      state: 'PENDING',
      required_checks: ['provenance', 'semantic-placement', 'camera-fallbacks', 'performance-budget', 'truthful-telemetry', 'authority-boundaries', 'accessibility', 'receipts'],
    },
    release: {
      state: releaseState,
      reasons: rightsResolved ? [] : ['rights_state_not_resolved'],
    },
    provider_requirements: [...new Set(input.provider_requirements || [])],
    risk_flags: [...new Set(input.risk_flags || [])],
    invariants: [
      'Construction is a CREATOR function, not a standalone district.',
      'Docking owns intake and compatibility classification.',
      'HERMES-CITY owns spatial presentation/runtime, not source authority.',
      'BE is the system evaluator; ASBE remains Entertainment-scoped.',
      'No dedicated GPU, CUDA, or workstation requirement may be introduced.',
      'Unknown telemetry remains unknown/not-instrumented.',
    ],
  };
}
