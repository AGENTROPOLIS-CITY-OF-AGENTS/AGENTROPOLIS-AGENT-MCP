import { DISTRICTS, PROTOCOL_VERSION, TOOLS, assessRisk, capabilityMap, deploymentManifest, routeFrontDesk, runSimulationScenario, simulationRuntimeProfile, validateArguments } from "./core.js";

const MCP_PATHS = new Set(["/mcp", "/mcp/"]);
let schemaReady;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = request.headers.get("cf-ray") || crypto.randomUUID();
    try {
      if (request.method === "OPTIONS") return respond(new Response(null, { status: 204 }), request, env, requestId);
      if (url.pathname === "/health") return respond(await health(env, requestId), request, env, requestId);
      if (url.pathname === "/.well-known/mcp.json" || url.pathname === "/api/manifest") return respond(json(deploymentManifest(env)), request, env, requestId);
      if (url.pathname === "/api/tools" && request.method === "GET") return respond(json({ tools: TOOLS }), request, env, requestId);
      if (url.pathname === "/api/districts" && request.method === "GET") return respond(json({ count: DISTRICTS.length, districts: DISTRICTS.map(({ terms, ...d }) => d) }), request, env, requestId);
      if (url.pathname === "/api/route" && request.method === "POST") return respond(await routeApi(request, env, requestId), request, env, requestId);
      if (url.pathname === "/api/risk" && request.method === "POST") return respond(await riskApi(request, env, requestId), request, env, requestId);
      if (url.pathname === "/api/simulation/profile" && request.method === "GET") return respond(json(simulationRuntimeProfile()), request, env, requestId);
      if (url.pathname === "/api/simulation/run" && request.method === "POST") return respond(await simulationApi(request, env, requestId), request, env, requestId);
      if (url.pathname === "/api/receipts" && request.method === "GET") return respond(await listReceipts(request, env), request, env, requestId);
      if (url.pathname.startsWith("/api/receipts/") && request.method === "GET") return respond(await getReceipt(request, env, url.pathname), request, env, requestId);
      if (MCP_PATHS.has(url.pathname)) return respond(await mcp(request, env, requestId), request, env, requestId);
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/.well-known/")) return respond(errorJson(404, "NOT_FOUND", "API route not found."), request, env, requestId);
      return respond(await env.ASSETS.fetch(request), request, env, requestId);
    } catch (error) {
      ctx.waitUntil(securityEvent(env, requestId, "UNHANDLED_EXCEPTION", "critical", { path: url.pathname, message: error instanceof Error ? error.message.slice(0, 300) : "unknown" }));
      const status = error?.status || 500;
      return respond(errorJson(status, error?.code || "INTERNAL_ERROR", status === 500 ? "The capability membrane could not complete the request." : error.message), request, env, requestId);
    }
  }
};

async function mcp(request, env, requestId) {
  if (!["POST", "GET", "DELETE"].includes(request.method)) return errorJson(405, "METHOD_NOT_ALLOWED", "The MCP endpoint accepts POST, GET, and DELETE.");
  const guard = requestGuard(request, env); if (guard) return guard;
  const auth = authorizeMcp(request, env); if (auth) return auth;
  const rate = await rateLimit(request, env); if (!rate.allowed) return errorJson(429, "RATE_LIMITED", "Request limit exceeded.");
  if (request.method !== "POST") return errorJson(405, "STATELESS_TRANSPORT", "This deployment uses stateless POST requests only.");
  const message = await readJson(request, env);
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") return rpcError(message?.id ?? null, -32600, "Invalid Request");
  if (message.id === undefined) return new Response(null, { status: 202 });
  if (message.method === "initialize") return rpcResult(message.id, { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: { listChanged: false } }, serverInfo: { name: "Agentropolis MCP Capability Membrane", version: env.SERVICE_VERSION || "1.0.0" }, instructions: "Use these tools to route, inspect, map, assess, and run bounded advisory simulations. Simulation output is synthetic and never grants execution authority." });
  if (message.method === "ping") return rpcResult(message.id, {});
  if (message.method === "tools/list") return rpcResult(message.id, { tools: TOOLS });
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const tool = TOOLS.find((item) => item.name === name);
    if (!tool) return rpcError(message.id, -32602, "Unknown tool");
    const problem = validateArguments(tool, args);
    if (problem) return rpcError(message.id, -32602, problem);
    const identity = await actorIdentity(request, env);
    const result = await executeTool(name, args, env, requestId, identity);
    return rpcResult(message.id, { content: [{ type: "text", text: JSON.stringify(result.output, null, 2) }], structuredContent: result.output, isError: false, _meta: { receiptId: result.receipt.id, receiptPersisted: result.receipt.persisted } });
  }
  return rpcError(message.id, -32601, "Method not found");
}

