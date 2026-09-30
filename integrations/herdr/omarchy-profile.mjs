// AGENTROPOLIS Omarchy workstation profile
// Descriptive registration only. Host visibility never grants execution authority.

const SAFE_ID = /^[A-Za-z0-9:_-]{1,128}$/;
const TRUST = new Set(["quarantined","verified","degraded","revoked"]);
const CONNECTIVITY = new Set(["offline","live","stale"]);

function requireSafe(value, name) {
  if (typeof value !== "string" || !SAFE_ID.test(value)) throw new TypeError(`${name} must be an opaque safe identifier`);
  return value;
}

export function createOmarchyMachineProfile({
  machineProfileId,
  label = "Omarchy Workstation",
  architecture = "x86_64",
  trustState = "quarantined",
  connectivityState = "offline",
  capabilities = [
    "host.omarchy",
    "workspace.provision",
    "workspace.resume",
    "workspace.dispatch",
    "git.inspect",
    "terminal.bounded",
    "compute.advertise",
    "mcp.inspect",
    "runtime.hermes",
    "runtime.codex",
    "context_capsule.read",
    "context_capsule.write",
    "receipts.machine-scoped"
  ],
  credentialReference = null,
  lastVerifiedAt = null
} = {}) {
  requireSafe(machineProfileId, "machineProfileId");
  if (typeof label !== "string" || !label.trim() || label.length > 160) throw new TypeError("label must contain 1-160 characters");
  if (!TRUST.has(trustState)) throw new TypeError("unsupported trustState");
  if (!CONNECTIVITY.has(connectivityState)) throw new TypeError("unsupported connectivityState");
  if (!Array.isArray(capabilities) || capabilities.length === 0 || capabilities.length > 64) throw new TypeError("capabilities must contain 1-64 items");
  const normalized = [...new Set(capabilities.map((x) => {
    if (typeof x !== "string" || !/^[a-z0-9_.:-]{1,96}$/i.test(x)) throw new TypeError("invalid capability");
    return x;
  }))];

  return Object.freeze({
    schema_version: "1.1.0",
    machine_profile_id: machineProfileId,
    label: label.trim(),
    host_environment: "omarchy",
    platform: "linux",
    architecture,
    trust_state: trustState,
    connectivity_state: connectivityState,
    capabilities: Object.freeze(normalized),
    credential_reference: credentialReference,
    last_verified_at: lastVerifiedAt,
    authority_granted: false
  });
}

export function projectOmarchyForBuilderCommons(profile) {
  if (!profile || profile.host_environment !== "omarchy") throw new TypeError("Omarchy machine profile required");
  return Object.freeze({
    machine_profile_id: profile.machine_profile_id,
    label: profile.label,
    host_environment: profile.host_environment,
    platform: profile.platform,
    architecture: profile.architecture,
    trust_state: profile.trust_state,
    connectivity_state: profile.connectivity_state,
    capabilities: [...profile.capabilities],
    executable: false,
    authority_granted: false
  });
}

export function canAdvertiseOmarchyCompute(profile) {
  return Boolean(
    profile &&
    profile.host_environment === "omarchy" &&
    profile.trust_state === "verified" &&
    profile.connectivity_state === "live" &&
    profile.capabilities?.includes("compute.advertise")
  );
}
