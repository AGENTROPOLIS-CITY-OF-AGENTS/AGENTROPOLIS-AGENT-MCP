export const PRESENTATION_MODES = Object.freeze(["MAIN_STREET", "BUILDER", "DEVELOPER"]);
export const TEXT_VERBOSITY = Object.freeze(["LOW", "MEDIUM", "HIGH"]);
export const NEURO_WORKSTYLES = Object.freeze(["ARCHITECT", "SPARK", "ANCHOR", "PHANTOM"]);

const PLANS = Object.freeze({
  ARCHITECT: {
    leadWith: "system_map",
    behaviors: ["map_dependencies", "sequence_work", "surface_constraints", "show_tradeoffs"]
  },
  SPARK: {
    leadWith: "options",
    behaviors: ["generate_variants", "branch_rapidly", "capture_ideas", "converge_after_exploration"]
  },
  ANCHOR: {
    leadWith: "checklist",
    behaviors: ["show_state", "reduce_context_switching", "use_qa_gates", "show_next_action"]
  },
  PHANTOM: {
    leadWith: "deep_work_block",
    behaviors: ["minimize_interruptions", "batch_questions", "work_within_bounds", "return_handoff_and_receipt"]
  }
});

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeCognitionProfile(input = {}) {
  const workstyleInput = input.workstyle || {};
  const primary = pick(workstyleInput.primary, NEURO_WORKSTYLES, "ANCHOR");
  const secondary = NEURO_WORKSTYLES.includes(workstyleInput.secondary) && workstyleInput.secondary !== primary
    ? workstyleInput.secondary
    : null;

  return {
    profile: "ATG:COGNITION",
    version: "0.2.0",
    presentationMode: pick(input.presentation_mode, PRESENTATION_MODES, "MAIN_STREET"),
    textVerbosity: pick(input.text_verbosity, TEXT_VERBOSITY, "MEDIUM"),
    workstyle: {
      primary,
      secondary,
      lockedByUser: Boolean(workstyleInput.locked_by_user),
      selectionSource: workstyleInput.selection_source || input.selection_source || "DEFAULT"
    },
    supports: Array.isArray(input.supports) ? [...new Set(input.supports)] : []
  };
}

export function buildPresentationPlan(input = {}) {
  const profile = normalizeCognitionProfile(input);
  const primaryPlan = PLANS[profile.workstyle.primary];

  return {
    profile,
    leadWith: primaryPlan.leadWith,
    behaviors: [...primaryPlan.behaviors],
    authorityEffect: "NONE",
    policyEffect: "NONE",
    employmentDecisionEffect: "PROHIBITED",
    note: "This plan changes presentation and workflow support only. It does not grant capability authority or alter employment decisions."
  };
}
