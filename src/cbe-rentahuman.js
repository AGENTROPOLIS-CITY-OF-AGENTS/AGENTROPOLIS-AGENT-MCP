const DEFAULT_BASE_URL = "https://rentahuman.ai/api";
const MAX_RESULTS = 25;

export const CBE_PROVIDER_ID = "rentahuman";

export function rentAHumanProviderManifest(env = {}) {
  return {
    provider: CBE_PROVIDER_ID,
    role: "external-human-execution-provider",
    authority: "READ_ONLY_BETA",
    enabled: env.CBE_RENTAHUMAN_ENABLED === "true",
    authenticated: Boolean(env.RENTAHUMAN_API_KEY),
    baseUrl: env.RENTAHUMAN_API_URL || DEFAULT_BASE_URL,
    capabilities: ["worker.search", "worker.inspect"],
    blockedCapabilities: [
      "conversation.start",
      "message.send",
      "bounty.create",
      "application.accept",
      "service.book",
      "escrow.create",
      "payment.release",
      "dispute.open"
    ]
  };
}

export function validateWorkerSearch(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "search input must be an object";
  const allowed = new Set(["skill", "name", "minRate", "maxRate", "city", "country", "limit", "offset"]);
  for (const key of Object.keys(input)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  for (const key of ["skill", "name", "city", "country"]) {
    if (input[key] !== undefined && (typeof input[key] !== "string" || input[key].length > 200)) return `${key} must be a string up to 200 characters`;
  }
  for (const key of ["minRate", "maxRate", "offset"]) {
    if (input[key] !== undefined && (!Number.isFinite(input[key]) || input[key] < 0)) return `${key} must be a non-negative number`;
  }
  if (input.limit !== undefined && (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > MAX_RESULTS)) return `limit must be an integer from 1 to ${MAX_RESULTS}`;
  if (input.minRate !== undefined && input.maxRate !== undefined && input.minRate > input.maxRate) return "minRate cannot exceed maxRate";
  return null;
}

export async function searchExternalWorkers(input, env = {}, fetchImpl = fetch) {
  const validationError = validateWorkerSearch(input);
  if (validationError) throw Object.assign(new Error(validationError), { code: "CBE_INVALID_SEARCH", status: 400 });
  if (env.CBE_RENTAHUMAN_ENABLED !== "true") throw Object.assign(new Error("RentAHuman provider is disabled."), { code: "CBE_PROVIDER_DISABLED", status: 503 });

  const baseUrl = env.RENTAHUMAN_API_URL || DEFAULT_BASE_URL;
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/humans`);
  const query = { ...input, limit: input.limit || 10 };
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }

  const headers = { Accept: "application/json", "User-Agent": "AGENTROPOLIS-CBE/0.1-beta" };
  if (env.RENTAHUMAN_API_KEY) headers["X-API-Key"] = env.RENTAHUMAN_API_KEY;

  const response = await fetchImpl(url, { method: "GET", headers, redirect: "error" });
  if (!response.ok) {
    throw Object.assign(new Error(`RentAHuman search failed with status ${response.status}.`), {
      code: response.status === 429 ? "CBE_PROVIDER_RATE_LIMITED" : "CBE_PROVIDER_ERROR",
      status: response.status === 429 ? 429 : 502
    });
  }

  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : payload.humans || payload.results || payload.data || [];
  if (!Array.isArray(rows)) throw Object.assign(new Error("RentAHuman returned an unexpected response shape."), { code: "CBE_PROVIDER_SCHEMA_MISMATCH", status: 502 });

  return {
    provider: CBE_PROVIDER_ID,
    sourceAuthority: "EXTERNAL_UNVERIFIED_PROFILE_DATA",
    count: Math.min(rows.length, MAX_RESULTS),
    workers: rows.slice(0, MAX_RESULTS).map(normalizeWorker)
  };
}

function normalizeWorker(row = {}) {
  const id = row.id || row.humanId || row.uid || null;
  const skills = Array.isArray(row.skills) ? row.skills.filter((v) => typeof v === "string").slice(0, 25) : [];
  const location = row.location && typeof row.location === "object" ? row.location : {};
  return {
    cbeWorkerRef: id ? `${CBE_PROVIDER_ID}:${String(id)}` : null,
    provider: CBE_PROVIDER_ID,
    providerWorkerId: id ? String(id) : null,
    displayName: safeString(row.name || row.displayName),
    headline: safeString(row.headline || row.title || row.bio, 500),
    skills,
    city: safeString(row.city || location.city),
    country: safeString(row.country || location.country),
    hourlyRateUsd: finiteOrNull(row.hourlyRate ?? row.rate ?? row.hourly_rate),
    rating: finiteOrNull(row.rating ?? row.averageRating),
    completedTasks: integerOrNull(row.completedTasks ?? row.tasksCompleted),
    verified: Boolean(row.verified || row.identityVerified),
    provenance: {
      provider: CBE_PROVIDER_ID,
      trust: "external",
      verification: "provider-asserted",
      importedAt: new Date().toISOString()
    }
  };
}

function safeString(value, max = 200) {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, max) || null;
}

function finiteOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function integerOrNull(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}
