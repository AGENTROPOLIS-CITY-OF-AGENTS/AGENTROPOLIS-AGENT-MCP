import {
  JSPACE_TOOLS,
  assembleCognitiveCouncil,
  jspaceManifest,
  mindVaultContract,
  wikivaultJspaceBridge
} from "./jspace.js";
import { SIMULATION_TOOLS, simulationRuntimeProfile, validateSimulationArguments } from "./simulation.js";

export { assembleCognitiveCouncil, jspaceManifest, mindVaultContract, wikivaultJspaceBridge } from "./jspace.js";
export { runSimulationScenario, simulationRuntimeProfile } from "./simulation.js";

export const PROTOCOL_VERSION = "2025-06-18";

export const DISTRICTS = [
  { name: "NEURO", domain: "systems architecture and orchestration", role: "City systems architect", authority: "READ_ONLY", terms: ["architecture", "orchestration", "roadmap", "system map", "project manager", "pm", "j-space", "jspace", "cognitive commons"] },
  { name: "CHAOS CODE", domain: "developer ecosystem and runtime engineering", role: "Build and integration institution", authority: "READ_ONLY", terms: ["repo", "github", "mcp", "agent", "runtime", "build", "api", "code", "cloudflare", "deploy"] },
  { name: "CHAOS RANK", domain: "SEO, distribution, and content intelligence", role: "Visibility and distribution institution", authority: "READ_ONLY", terms: ["seo", "rank", "distribution", "content", "publish", "growth", "aeo"] },
  { name: "789 STUDIOS", domain: "media, production, and storytelling", role: "Production institution", authority: "READ_ONLY", terms: ["media", "ott", "studio", "story", "production", "show", "broadcast"] },
  { name: "NEURA", domain: "finance, tax, trust, and wallet safety", role: "Financial safety institution", authority: "READ_ONLY", terms: ["wallet", "tax", "finance", "client portal", "invoice", "legal", "payment"] },
  { name: "NTRU", domain: "cryptography, privacy, and verification", role: "Trust institution", authority: "READ_ONLY", terms: ["privacy", "verify", "cryptography", "proof", "signature", "trust"] },
  { name: "CHAOSPHERE", domain: "games, worlds, and simulations", role: "Simulation institution", authority: "READ_ONLY", terms: ["game", "world", "simulation", "scenario", "forecast", "stress test", "arena", "boardforge", "play"] },
  { name: "ECHO", domain: "lore, canon, and archival memory", role: "Canon institution", authority: "READ_ONLY", terms: ["lore", "canon", "archive", "timeline", "story bible", "memory", "wikivault", "obsidian", "gbrain", "llm-wiki", "mind vault"] },
  { name: "FEN", domain: "XRPL and VAULT33 execution planning", role: "Chain-specific institution", authority: "READ_ONLY", terms: ["vault33", "vrg33589", "xrpl", "xrp", "fen", "589"] }
];

const SAFETY_TERMS = ["seed phrase", "private key", "verify now", "urgent", "support dm", "airdrop claim", "connect wallet now", "sign this transaction", "send funds", "recovery phrase"];

export function routeFrontDesk(text) {
  const input = String(text || "").trim();
  const lowered = input.toLowerCase();
  const safetyTerm = SAFETY_TERMS.find((term) => lowered.includes(term)) || null;
  let best = { district: null, score: 0 };
  for (const district of DISTRICTS) {
    const score = district.terms.reduce((sum, term) => sum + (lowered.includes(term) ? 1 : 0), 0);
    if (score > best.score) best = { district, score };
  }
  const district = best.district || { name: "FRONT DESK", domain: "orientation", role: "Concierge", authority: "READ_ONLY" };
  return {
    district: district.name,
    domain: district.domain,
    authority: "READ_ONLY",
    confidence: best.score ? Math.min(0.98, 0.55 + best.score * 0.12) : 0.35,
    reason: best.score ? `Matched request signals to the ${district.name} lane.` : "No strong district signal was found, so the request remains at the Front Desk.",
    safetyFlag: Boolean(safetyTerm),
    safetyNote: safetyTerm ? `Safety slowdown triggered by '${safetyTerm}'. Never provide seed phrases or private keys. Distinguish a message signature from a transaction signature before continuing.` : null,
    nextStep: best.score ? `Review the request inside ${district.name} without granting execution authority.` : "Clarify whether the goal is to build, protect, publish, file, watch, play, or explore."
  };
}

