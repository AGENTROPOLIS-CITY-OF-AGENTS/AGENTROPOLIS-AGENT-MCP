import test from "node:test";
import assert from "node:assert/strict";
import { validateRcpWorldPackage, RCP_PROFILE_VERSION } from "../src/rcp-validation.js";

function fixture() {
  return {
    protocol: RCP_PROFILE_VERSION,
    world: { id: "agentropolis.test.world", version: "0.1.0-draft", title: "Test World" },
    sources: [{ id: "original-intent", rights_status: "owned" }],
    spatial: { nodes: [], edges: [] },
    procedural_laws: [{ id: "terrain.test", seed: 589, invariants: ["spawn remains reachable"] }],
    geometry: { render: {}, collision: {}, navigation: {}, semantic: {} },
    runtime: { target: "threejs-webgpu" },
    governance: { authority_scopes: ["rcp.plan", "rcp.build.sandbox", "rcp.audit"], human_review_required: true, physical_actuation: false },
    audit: { required_checks: ["schema", "reachability"] }
  };
}

test("accepts a structurally valid sandbox package", () => {
  const result = validateRcpWorldPackage(fixture());
  assert.equal(result.valid, true);
  assert.equal(result.authority, "READ_ONLY");
  assert.equal(result.summary.errors, 0);
});

test("rejects missing geometry layers", () => {
  const input = fixture();
  delete input.geometry.navigation;
  const result = validateRcpWorldPackage(input);
  assert.equal(result.valid, false);
  assert.ok(result.findings.some((finding) => finding.code === "RCP_GEOMETRY_LAYER"));
});

test("blocks physical actuation in baseline validation", () => {
  const input = fixture();
  input.governance.physical_actuation = true;
  const result = validateRcpWorldPackage(input);
  assert.equal(result.valid, false);
  assert.ok(result.findings.some((finding) => finding.code === "RCP_PHYSICAL_CORRIDOR"));
});

test("requires immutable evidence for release candidates", () => {
  const result = validateRcpWorldPackage(fixture(), { releaseCandidate: true });
  assert.equal(result.releaseReady, false);
  assert.ok(result.findings.some((finding) => finding.code === "RCP_RELEASE_RECEIPT"));
  assert.ok(result.findings.some((finding) => finding.code === "RCP_ARTIFACT_DIGEST"));
  assert.ok(result.findings.some((finding) => finding.code === "RCP_AUDIT_DIGEST"));
});

test("accepts release evidence when present", () => {
  const input = fixture();
  input.governance.release_receipt_id = "rcpt_rcp_test";
  input.runtime.artifact_manifest_digest = "sha256:artifact";
  input.audit.report_digest = "sha256:audit";
  const result = validateRcpWorldPackage(input, { releaseCandidate: true });
  assert.equal(result.valid, true);
  assert.equal(result.releaseReady, true);
});
