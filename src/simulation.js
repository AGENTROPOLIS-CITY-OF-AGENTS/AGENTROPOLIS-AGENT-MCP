const EPISTEMIC_TYPES = Object.freeze({
  OBSERVED_FACT: "observed_fact",
  MODEL_ASSUMPTION: "model_assumption",
  SYNTHETIC_AGENT_STATE: "synthetic_agent_state",
  SIMULATION_OUTCOME: "simulation_outcome",
  FORECAST: "forecast",
  CALIBRATION_ERROR: "calibration_error"
});

const ROUTING_TIERS = ["full_model", "small_model", "distilled_surrogate", "statistical_engine", "cached_transition"];

export const SIMULATION_TOOLS = [
  {
    name: "run_simulation_scenario",
    title: "Run Simulation Scenario",
    description: "Run a bounded, reproducible synthetic-population scenario. Results are hypotheses, never observed facts or execution authority.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenarioId: { type: "string", minLength: 1, maxLength: 120 },
        purpose: { type: "string", minLength: 1, maxLength: 1000 },
        populationSize: { type: "integer", minimum: 10, maximum: 100000 },
        runs: { type: "integer", minimum: 10, maximum: 5000 },
        seed: { type: "integer", minimum: 1, maximum: 2147483646 },
        baselineProbability: { type: "number", minimum: 0, maximum: 1 },
        shock: { type: "number", minimum: -1, maximum: 1 },
        routingTier: { type: "string", enum: ROUTING_TIERS },
        assumptions: { type: "array", maxItems: 24, items: { type: "string", minLength: 1, maxLength: 500 } },
        evidenceRefs: { type: "array", maxItems: 24, items: { type: "string", minLength: 1, maxLength: 500 } }
      },
      required: ["scenarioId", "purpose", "populationSize", "runs", "seed", "baselineProbability"]
    }
  },
  {
    name: "get_simulation_runtime_profile",
    title: "Get Simulation Runtime Profile",
    description: "Return the Simulation Grid v0.1 limits, epistemic classes, routing tiers, and authority boundary.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  }
];

export function simulationRuntimeProfile() {
  return {
    name: "AGENTROPOLIS Simulation Grid",
    version: "0.1.0",
    status: "experimental-bounded-runtime",
    authority: "ADVISORY_ONLY",
    epistemicTypes: EPISTEMIC_TYPES,
    routingTiers: ROUTING_TIERS,
    limits: { populationSize: 100000, runs: 5000, concurrency: 1 },
    invariants: [
      "simulation_output_never_becomes_observed_fact_automatically",
      "simulation_never_grants_execution_authority",
      "high_impact_actions_require_independent_evidence_and_normal_approval",
      "seed_and_assumptions_must_be_preserved_for_reproducibility"
    ]
  };
}

export function validateSimulationArguments(args) {
  if (typeof args.scenarioId !== "string" || !args.scenarioId.trim() || args.scenarioId.length > 120) return "scenarioId must be a non-empty string up to 120 characters";
  if (typeof args.purpose !== "string" || !args.purpose.trim() || args.purpose.length > 1000) return "purpose must be a non-empty string up to 1,000 characters";
  if (!Number.isInteger(args.populationSize) || args.populationSize < 10 || args.populationSize > 100000) return "populationSize must be an integer from 10 to 100,000";
  if (!Number.isInteger(args.runs) || args.runs < 10 || args.runs > 5000) return "runs must be an integer from 10 to 5,000";
  if (!Number.isInteger(args.seed) || args.seed < 1 || args.seed > 2147483646) return "seed must be an integer from 1 to 2,147,483,646";
  if (typeof args.baselineProbability !== "number" || args.baselineProbability < 0 || args.baselineProbability > 1) return "baselineProbability must be a number from 0 to 1";
  if (args.shock !== undefined && (typeof args.shock !== "number" || args.shock < -1 || args.shock > 1)) return "shock must be a number from -1 to 1";
  if (args.routingTier !== undefined && !ROUTING_TIERS.includes(args.routingTier)) return "invalid routingTier";
  for (const key of ["assumptions", "evidenceRefs"]) {
    if (args[key] !== undefined && (!Array.isArray(args[key]) || args[key].length > 24 || args[key].some((v) => typeof v !== "string" || !v.trim() || v.length > 500))) return `${key} must contain up to 24 non-empty strings of at most 500 characters`;
  }
  return null;
}

export function runSimulationScenario(args) {
  const problem = validateSimulationArguments(args);
  if (problem) throw Object.assign(new Error(problem), { status: 400, code: "INVALID_SIMULATION_INPUT" });

  const effectiveProbability = clamp(args.baselineProbability + (args.shock || 0), 0, 1);
  const rng = mulberry32(args.seed >>> 0);
  const outcomes = [];
  for (let run = 0; run < args.runs; run++) {
    let successes = 0;
    for (let i = 0; i < args.populationSize; i++) if (rng() < effectiveProbability) successes++;
    outcomes.push(successes / args.populationSize);
  }
  outcomes.sort((a, b) => a - b);

  const mean = outcomes.reduce((sum, value) => sum + value, 0) / outcomes.length;
  const variance = outcomes.reduce((sum, value) => sum + (value - mean) ** 2, 0) / outcomes.length;
  const q05 = quantile(outcomes, 0.05);
  const q50 = quantile(outcomes, 0.5);
  const q95 = quantile(outcomes, 0.95);
  const tailLow = outcomes.filter((v) => v <= q05).length;
  const tailHigh = outcomes.filter((v) => v >= q95).length;

  return {
    scenarioId: args.scenarioId,
    scenarioVersion: "0.1.0",
    label: "HYPOTHESIS",
    epistemicType: EPISTEMIC_TYPES.SIMULATION_OUTCOME,
    authority: "ADVISORY_ONLY",
    purpose: args.purpose,
    reproducibility: { seed: args.seed, deterministic: true },
    routing: {
      selectedTier: args.routingTier || "statistical_engine",
      state: "LOCAL_BOUNDED",
      teacherModelInheritedConfidence: false
    },
    population: { syntheticAgents: args.populationSize },
    runs: args.runs,
    assumptions: [
      { type: EPISTEMIC_TYPES.MODEL_ASSUMPTION, key: "baselineProbability", value: args.baselineProbability },
      { type: EPISTEMIC_TYPES.MODEL_ASSUMPTION, key: "shock", value: args.shock || 0 },
      ...(args.assumptions || []).map((value) => ({ type: EPISTEMIC_TYPES.MODEL_ASSUMPTION, value }))
    ],
    evidenceRefs: args.evidenceRefs || [],
    distribution: {
      mean,
      median: q50,
      standardDeviation: Math.sqrt(variance),
      q05,
      q95,
      min: outcomes[0],
      max: outcomes[outcomes.length - 1]
    },
    tailEvents: { lowTailRuns: tailLow, highTailRuns: tailHigh },
    calibration: { status: "UNVERIFIED", calibrationError: null, epistemicType: EPISTEMIC_TYPES.CALIBRATION_ERROR },
    policy: {
      observedFactPromotion: "DENY",
      executionAuthority: "NONE",
      highImpactAction: "REQUIRES_INDEPENDENT_EVIDENCE_AND_APPROVAL"
    }
  };
}

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] === undefined ? sorted[base] : sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
