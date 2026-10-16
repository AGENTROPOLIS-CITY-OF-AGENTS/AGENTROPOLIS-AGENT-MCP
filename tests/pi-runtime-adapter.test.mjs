import test from "node:test";
import assert from "node:assert/strict";
import {
  assertPiExecutionPreconditions,
  loadPiRuntimeConfig,
  resolvePiMode
} from "../src/runtime/pi-runtime-adapter.js";

function approvedContext(overrides = {}) {
  return {
    workerApproved: true,
    workspaceRoot: "/workspace/repo",
    workspaceIdentityVerified: true,
    credentialHandleResolved: true,
    effectiveCapabilitiesAttested: true,
    receiptDestinationConfigured: true,
    sdkExactVersionAttested: true,
    resourceDiscoveryIsolated: true,
    egressPolicyLoaded: true,
    mutationApproved: true,
    rawSecretsPresent: false,
    ...overrides
  };
}

test("Pi adapter defaults to advisory read-only tools", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config);
  assert.equal(config.status, "DISABLED_BY_DEFAULT");
  assert.equal(config.cloudflareWorkerExecutionAllowed, false);
  assert.equal(config.sdk.pinPolicy, "EXACT");
  assert.equal(mode.name, "ADVISORY");
  assert.equal(mode.mutationsAllowed, false);
  assert.deepEqual(mode.tools, ["read", "grep", "find", "ls"]);
});

test("Pi execute mode requires verified sandbox and approval", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "EXECUTE");
  const base = approvedContext();
  assert.throws(() => assertPiExecutionPreconditions({ config, mode, context: base }), /verified sandbox/);
  assert.equal(assertPiExecutionPreconditions({ config, mode, context: { ...base, sandboxVerified: true } }), true);
});

test("Pi mutation modes fail closed without approval", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "DRAFT");
  assert.throws(() => assertPiExecutionPreconditions({
    config,
    mode,
    context: approvedContext({ mutationApproved: false })
  }), /explicit policy or operator approval/);
});

test("Pi runtime rejects raw secrets", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "ADVISORY");
  assert.throws(() => assertPiExecutionPreconditions({
    config,
    mode,
    context: approvedContext({ rawSecretsPresent: true })
  }), /Raw secrets/);
});

test("Pi runtime rejects unverified SDK version", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "ADVISORY");
  assert.throws(() => assertPiExecutionPreconditions({
    config,
    mode,
    context: approvedContext({ sdkExactVersionAttested: false })
  }), /exact SDK version/);
});

test("Pi runtime rejects non-isolated resource discovery", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "ADVISORY");
  assert.throws(() => assertPiExecutionPreconditions({
    config,
    mode,
    context: approvedContext({ resourceDiscoveryIsolated: false })
  }), /resource discovery/);
});
