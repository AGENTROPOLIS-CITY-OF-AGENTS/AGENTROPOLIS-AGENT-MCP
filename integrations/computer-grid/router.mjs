// AGENTROPOLIS Computer Grid: pure, default-deny planning adapter.
// No provider SDKs, network calls, or authority escalation.
export const PROVIDERS = Object.freeze(["e2b","daytona","open-webui-computer","agent-zero"]);
export const THERMAL_STATES = Object.freeze(["cool","warm","hot","critical"]);
export function routeComputerTask(request = {}) {
  const { provider, mandateId, approved = false, thermalState = "cool", deviceClass = "workstation", executionLane = "local" } = request;
  if (!PROVIDERS.includes(provider)) return { allowed:false, reason:"unknown_provider" };
  if (typeof mandateId !== "string" || !mandateId.trim()) return { allowed:false, reason:"missing_mandate" };
  if (!THERMAL_STATES.includes(thermalState)) return { allowed:false, reason:"invalid_thermal_state" };
  if (!["local","edge","workstation","cloud"].includes(executionLane)) return { allowed:false, reason:"invalid_execution_lane" };
  if (approved !== true) return { allowed:false, reason:"approval_required" };
  if (["hot","critical"].includes(thermalState) && executionLane === "local") return { allowed:false, reason:"thermal_local_compute_blocked" };
  if (deviceClass === "mobile" && executionLane === "local") return { allowed:false, reason:"mobile_heavy_compute_requires_offload" };
  // Approval here is only an input to planning; actual execution requires separate 54T authorization.
  return { allowed:true, reason:"eligible_for_54t_review", provider, mandateId, executionLane, thermalState, authority:"planning_only" };
}
