import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRuntimeDispatchReceipt,
  buildRuntimeRegistry,
  selectRuntime
} from "../src/runtime/runtime-router.js";

const piContext = {
  workerApproved: true,
  workspaceIdentityVerified: true,
  credentialHandleResolved: true,
  receiptDestinationConfigured: true,
  rawSecretsPresent: false
};

test("coding tasks prefer Codex when healthy and affordable", () => {
  const result = selectRuntime({ coding: true, kind: "repo_patch" });
  assert.equal(result.runtime, "codex");
  assert.equal(result.reason, "coding_fit");
});

test("Pi is selected as coding fallback when enabled and Codex is unavailable", () => {
  const registry = buildRuntimeRegistry({ pi: { enabled: true } });
  const result = selectRuntime(
    { coding: true, kind: "repo_patch" },
    { registry, health: { codex: false }, context: piContext }
  );
  assert.equal(result.runtime, "pi");
  assert.equal(result.authority, "POLICY_GATED");
});

test("Pi fails closed when worker attestation is missing", () => {
  const registry = buildRuntimeRegistry({ pi: { enabled: true } });
  assert.throws(() => selectRuntime(
    { coding: true, runtimePreference: "pi" },
    {
      registry,
      context: { ...piContext, workerApproved: false }
    }
  ), /approved worker/);
});

test("Pi rejects raw secrets at routing boundary", () => {
  const registry = buildRuntimeRegistry({ pi: { enabled: true } });
  assert.throws(() => selectRuntime(
    { coding: true, runtimePreference: "pi" },
    {
      registry,
      context: { ...piContext, rawSecretsPresent: true }
    }
  ), /raw secrets/);
});

test("private work prefers local runtime before remote coding lanes", () => {
  const result = selectRuntime({ coding: true, privateWork: true });
  assert.equal(result.runtime, "local");
  assert.equal(result.reason, "privacy_locality");
});

test("browser tasks route to Hermes", () => {
  const result = selectRuntime({ browser: true, description: "inspect website" });
  assert.equal(result.runtime, "hermes");
  assert.equal(result.reason, "browser_capability");
});

test("dispatch receipt records routing decision without credentials", () => {
  const route = selectRuntime({ coding: true, kind: "test_generation", repo: "wiredchaos/example" });
  const receipt = buildRuntimeDispatchReceipt(route, { kind: "test_generation", repo: "wiredchaos/example" }, piContext);
  assert.equal(receipt.type, "runtime_dispatch");
  assert.equal(receipt.runtime, "codex");
  assert.equal(receipt.repo, "wiredchaos/example");
  assert.equal(Object.hasOwn(receipt, "credentialHandle"), false);
});