async function executeTool(name, args, env, requestId, identity) {
  const started = Date.now();
  let output;
  if (name === "route_front_desk") output = { route: routeFrontDesk(args.request) };
  else if (name === "list_agentropolis_districts") {
    const q = String(args.query || "").toLowerCase();
    const districts = q ? DISTRICTS.filter((d) => `${d.name} ${d.domain} ${d.role} ${d.terms.join(" ")}`.toLowerCase().includes(q)) : DISTRICTS;
    output = { count: districts.length, districts: districts.map(({ terms, ...d }) => d) };
  } else if (name === "assess_mcp_request_risk") output = { assessment: assessRisk(args) };
  else if (name === "get_agentropolis_capability_map") output = { capabilityMap: capabilityMap() };
  else if (name === "get_cloudflare_deployment_manifest") output = { deployment: deploymentManifest(env) };
  else if (name === "get_simulation_runtime_profile") output = { simulation: simulationRuntimeProfile() };
  else if (name === "run_simulation_scenario") output = { simulation: runSimulationScenario(args) };
  else throw Object.assign(new Error("Unknown tool"), { status: 400, code: "UNKNOWN_TOOL" });
  const receipt = await writeReceipt(env, { requestId, toolName: name, actorType: identity.actorType, actorIdHash: identity.actorIdHash, input: args, output, durationMs: Date.now() - started });
  return { output: { ...output, receipt }, receipt };
}

async function routeApi(request, env, requestId) {
  const guard = requestGuard(request, env); if (guard) return guard;
  const rate = await rateLimit(request, env); if (!rate.allowed) return errorJson(429, "RATE_LIMITED", "Request limit exceeded.");
  const body = await readJson(request, env);
  if (typeof body.request !== "string" || !body.request.trim() || body.request.length > 8000) return errorJson(400, "INVALID_REQUEST", "request must be a non-empty string up to 8,000 characters.");
  const identity = await actorIdentity(request, env);
  const result = await executeTool("route_front_desk", { request: body.request }, env, requestId, identity);
  return json(result.output);
}

async function riskApi(request, env, requestId) {
  const guard = requestGuard(request, env); if (guard) return guard;
  const rate = await rateLimit(request, env); if (!rate.allowed) return errorJson(429, "RATE_LIMITED", "Request limit exceeded.");
  const body = await readJson(request, env);
  const tool = TOOLS.find((t) => t.name === "assess_mcp_request_risk");
  const problem = validateArguments(tool, body);
  if (problem) return errorJson(400, "INVALID_RISK_INPUT", problem);
  const identity = await actorIdentity(request, env);
  const result = await executeTool("assess_mcp_request_risk", body, env, requestId, identity);
  return json(result.output);
}

async function simulationApi(request, env, requestId) {
  const guard = requestGuard(request, env); if (guard) return guard;
  const rate = await rateLimit(request, env); if (!rate.allowed) return errorJson(429, "RATE_LIMITED", "Request limit exceeded.");
  const body = await readJson(request, env);
  const tool = TOOLS.find((t) => t.name === "run_simulation_scenario");
  const problem = validateArguments(tool, body);
  if (problem) return errorJson(400, "INVALID_SIMULATION_INPUT", problem);
  const identity = await actorIdentity(request, env);
  const result = await executeTool("run_simulation_scenario", body, env, requestId, identity);
  return json(result.output);
}

async function health(env, requestId) {
  try { await ensureSchema(env.DB); await env.DB.prepare("SELECT 1 AS ok").first(); return json({ status: "ok", service: "agentropolis-agent-mcp", version: env.SERVICE_VERSION, environment: env.ENVIRONMENT, requestId, checks: { worker: "ok", assets: "bound", d1: "ok", simulation: "bounded" }, timestamp: new Date().toISOString() }); }
  catch { return json({ status: "degraded", service: "agentropolis-agent-mcp", requestId, checks: { worker: "ok", assets: "bound", d1: "degraded", simulation: "bounded" }, timestamp: new Date().toISOString() }, 503); }
}

async function listReceipts(request, env) {
  const auth = authorizeOperator(request, env); if (auth) return auth;
  await ensureSchema(env.DB);
  const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("limit") || 25)));
  const rows = await env.DB.prepare("SELECT id,request_id,tool_name,actor_type,authority_decision,input_hash,output_hash,status,duration_ms,created_at FROM execution_receipts ORDER BY created_at DESC LIMIT ?").bind(limit).all();
  return json({ receipts: rows.results || [] });
}

