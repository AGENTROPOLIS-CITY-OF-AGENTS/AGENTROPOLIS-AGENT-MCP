export const RCP_PROFILE_VERSION = "rcp/0.1-draft";

const REQUIRED_TOP_LEVEL = [
  "protocol",
  "world",
  "sources",
  "spatial",
  "procedural_laws",
  "geometry",
  "runtime",
  "governance",
  "audit"
];

const REQUIRED_GEOMETRY_LAYERS = ["render", "collision", "navigation", "semantic"];
const RELEASE_RIGHTS = new Set(["owned", "licensed", "public_safe", "not_required"]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function issue(code, path, message, severity = "error") {
  return { code, path, message, severity };
}

export function validateRcpWorldPackage(input, options = {}) {
  const releaseCandidate = Boolean(options.releaseCandidate);
  const findings = [];

  if (!isObject(input)) {
    return {
      profile: RCP_PROFILE_VERSION,
      valid: false,
      releaseReady: false,
      findings: [issue("RCP_NOT_OBJECT", "$", "World Package must be a JSON object.")]
    };
  }

  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in input)) findings.push(issue("RCP_REQUIRED_FIELD", `$.${key}`, `Missing required top-level field: ${key}.`));
  }

  if (input.protocol !== RCP_PROFILE_VERSION) {
    findings.push(issue("RCP_VERSION_MISMATCH", "$.protocol", `Expected protocol ${RCP_PROFILE_VERSION}.`));
  }

  if (!isObject(input.world)) {
    findings.push(issue("RCP_WORLD_INVALID", "$.world", "world must be an object."));
  } else {
    if (typeof input.world.id !== "string" || !input.world.id.trim()) findings.push(issue("RCP_WORLD_ID", "$.world.id", "world.id must be a non-empty stable identifier."));
    if (typeof input.world.version !== "string" || !input.world.version.trim()) findings.push(issue("RCP_WORLD_VERSION", "$.world.version", "world.version must be a non-empty version."));
    if (typeof input.world.title !== "string" || !input.world.title.trim()) findings.push(issue("RCP_WORLD_TITLE", "$.world.title", "world.title must be present."));
  }

  if (!Array.isArray(input.sources) || input.sources.length === 0) {
    findings.push(issue("RCP_SOURCES_EMPTY", "$.sources", "At least one source or explicit original-intent record is required."));
  } else {
    input.sources.forEach((source, index) => {
      if (!isObject(source)) return findings.push(issue("RCP_SOURCE_INVALID", `$.sources[${index}]`, "Source must be an object."));
      if (!source.id) findings.push(issue("RCP_SOURCE_ID", `$.sources[${index}].id`, "Source requires an id."));
      if (!source.rights_status) findings.push(issue("RCP_RIGHTS_UNKNOWN", `$.sources[${index}].rights_status`, "Source rights status is required."));
      if (releaseCandidate && !RELEASE_RIGHTS.has(source.rights_status)) findings.push(issue("RCP_RIGHTS_BLOCK_RELEASE", `$.sources[${index}].rights_status`, "Release candidates require owned, licensed, public_safe, or not_required rights status."));
    });
  }

  if (!isObject(input.geometry)) {
    findings.push(issue("RCP_GEOMETRY_INVALID", "$.geometry", "geometry must be an object."));
  } else {
    for (const layer of REQUIRED_GEOMETRY_LAYERS) {
      if (!(layer in input.geometry)) findings.push(issue("RCP_GEOMETRY_LAYER", `$.geometry.${layer}`, `Missing ${layer} geometry declaration.`));
    }
  }

  if (!Array.isArray(input.procedural_laws)) {
    findings.push(issue("RCP_LAWS_INVALID", "$.procedural_laws", "procedural_laws must be an array."));
  } else {
    const identifiers = new Set();
    input.procedural_laws.forEach((law, index) => {
      if (!isObject(law)) return findings.push(issue("RCP_LAW_INVALID", `$.procedural_laws[${index}]`, "Procedural law must be an object."));
      if (!law.id) findings.push(issue("RCP_LAW_ID", `$.procedural_laws[${index}].id`, "Procedural law requires an id."));
      else if (identifiers.has(law.id)) findings.push(issue("RCP_LAW_DUPLICATE", `$.procedural_laws[${index}].id`, "Procedural law ids must be unique."));
      else identifiers.add(law.id);
      if (law.seed === undefined || law.seed === null) findings.push(issue("RCP_LAW_SEED", `$.procedural_laws[${index}].seed`, "Procedural laws require an explicit seed for reproducibility."));
      if (!Array.isArray(law.invariants) || law.invariants.length === 0) findings.push(issue("RCP_LAW_INVARIANTS", `$.procedural_laws[${index}].invariants`, "Procedural laws require at least one invariant.", "warning"));
    });
  }

  if (!isObject(input.governance)) {
    findings.push(issue("RCP_GOVERNANCE_INVALID", "$.governance", "governance must be an object."));
  } else {
    if (!Array.isArray(input.governance.authority_scopes)) findings.push(issue("RCP_AUTHORITY_SCOPES", "$.governance.authority_scopes", "authority_scopes must be declared."));
    if (input.governance.physical_actuation === true) findings.push(issue("RCP_PHYSICAL_CORRIDOR", "$.governance.physical_actuation", "Physical actuation requires a separate high-risk corridor."));
    if (releaseCandidate && input.governance.human_review_required !== true) findings.push(issue("RCP_HUMAN_REVIEW", "$.governance.human_review_required", "Release candidates require human review."));
  }

  if (!isObject(input.audit) || !Array.isArray(input.audit.required_checks) || input.audit.required_checks.length === 0) {
    findings.push(issue("RCP_AUDIT_PROFILE", "$.audit.required_checks", "At least one required audit check must be declared."));
  }

  if (releaseCandidate) {
    if (!input.governance?.release_receipt_id) findings.push(issue("RCP_RELEASE_RECEIPT", "$.governance.release_receipt_id", "Release candidate is missing a release receipt reference."));
    if (!input.runtime?.artifact_manifest_digest) findings.push(issue("RCP_ARTIFACT_DIGEST", "$.runtime.artifact_manifest_digest", "Release candidate is missing an artifact manifest digest."));
    if (!input.audit?.report_digest) findings.push(issue("RCP_AUDIT_DIGEST", "$.audit.report_digest", "Release candidate is missing an audit report digest."));
  }

  const errors = findings.filter((finding) => finding.severity === "error");
  return {
    profile: RCP_PROFILE_VERSION,
    valid: errors.length === 0,
    releaseReady: releaseCandidate && errors.length === 0,
    summary: {
      errors: errors.length,
      warnings: findings.filter((finding) => finding.severity === "warning").length
    },
    authority: "READ_ONLY",
    findings
  };
}

export function rcpValidationToolDefinition() {
  return {
    name: "validate_rcp_world_package",
    title: "Validate RCP World Package",
    description: "Perform read-only structural and governance checks against the RCP 0.1 draft profile.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        worldPackage: { type: "object" },
        releaseCandidate: { type: "boolean", default: false }
      },
      required: ["worldPackage"]
    }
  };
}
