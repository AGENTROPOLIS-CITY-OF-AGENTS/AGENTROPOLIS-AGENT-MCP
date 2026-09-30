import test from "node:test";
import assert from "node:assert/strict";
import { rentAHumanProviderManifest, searchExternalWorkers, validateWorkerSearch } from "../src/cbe-rentahuman.js";

test("provider is disabled by default and write capabilities remain blocked", () => {
  const manifest = rentAHumanProviderManifest({});
  assert.equal(manifest.enabled, false);
  assert.equal(manifest.authority, "READ_ONLY_BETA");
  assert.ok(manifest.blockedCapabilities.includes("payment.release"));
  assert.ok(manifest.blockedCapabilities.includes("bounty.create"));
});

test("search validation rejects over-broad and malformed inputs", () => {
  assert.match(validateWorkerSearch({ limit: 26 }), /limit/);
  assert.match(validateWorkerSearch({ minRate: 100, maxRate: 50 }), /minRate/);
  assert.match(validateWorkerSearch({ unexpected: true }), /unexpected argument/);
  assert.equal(validateWorkerSearch({ skill: "photography", city: "Los Angeles", limit: 5 }), null);
});

test("disabled provider fails closed before network access", async () => {
  let called = false;
  await assert.rejects(
    searchExternalWorkers({ skill: "photography" }, {}, async () => { called = true; }),
    (error) => error.code === "CBE_PROVIDER_DISABLED"
  );
  assert.equal(called, false);
});

test("search normalizes external provider records without leaking credentials", async () => {
  let observed;
  const fakeFetch = async (url, options) => {
    observed = { url: String(url), options };
    return new Response(JSON.stringify({ humans: [{ id: "h1", name: "Demo Human", skills: ["photography"], city: "Los Angeles", country: "US", hourlyRate: 35, rating: 4.9, completedTasks: 14, identityVerified: true }] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  const result = await searchExternalWorkers(
    { skill: "photography", city: "Los Angeles", limit: 5 },
    { CBE_RENTAHUMAN_ENABLED: "true", RENTAHUMAN_API_KEY: "secret-test-key" },
    fakeFetch
  );

  assert.equal(result.provider, "rentahuman");
  assert.equal(result.count, 1);
  assert.equal(result.workers[0].cbeWorkerRef, "rentahuman:h1");
  assert.equal(result.workers[0].verified, true);
  assert.equal(result.workers[0].provenance.verification, "provider-asserted");
  assert.equal(observed.options.headers["X-API-Key"], "secret-test-key");
  assert.doesNotMatch(JSON.stringify(result), /secret-test-key/);
});

test("provider rate limits are translated into bounded CBE errors", async () => {
  await assert.rejects(
    searchExternalWorkers(
      { skill: "delivery" },
      { CBE_RENTAHUMAN_ENABLED: "true" },
      async () => new Response("rate limited", { status: 429 })
    ),
    (error) => error.code === "CBE_PROVIDER_RATE_LIMITED" && error.status === 429
  );
});
