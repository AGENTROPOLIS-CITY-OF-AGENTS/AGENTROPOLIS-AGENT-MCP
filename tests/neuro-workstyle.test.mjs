import test from "node:test";
import assert from "node:assert/strict";
import { buildPresentationPlan, normalizeCognitionProfile } from "../src/neuro-workstyle.js";

test("normalizes independent cognition axes", () => {
  const p = normalizeCognitionProfile({
    presentation_mode: "DEVELOPER",
    text_verbosity: "LOW",
    selection_source: "USER",
    workstyle: { primary: "PHANTOM", locked_by_user: true, selection_source: "USER" }
  });
  assert.equal(p.presentationMode, "DEVELOPER");
  assert.equal(p.textVerbosity, "LOW");
  assert.equal(p.workstyle.primary, "PHANTOM");
  assert.equal(p.workstyle.lockedByUser, true);
});

test("invalid values fail to safe presentation defaults", () => {
  const p = normalizeCognitionProfile({
    presentation_mode: "EXPERT_SCORE",
    text_verbosity: "MAXIMUM",
    workstyle: { primary: "DIAGNOSIS" }
  });
  assert.equal(p.presentationMode, "MAIN_STREET");
  assert.equal(p.textVerbosity, "MEDIUM");
  assert.equal(p.workstyle.primary, "ANCHOR");
});

test("workstyle changes presentation only and never authority", () => {
  const plan = buildPresentationPlan({
    presentation_mode: "BUILDER",
    text_verbosity: "HIGH",
    workstyle: { primary: "ARCHITECT", selection_source: "USER" }
  });
  assert.equal(plan.leadWith, "system_map");
  assert.equal(plan.authorityEffect, "NONE");
  assert.equal(plan.policyEffect, "NONE");
  assert.equal(plan.employmentDecisionEffect, "PROHIBITED");
});

test("phantom mode minimizes interruption and returns a handoff", () => {
  const plan = buildPresentationPlan({ workstyle: { primary: "PHANTOM", selection_source: "USER" } });
  assert.ok(plan.behaviors.includes("minimize_interruptions"));
  assert.ok(plan.behaviors.includes("return_handoff_and_receipt"));
});
