import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_PATH = new URL("../../config/pi-runtime-adapter.json", import.meta.url);

export async function loadPiRuntimeConfig() {
  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

export function resolvePiMode(config, mode = "ADVISORY") {
  const normalized = String(mode || "ADVISORY").toUpperCase();
  const selected = config.modes?.[normalized];
  if (!selected) throw new Error(`Unsupported Pi runtime mode: ${normalized}`);
  return { name: normalized, ...selected };
}

export function assertPiExecutionPreconditions({ config, mode, context }) {
  if (!context?.workerApproved) throw new Error("Pi runtime worker is not approved.");
  if (!context?.workspaceRoot) throw new Error("Pi runtime requires an explicit workspaceRoot.");
  if (!context?.workspaceIdentityVerified) throw new Error("Pi runtime workspace identity is not verified.");
  if (!context?.credentialHandleResolved) throw new Error("Pi runtime credential handle is not resolved.");
  if (!context?.effectiveCapabilitiesAttested) throw new Error("Pi runtime effective capabilities are not attested.");
  if (!context?.receiptDestinationConfigured) throw new Error("Pi runtime receipt destination is not configured.");
  if (context?.sdkExactVersionAttested !== true) throw new Error("Pi runtime exact SDK version is not attested.");
  if (context?.resourceDiscoveryIsolated !== true) throw new Error("Pi runtime resource discovery is not isolated and attested.");
  if (mode.sandboxRequired && !context?.sandboxVerified) throw new Error("Pi EXECUTE mode requires a verified sandbox.");
  if (mode.mutationsAllowed && mode.approvalRequired && !context?.mutationApproved) {
    throw new Error("Pi mutation mode requires explicit policy or operator approval.");
  }
  if (context?.rawSecretsPresent) throw new Error("Raw secrets must not be passed to Pi runtime sessions.");
  if (context?.egressPolicyLoaded === false) throw new Error("Pi runtime egress policy is not loaded.");
  return true;
}

export async function createGovernedPiSession(options) {
  const config = options.config || await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, options.mode);
  assertPiExecutionPreconditions({ config, mode, context: options.context });

  let pi;
  try {
    pi = await import("@earendil-works/pi-coding-agent");
  } catch (error) {
    throw new Error(`Pi SDK is unavailable on this worker: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  const runtime = options.modelRuntime || await pi.ModelRuntime.create();
  const model = options.model || runtime.getModel(options.provider, options.modelId);
  if (!model) throw new Error(`Pi model not found: ${options.provider}/${options.modelId}`);

  const cwd = path.resolve(options.context.workspaceRoot);
  const { session } = await pi.createAgentSession({
    cwd,
    model,
    modelRuntime: runtime,
    tools: mode.tools
  });

  return {
    config,
    mode,
    runtime,
    model,
    session,
    receiptEnvelope: {
      adapterId: config.adapterId,
      sdkPackage: config.sdk?.package || null,
      sdkVersion: config.sdk?.version || null,
      mode: mode.name,
      provider: options.provider,
      modelId: options.modelId,
      workspaceRoot: cwd,
      tools: [...mode.tools],
      sandboxVerified: Boolean(options.context.sandboxVerified),
      resourceDiscoveryIsolated: Boolean(options.context.resourceDiscoveryIsolated),
      authority: mode.mutationsAllowed ? "BOUNDED_MUTATION" : "READ_ONLY"
    }
  };
}

export async function runGovernedPiPrompt(options) {
  const governed = await createGovernedPiSession(options);
  const events = [];
  const unsubscribe = governed.session.subscribe?.((event) => {
    events.push({ type: event?.type || "unknown", at: new Date().toISOString() });
  });

  try {
    await governed.session.prompt(options.prompt);
    return { ...governed, events };
  } finally {
    if (typeof unsubscribe === "function") unsubscribe();
  }
}