export function assessRisk(input) {
  let score = 0;
  const controls = ["schema_validation", "receipt_required"];
  const sensitivity = input.dataSensitivity || "public";
  const impact = input.externalImpact || "none";
  score += ({ public: 0, internal: 10, confidential: 25, secret: 45 })[sensitivity] ?? 0;
  score += ({ none: 0, reversible: 15, irreversible: 35 })[impact] ?? 0;
  if (input.walletAction) { score += 35; controls.push("transaction_simulation", "human_approval"); }
  if (input.paymentAction) { score += 40; controls.push("spend_cap", "human_approval"); }
  if (input.publishAction) { score += 25; controls.push("human_approval", "rollback_plan"); }
  if (input.destructiveAction) { score += 50; controls.push("human_approval", "backup", "rollback_plan"); }
  score = Math.min(100, score);
  const blocked = Boolean(input.walletAction || input.paymentAction || input.publishAction || input.destructiveAction || impact === "irreversible" || sensitivity === "secret");
  return {
    score,
    level: score >= 75 ? "critical" : score >= 45 ? "high" : score >= 20 ? "moderate" : "low",
    decision: blocked ? "BLOCKED" : "ALLOW_READ_ONLY",
    authority: blocked ? "NO_AUTHORITY" : "READ_ONLY",
    approvalRequired: blocked,
    controls: [...new Set(controls)],
    rationale: blocked ? "The public capability membrane has no authority for external writes, secrets, wallets, payments, publishing, or destructive actions." : "The request remains inside the read-only authority ceiling."
  };
}