async function getReceipt(request, env, path) {
  const auth = authorizeOperator(request, env); if (auth) return auth;
  const id = decodeURIComponent(path.slice("/api/receipts/".length));
  if (!/^rcpt_[a-f0-9-]{36}$/i.test(id)) return errorJson(400, "INVALID_RECEIPT_ID", "Receipt ID format is invalid.");
  await ensureSchema(env.DB);
  const row = await env.DB.prepare("SELECT id,request_id,tool_name,actor_type,authority_decision,input_hash,output_hash,status,duration_ms,created_at FROM execution_receipts WHERE id=?").bind(id).first();
  return row ? json({ receipt: row }) : errorJson(404, "NOT_FOUND", "Receipt not found.");
}

async function writeReceipt(env, data) {
  const receipt = { id: `rcpt_${crypto.randomUUID()}`, persisted: false, authorityDecision: "ALLOW_READ_ONLY" };
  try {
    await ensureSchema(env.DB);
    const createdAt = new Date().toISOString();
    const inputHash = await sha256(stable(data.input));
    const outputHash = await sha256(stable(data.output));
    await env.DB.prepare("INSERT INTO execution_receipts (id,request_id,tool_name,tool_version,actor_type,actor_id_hash,authority_decision,input_hash,output_hash,status,duration_ms,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(receipt.id, data.requestId, data.toolName, "1.0.0", data.actorType, data.actorIdHash, "ALLOW_READ_ONLY", inputHash, outputHash, "success", data.durationMs, createdAt).run();
    receipt.persisted = true;
  } catch (error) { console.warn(JSON.stringify({ event: "receipt_persistence_failed", receiptId: receipt.id, message: error instanceof Error ? error.message : "unknown" })); }
  return receipt;
}

async function ensureSchema(db) {
  if (!schemaReady) schemaReady = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS execution_receipts (id TEXT PRIMARY KEY,request_id TEXT NOT NULL,tool_name TEXT NOT NULL,tool_version TEXT NOT NULL,actor_type TEXT NOT NULL,actor_id_hash TEXT,authority_decision TEXT NOT NULL,input_hash TEXT NOT NULL,output_hash TEXT,status TEXT NOT NULL CHECK(status IN ('success','error')),duration_ms INTEGER NOT NULL CHECK(duration_ms>=0),created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_created ON execution_receipts(created_at DESC)"),
    db.prepare("CREATE TABLE IF NOT EXISTS security_events (id TEXT PRIMARY KEY,request_id TEXT NOT NULL,event_type TEXT NOT NULL,severity TEXT NOT NULL,detail_json TEXT NOT NULL,created_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT NOT NULL,window_start INTEGER NOT NULL,count INTEGER NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(key_hash,window_start))")
  ]).catch((error) => { schemaReady = undefined; throw error; });
  return schemaReady;
}

async function rateLimit(request, env) {
  try {
    await ensureSchema(env.DB);
    const windowSeconds = positive(env.RATE_LIMIT_WINDOW_SECONDS, 60);
    const limit = positive(env.RATE_LIMIT_MAX_REQUESTS, 120);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const key = await sha256(`${request.headers.get("cf-connecting-ip") || "unknown"}:${new URL(request.url).pathname}`);
    await env.DB.prepare("INSERT INTO rate_limits(key_hash,window_start,count,updated_at) VALUES(?,?,1,?) ON CONFLICT(key_hash,window_start) DO UPDATE SET count=count+1,updated_at=excluded.updated_at").bind(key, windowStart, new Date().toISOString()).run();
    const row = await env.DB.prepare("SELECT count FROM rate_limits WHERE key_hash=? AND window_start=?").bind(key, windowStart).first();
    return { allowed: Number(row?.count || 1) <= limit };
  } catch { return { allowed: true, degraded: true }; }
}

function requestGuard(request, env) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (host && host !== url.host) return errorJson(400, "HOST_MISMATCH", "Host header does not match the request URL.");
  const origin = request.headers.get("origin");
  if (origin && !originAllowed(origin, url.origin, env.ALLOWED_ORIGINS)) return errorJson(403, "ORIGIN_DENIED", "Origin is not allowed.");
  const length = Number(request.headers.get("content-length") || 0);
  if (length > positive(env.MAX_REQUEST_BYTES, 131072)) return errorJson(413, "REQUEST_TOO_LARGE", "Request body exceeds the configured limit.");
  return null;
}

