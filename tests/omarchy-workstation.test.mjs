import test from "node:test";
import assert from "node:assert/strict";
import {
  createOmarchyMachineProfile,
  projectOmarchyForBuilderCommons,
  canAdvertiseOmarchyCompute
} from "../integrations/herdr/omarchy-profile.mjs";

test("Omarchy profile starts authority-free and quarantined by default", () => {
  const profile = createOmarchyMachineProfile({ machineProfileId: "omarchy-primary" });
  assert.equal(profile.host_environment, "omarchy");
  assert.equal(profile.trust_state, "quarantined");
  assert.equal(profile.authority_granted, false);
  assert.equal(canAdvertiseOmarchyCompute(profile), false);
});

test("Builder Commons projection excludes credential references", () => {
  const profile = createOmarchyMachineProfile({
    machineProfileId: "omarchy-primary",
    credentialReference: "broker:opaque-ref"
  });
  const projected = projectOmarchyForBuilderCommons(profile);
  assert.equal("credential_reference" in projected, false);
  assert.equal(projected.executable, false);
  assert.equal(projected.authority_granted, false);
});

test("compute advertisement requires verified live profile", () => {
  const profile = createOmarchyMachineProfile({
    machineProfileId: "omarchy-primary",
    trustState: "verified",
    connectivityState: "live"
  });
  assert.equal(canAdvertiseOmarchyCompute(profile), true);
});

test("unsafe machine identifiers are rejected", () => {
  assert.throws(() => createOmarchyMachineProfile({
    machineProfileId: "../../etc/passwd"
  }), /opaque safe identifier/);
});