const CORE_TOOLS = [
  {
    name: "route_front_desk",
    title: "Route Agentropolis Front Desk",
    description: "Route a request to the most likely Agentropolis district and trigger safety slowdowns when needed.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: { request: { type: "string", minLength: 1, maxLength: 8000 } }, required: ["request"] }
  },
  {
    name: "list_agentropolis_districts",
    title: "List Agentropolis Districts",
    description: "List the institutions in the Agentropolis Intelligence Grid and their bounded authority.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: { query: { type: "string", maxLength: 200 } } }
  },
  {
    name: "assess_mcp_request_risk",
    title: "Assess MCP Request Risk",
    description: "Score a proposed action and identify its authority ceiling and required controls.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {
      action: { type: "string", minLength: 1, maxLength: 2000 },
      dataSensitivity: { type: "string", enum: ["public", "internal", "confidential", "secret"], default: "public" },
      externalImpact: { type: "string", enum: ["none", "reversible", "irreversible"], default: "none" },
      walletAction: { type: "boolean", default: false }, paymentAction: { type: "boolean", default: false }, publishAction: { type: "boolean", default: false }, destructiveAction: { type: "boolean", default: false }
    }, required: ["action"] }
  },
  {
    name: "get_agentropolis_capability_map",
    title: "Get Agentropolis Capability Map",
    description: "Return the canonical infrastructure, institutions, applications, governed flow, and authority boundary.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  },
  {
    name: "get_cloudflare_deployment_manifest",
    title: "Get Cloudflare Deployment Manifest",
    description: "Return the active Cloudflare runtime, endpoints, bindings, and security posture.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  }
];

export const TOOLS = [...CORE_TOOLS, ...SIMULATION_TOOLS, ...JSPACE_TOOLS];

export function capabilityMap() {
  return {
    identity: "Agentropolis Intelligence Grid",
    layers: {
      infrastructure: ["Agent Runtime", "Memory Layer", "WikiVault", "Obsidian Node Vault", "llm-wiki Retrieval", "gbrain Ontology", "J-SPACE INFINITY Cognitive Commons", "Mind Vault", "Simulation Grid", "Skill Registry", "Dispatch Protocol", "MCP Capability Membrane", "Receipt Ledger"],
      districts: DISTRICTS.map(({ name, domain, role, authority }) => ({ name, domain, role, authority })),
      applications: ["Command Atrium", "District dashboards", "Creator surfaces", "Wallet safety tools", "Media surfaces", "Games and simulations"]
    },
    governedFlow: ["Identity", "Mandate", "Evidence", "Deliberate", "Plan", "Simulation", "Policy Gate", "Execute", "Receipt", "Audit", "Outcome Feedback", "Calibration"],
    simulation: simulationRuntimeProfile(),
    authorityBoundary: { public: "READ_ONLY", simulation: "ADVISORY_ONLY", wallet: "NO_AUTHORITY", payment: "NO_AUTHORITY", publish: "NO_AUTHORITY", destructive: "NO_AUTHORITY", selfEscalation: false }
  };
}

export function deploymentManifest(env) {
  return {
    name: "agentropolis-agent-mcp",
    version: env.SERVICE_VERSION || "1.0.0",
    environment: env.ENVIRONMENT || "production",
    protocolVersion: PROTOCOL_VERSION,
    transport: "Streamable HTTP",
    endpoint: "/mcp",
    resources: ["Cloudflare Workers", "Workers Static Assets", "D1", "Workers Observability"],
    authentication: env.MCP_AUTH_MODE || "public-read",
    publicAuthority: "READ_ONLY",
    tools: TOOLS.map(({ name, title, description, annotations }) => ({ name, title, description, annotations })),
    endpoints: { health: "/health", manifest: "/.well-known/mcp.json", tools: "/api/tools", districts: "/api/districts", simulationProfile: "/api/simulation/profile", simulationRun: "/api/simulation/run", receipts: "/api/receipts" },
    security: ["origin_allowlist", "host_consistency", "body_limit", "rate_limit", "input_validation", "hashed_receipts", "simulation_epistemic_labeling", "simulation_advisory_only", "operator_only_receipt_api", "wikivault_provenance", "no_hidden_cot_exposure"]
  };
}

export function validateArguments(tool, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  const allowed = new Set(Object.keys(tool.inputSchema.properties || {}));
  for (const key of Object.keys(args)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  for (const key of tool.inputSchema.required || []) if (!(key in args)) return `missing required argument: ${key}`;
  if (tool.name === "route_front_desk" && (typeof args.request !== "string" || !args.request.trim() || args.request.length > 8000)) return "request must be a non-empty string up to 8,000 characters";
  if (tool.name === "list_agentropolis_districts" && args.query !== undefined && (typeof args.query !== "string" || args.query.length > 200)) return "query must be a string up to 200 characters";
  if (tool.name === "assess_mcp_request_risk") {
    if (typeof args.action !== "string" || !args.action.trim() || args.action.length > 2000) return "action must be a non-empty string up to 2,000 characters";
    if (args.dataSensitivity !== undefined && !["public", "internal", "confidential", "secret"].includes(args.dataSensitivity)) return "invalid dataSensitivity";
    if (args.externalImpact !== undefined && !["none", "reversible", "irreversible"].includes(args.externalImpact)) return "invalid externalImpact";
    for (const key of ["walletAction", "paymentAction", "publishAction", "destructiveAction"]) if (args[key] !== undefined && typeof args[key] !== "boolean") return `${key} must be boolean`;
  }
  if (tool.name === "run_simulation_scenario") return validateSimulationArguments(args);
  if (tool.name === "assemble_cognitive_council") {
    if (typeof args.problem !== "string" || !args.problem.trim() || args.problem.length > 8000) return "problem must be a non-empty string up to 8,000 characters";
    if (args.councilSize !== undefined && (!Number.isInteger(args.councilSize) || args.councilSize < 3 || args.councilSize > 12)) return "councilSize must be an integer from 3 to 12";
    if (args.requireHeretic !== undefined && typeof args.requireHeretic !== "boolean") return "requireHeretic must be boolean";
    if (args.domains !== undefined && (!Array.isArray(args.domains) || args.domains.length > 12 || args.domains.some((d) => typeof d !== "string" || d.length > 120))) return "domains must be an array of up to 12 strings, each no more than 120 characters";
  }
  return null;
}
