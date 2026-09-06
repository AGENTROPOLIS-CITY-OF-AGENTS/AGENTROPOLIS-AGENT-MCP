import { readFile } from 'node:fs/promises';

const registryUrl = new URL('../config/grok-public-mcp-registry.json', import.meta.url);
const registry = JSON.parse(await readFile(registryUrl, 'utf8'));

const allowedRuntimeStates = new Set(['LIVE', 'AVAILABLE', 'PLANNED', 'OFFLINE']);
const allowedEcosystems = new Set(['npm', 'pypi']);
const allowedRunners = new Set(['npx', 'uvx']);

const requiredMcpIds = [
  'agentropolis-grid',
  'parallax-spatial-mcp',
  'atlas-mcp',
  'asimov-robotics-mcp',
  'offgrid-mcp-registry'
];
const requiredDependencyIds = [
  'filesystem',
  'memory',
  'fetch',
  'git',
  'sequential-thinking',
  'supabase'
];

function assertExactIds(records, requiredIds, label) {
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record.id)) throw new Error(`${label} contains duplicate id: ${record.id}`);
    seen.add(record.id);
  }
  for (const id of requiredIds) {
    if (!seen.has(id)) throw new Error(`${label} missing required id: ${id}`);
  }
  for (const id of seen) {
    if (!requiredIds.includes(id)) throw new Error(`${label} contains unknown id: ${id}`);
  }
}

if (!Array.isArray(registry.first_party_public_mcps) || registry.first_party_public_mcps.length === 0) {
  throw new Error('first_party_public_mcps must contain at least one entry');
}

for (const entry of registry.first_party_public_mcps) {
  for (const key of ['id', 'owner', 'repository', 'url', 'kind', 'district', 'runtime_state', 'status', 'authority']) {
    if (typeof entry[key] !== 'string' || entry[key].trim() === '') {
      throw new Error(`MCP entry ${entry.id || '<unknown>'} missing required string field: ${key}`);
    }
  }

  if (!allowedRuntimeStates.has(entry.runtime_state)) {
    throw new Error(`MCP entry ${entry.id} has invalid runtime_state: ${entry.runtime_state}`);
  }

  if (entry.status !== 'public') {
    throw new Error(`MCP entry ${entry.id} must be public in the public registry`);
  }

  if (!Array.isArray(entry.capabilities) || entry.capabilities.length === 0) {
    throw new Error(`MCP entry ${entry.id} must declare capabilities`);
  }

  for (const capability of entry.capabilities) {
    if (typeof capability !== 'string' || capability.trim() === '') {
      throw new Error(`MCP entry ${entry.id} declares an empty capability`);
    }
  }
}

assertExactIds(registry.first_party_public_mcps, requiredMcpIds, 'first_party_public_mcps');

const declaredStates = registry.grok_surface_rules?.display_runtime_state;
if (!Array.isArray(declaredStates) || declaredStates.length !== allowedRuntimeStates.size) {
  throw new Error('grok_surface_rules.display_runtime_state must declare exactly LIVE, AVAILABLE, PLANNED, OFFLINE');
}
for (const state of allowedRuntimeStates) {
  if (!declaredStates.includes(state)) throw new Error(`display_runtime_state missing ${state}`);
}

if (registry.grok_surface_rules?.districtless_infrastructure_value !== 'INTELLIGENCE_GRID') {
  throw new Error('districtless infrastructure must be represented as INTELLIGENCE_GRID');
}

const requiredMutationStages = [
  'identity',
  'mandate',
  'policy',
  'tool_permission',
  'human_or_governed_approval',
  'execution',
  'receipt',
  'audit'
];
const mutationStages = registry.grok_surface_rules?.mutation_requires;
if (!Array.isArray(mutationStages)) throw new Error('mutation_requires must be an array');
for (const stage of requiredMutationStages) {
  if (!mutationStages.includes(stage)) throw new Error(`mutation_requires missing ${stage}`);
}

if (!Array.isArray(registry.offgrid_upstream_dependencies)) {
  throw new Error('offgrid_upstream_dependencies must be an array');
}

for (const dep of registry.offgrid_upstream_dependencies) {
  for (const key of ['id', 'ecosystem', 'name', 'specifier', 'runner', 'source']) {
    if (typeof dep[key] !== 'string' || dep[key].trim() === '') {
      throw new Error(`Dependency ${dep.id || '<unknown>'} missing required string field: ${key}`);
    }
  }
  if (!allowedEcosystems.has(dep.ecosystem)) throw new Error(`Dependency ${dep.id} has invalid ecosystem`);
  if (!allowedRunners.has(dep.runner)) throw new Error(`Dependency ${dep.id} has invalid runner`);
  if (dep.ecosystem === 'npm' && dep.runner !== 'npx') throw new Error(`npm dependency ${dep.id} must use npx`);
  if (dep.ecosystem === 'pypi' && dep.runner !== 'uvx') throw new Error(`PyPI dependency ${dep.id} must use uvx`);
}

assertExactIds(registry.offgrid_upstream_dependencies, requiredDependencyIds, 'offgrid_upstream_dependencies');

const fetchDep = registry.offgrid_upstream_dependencies.find((dep) => dep.id === 'fetch');
if (!fetchDep || fetchDep.ecosystem !== 'pypi' || fetchDep.name !== 'mcp-server-fetch' || fetchDep.runner !== 'uvx') {
  throw new Error('fetch dependency must resolve to PyPI mcp-server-fetch via uvx');
}

console.log(`Validated ${registry.first_party_public_mcps.length} public MCP entries and ${registry.offgrid_upstream_dependencies.length} upstream dependencies.`);