function authorizeMcp(request, env) {
  if (env.PUBLIC_MCP_ENABLED === "false" || env.MCP_AUTH_MODE === "disabled") return errorJson(503, "MCP_DISABLED", "The MCP endpoint is disabled.");
  if (env.MCP_AUTH_MODE === "token") return authorizeOperator(request, env);
  return null;
}
function authorizeOperator(request, env) {
  if (!env.MCP_API_TOKEN) return errorJson(503, "OPERATOR_TOKEN_NOT_CONFIGURED", "Operator access is not configured.");
  const token = bearer(request);
  if (!token || !constantEqual(token, env.MCP_API_TOKEN)) return errorJson(401, "UNAUTHORIZED", "A valid bearer token is required.", { "www-authenticate": "Bearer" });
  return null;
}
async function actorIdentity(request, env) {
  const token = bearer(request);
  return token && env.MCP_API_TOKEN && constantEqual(token, env.MCP_API_TOKEN) ? { actorType: "operator", actorIdHash: await sha256(token) } : { actorType: "anonymous", actorIdHash: null };
}

async function readJson(request, env) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > positive(env.MAX_REQUEST_BYTES, 131072)) throw Object.assign(new Error("Request body exceeds the configured limit."), { status: 413, code: "REQUEST_TOO_LARGE" });
  if (text && !(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) throw Object.assign(new Error("Request body must use application/json."), { status: 415, code: "UNSUPPORTED_MEDIA_TYPE" });
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error("Request body must contain valid JSON."), { status: 400, code: "INVALID_JSON" }); }
}

async function securityEvent(env, requestId, type, severity, detail) {
  try { await ensureSchema(env.DB); await env.DB.prepare("INSERT INTO security_events(id,request_id,event_type,severity,detail_json,created_at) VALUES(?,?,?,?,?,?)").bind(`sec_${crypto.randomUUID()}`, requestId, type, severity, JSON.stringify(detail), new Date().toISOString()).run(); } catch {}
}

function respond(response, request, env, requestId) {
  const headers = new Headers(response.headers);
  const url = new URL(request.url); const origin = request.headers.get("origin");
  if (origin && originAllowed(origin, url.origin, env.ALLOWED_ORIGINS)) { headers.set("access-control-allow-origin", origin); headers.append("vary", "Origin"); }
  headers.set("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "Authorization,Content-Type,MCP-Protocol-Version,MCP-Session-Id,Last-Event-ID");
  headers.set("access-control-expose-headers", "MCP-Session-Id,X-Request-Id");
  headers.set("x-content-type-options", "nosniff"); headers.set("referrer-policy", "strict-origin-when-cross-origin"); headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()"); headers.set("x-request-id", requestId); headers.set("x-agentropolis-version", env.SERVICE_VERSION || "1.0.0");
  if (url.pathname.startsWith("/api/") || MCP_PATHS.has(url.pathname) || url.pathname === "/health") headers.set("cache-control", "no-store");
  console.info(JSON.stringify({ event: "http_response", requestId, method: request.method, path: url.pathname, status: response.status }));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
function json(value, status = 200, extra = {}) { return new Response(JSON.stringify(value, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", ...extra } }); }
function errorJson(status, code, message, headers = {}) { return json({ error: { code, message } }, status, headers); }
function rpcResult(id, result) { return json({ jsonrpc: "2.0", id, result }); }
function rpcError(id, code, message) { return json({ jsonrpc: "2.0", id, error: { code, message } }, code === -32600 ? 400 : 200); }
function bearer(request) { const value = request.headers.get("authorization") || ""; return value.startsWith("Bearer ") ? value.slice(7) : null; }
function constantEqual(a, b) { const aa = new TextEncoder().encode(a); const bb = new TextEncoder().encode(b); let diff = aa.length ^ bb.length; const n = Math.max(aa.length, bb.length); for (let i = 0; i < n; i++) diff |= (aa[i % aa.length] || 0) ^ (bb[i % bb.length] || 0); return diff === 0; }
function originAllowed(origin, own, configured) { return origin === own || String(configured || "").split(",").map((x) => x.trim()).filter(Boolean).includes(origin); }
function positive(value, fallback) { const n = Number(value); return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback; }
async function sha256(value) { const bytes = new TextEncoder().encode(value); const digest = await crypto.subtle.digest("SHA-256", bytes); return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
function stable(value) { if (value === null || typeof value !== "object") return JSON.stringify(value); if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`; return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`; }
