const DEFAULT_RUNTIME_ORDER = ["hermes", "codex", "pi", "opencode", "local"];

function normalized(value) {
  return String(value || "").trim().toLowerCase();
}

function bool(value) {
  return value === true;
}

export function buildRuntimeRegistry(overrides = {}) {
  const base = {
    hermes: {
      id: "hermes",
      role: "PRIMARY_ORCHESTRATED_RUNTIME",
      enabled: true,
      supports: ["analysis", "coding", "tools", "browser", "long_running"],
      mutationAuthority: "POLICY_GATED"
    },
    codex: {
      id: "codex",
      role: "CODING_RUNTIME",
      enabled: true,
      supports: ["analysis", "coding", "repo", "tests"],
      mutationAuthority: "POLICY_GATED"
    },
    pi: {
      id: "pi",
      role: "DEVELOPER_EXECUTION_ADAPTER",
      enabled: false,
      supports: ["analysis", "coding", "repo", "tests", "tools"],
      mutationAuthority: "POLICY_GATED",
      requires: ["approved_worker", "workspace_identity_verified", "credential_handle_resolved", "receipt_destination_configured"]
    },
    opencode: {
      id: "opencode",
      role: "CODING_RUNTIME",
      enabled: true,
      supports: ["analysis", "coding", "repo"],
      mutationAuthority: "POLICY_GATED"
    },
    local: {
      id: "local",
      role: "LOCAL_OR_BYOH_RUNTIME",
      enabled: true,
      supports: ["analysis", "coding", "private", "offline"],
      mutationAuthority: "POLICY_GATED"
    }
  };

  return Object.fromEntries(Object.entries(base).map(([id, entry]) => [id, { ...entry, ...(overrides[id] || {}) }]));
}

export function classifyRuntimeTask(task = {}) {
  const requested = normalized(task.runtimePreference);
  const text = `${task.kind || ""} ${task.description || ""}`.toLowerCase();
  const privateWork = bool(task.privateWork) || /private|offline|local-only|air.?gapped/.test(text);
  const coding = bool(task.coding) || /code|repo|test|lint|patch|typescript|javascript|python|bug|refactor/.test(text);
  const browser = bool(task.browser) || /browser|website|web automation/.test(text);
  const longRunning = bool(task.longRunning) || /long.?running|background|multi.?hour/.test(text);

  return { requested, privateWork, coding, browser, longRunning };
}

export function assertRuntimeRouteContext(runtime, context = {}) {
  if (!runtime.enabled) throw new Error(`Runtime ${runtime.id} is disabled.`);
  if (runtime.id === "pi") {
    if (!context.workerApproved) throw new Error("Pi route requires an approved worker.");
    if (!context.workspaceIdentityVerified) throw new Error("Pi route requires verified workspace identity.");
    if (!context.credentialHandleResolved) throw new Error("Pi route requires a resolved credential handle.");
    if (!context.receiptDestinationConfigured) throw new Error("Pi route requires a configured receipt destination.");
    if (context.rawSecretsPresent) throw new Error("Pi route rejects raw secrets.");
  }
  return true;
}

export function selectRuntime(task = {}, options = {}) {
  const registry = options.registry || buildRuntimeRegistry(options.overrides);
  const profile = classifyRuntimeTask(task);
  const health = options.health || {};
  const budget = options.budget || {};

  const healthy = (id) => health[id] !== false;
  const affordable = (id) => budget[id] !== false;
  const usable = (id) => registry[id]?.enabled && healthy(id) && affordable(id);

  const candidates = [];
  if (profile.requested) candidates.push(profile.requested);
  if (profile.privateWork) candidates.push("local", "pi");
  if (profile.browser || profile.longRunning) candidates.push("hermes");
  if (profile.coding) candidates.push("codex", "pi", "opencode", "hermes", "local");
  candidates.push(...DEFAULT_RUNTIME_ORDER);

  const unique = [...new Set(candidates)].filter((id) => registry[id]);
  const selectedId = unique.find(usable);
  if (!selectedId) throw new Error("No approved runtime is available for this task.");

  const selected = registry[selectedId];
  assertRuntimeRouteContext(selected, options.context || {});

  return {
    runtime: selectedId,
    role: selected.role,
    reason: profile.requested === selectedId
      ? "operator_preference"
      : profile.privateWork && selectedId === "local"
        ? "privacy_locality"
        : profile.browser && selectedId === "hermes"
          ? "browser_capability"
          : profile.coding && ["codex", "pi", "opencode"].includes(selectedId)
            ? "coding_fit"
            : "fallback_order",
    authority: selected.mutationAuthority,
    receiptRequired: true,
    profile
  };
}

export function buildRuntimeDispatchReceipt(route, task = {}, context = {}) {
  return {
    type: "runtime_dispatch",
    runtime: route.runtime,
    role: route.role,
    reason: route.reason,
    authority: route.authority,
    taskKind: task.kind || null,
    repo: task.repo || null,
    workspaceIdentityVerified: Boolean(context.workspaceIdentityVerified),
    workerApproved: Boolean(context.workerApproved),
    receiptDestinationConfigured: Boolean(context.receiptDestinationConfigured),
    rawSecretsPresent: Boolean(context.rawSecretsPresent),
    createdAt: new Date().toISOString()
  };
}
