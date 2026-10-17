// Build provenance for /health. Values are injected at deploy time via
// `wrangler deploy --var BUILD_SHA:<sha> --var BUILD_ID:<id>`; anything that
// is missing or malformed is reported as "unknown" (never echoed raw).
const SHA_RE = /^[0-9a-f]{40}$/;
const BUILD_ID_RE = /^[A-Za-z0-9._:-]{1,64}$/;

export function buildInfo(env = {}) {
  const sha = String(env.BUILD_SHA || "").trim().toLowerCase();
  const id = String(env.BUILD_ID || "").trim();
  return {
    commitSha: SHA_RE.test(sha) ? sha : "unknown",
    buildId: BUILD_ID_RE.test(id) ? id : "unknown",
  };
}
