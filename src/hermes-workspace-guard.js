// Candidate, server-only preflight. No runtime wiring, plugin install or tool invocation.
// Providers MUST be trusted server-injected implementations, never values from the agent request.
const ID = /^[A-Za-z0-9._:-]{1,128}$/;
const isId = (v) => typeof v === 'string' && ID.test(v);
const isRecord = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const ACTION_ROLES = Object.freeze({
  'config.read': ['viewer', 'auditor', 'operator', 'admin'],
  'config.update': ['admin'],
  'bots.list': ['viewer', 'auditor', 'operator', 'admin'],
  'bots.create': ['admin'],
  'bot.execute': ['operator', 'admin'],
  'receipt.read': ['auditor', 'admin'],
  'plugin.install': ['admin'],
  'browser.search': ['operator', 'admin'],
  'browser.fetch': ['operator', 'admin'],
  'browser.navigate': ['operator', 'admin'],
  'browser.agent': ['operator', 'admin'],
});
const BROWSER = new Set(['browser.search', 'browser.fetch', 'browser.navigate', 'browser.agent']);
const PRIVILEGED = new Set(['config.update', 'bots.create', 'plugin.install', 'browser.agent']);
export const HERMES_WORKSPACE_ACTIONS = Object.freeze(Object.keys(ACTION_ROLES));
const deny = (reason) => ({decision: 'DENY_PREFLIGHT', reason, invocation_performed: false, receipt_id: null});

export async function evaluateHermesWorkspacePreflight(request, providers = {}, now = Date.now()) {
  if (!isRecord(request) || !Number.isFinite(now)) return deny('INVALID_REQUEST');
  const required = ['request_id', 'actor_id', 'workspace_id', 'resource_id', 'action_digest', 'mandate_id', 'envelope_id', 'credential_ref'];
  if (required.some((k) => !isId(request[k])) || !Object.hasOwn(ACTION_ROLES, request.action)) return deny('UNRECOGNIZED_SCOPE');
  if (request.bot_id !== undefined && !isId(request.bot_id)) return deny('INVALID_BOT_ID');
  // No authority can be derived from request-supplied role, verifier flags, proof or receipts.
  if (['role', 'authority_decision', 'verification', 'attestation', 'authorization_receipt'].some((k) => Object.hasOwn(request, k))) {
    return deny('CALLER_SUPPLIED_AUTHORITY');
  }
  const callbacks = ['resolveIdentity', 'checkWorkspace', 'evaluateAegis', 'verifyContainment', 'persistReceipt'];
  if (callbacks.some((k) => typeof providers[k] !== 'function')) return deny('VERIFIER_UNAVAILABLE');
  if (BROWSER.has(request.action) && typeof providers.verifyBudget !== 'function') return deny('BUDGET_VERIFIER_UNAVAILABLE');
  if (PRIVILEGED.has(request.action) && typeof providers.verifyApproval !== 'function') return deny('APPROVAL_VERIFIER_UNAVAILABLE');

  let decision = 'DENY_PREFLIGHT';
  let reason = 'VERIFICATION_FAILED';
  try {
    const identity = await providers.resolveIdentity({actor_id:request.actor_id, credential_ref:request.credential_ref, now});
    if (!isRecord(identity) || identity.verified !== true || identity.actor_id !== request.actor_id ||
        identity.credential_ref !== request.credential_ref || !Number.isFinite(identity.expires_at) ||
        identity.expires_at <= now || !Array.isArray(ACTION_ROLES[request.action]) ||
        !ACTION_ROLES[request.action].includes(identity.role)) {
      reason = 'IDENTITY_OR_ROLE_DENIED';
    } else {
      const membership = await providers.checkWorkspace({actor_id:request.actor_id, workspace_id:request.workspace_id, bot_id:request.bot_id ?? null, resource_id:request.resource_id, action:request.action});
      if (!isRecord(membership) || membership.verified !== true || membership.allowed !== true ||
          membership.actor_id !== request.actor_id || membership.workspace_id !== request.workspace_id ||
          membership.resource_id !== request.resource_id || (request.bot_id && membership.bot_id !== request.bot_id)) {
        reason = 'TENANCY_DENIED';
      } else {
        const context = {actor_id:request.actor_id, workspace_id:request.workspace_id, bot_id:request.bot_id ?? null,
          resource_id:request.resource_id, action:request.action, action_digest:request.action_digest,
          mandate_id:request.mandate_id, envelope_id:request.envelope_id};
        const policy = await providers.evaluateAegis(context);
        if (!isRecord(policy) || policy.verdict !== 'ALLOW' || policy.actor_id !== request.actor_id ||
            policy.workspace_id !== request.workspace_id || policy.action_digest !== request.action_digest ||
            policy.mandate_id !== request.mandate_id || policy.envelope_id !== request.envelope_id ||
            !isId(policy.policy_version)) {
          reason = 'AEGIS_DENIED';
        } else {
          const containment = await providers.verifyContainment(context);
          if (!isRecord(containment) || containment.verified !== true || containment.test_double === true ||
              containment.actor_id !== request.actor_id || containment.workspace_id !== request.workspace_id ||
              containment.action_digest !== request.action_digest || !isId(containment.proof_ref) ||
              !Number.isFinite(containment.expires_at) || containment.expires_at <= now) {
            reason = 'CONTAINMENT_DENIED';
          } else {
            let checksPass = true;
            if (PRIVILEGED.has(request.action)) {
              const approval = await providers.verifyApproval(context);
              checksPass = isRecord(approval) && approval.verified === true && approval.action_digest === request.action_digest && approval.actor_id === request.actor_id && approval.expires_at > now;
              if (!checksPass) reason = 'APPROVAL_DENIED';
            }
            if (checksPass && BROWSER.has(request.action)) {
              const budget = await providers.verifyBudget(context);
              checksPass = isRecord(budget) && budget.verified === true && budget.action_digest === request.action_digest && budget.actor_id === request.actor_id && Number.isFinite(budget.max_credits) && budget.max_credits >= 0 && Number.isFinite(budget.expires_at) && budget.expires_at > now;
              if (!checksPass) reason = 'BUDGET_DENIED';
            }
            if (checksPass) {decision = 'ALLOW_PREFLIGHT'; reason = 'PRECHECKS_PASSED';}
          }
        }
      }
    }
  } catch {
    decision = 'DENY_PREFLIGHT';
    reason = 'VERIFIER_ERROR';
  }
  // Fail closed when the receipt store fails, including for would-be allows.
  try {
    const rec = await providers.persistReceipt({request_id:request.request_id, actor_id:request.actor_id,
      workspace_id:request.workspace_id, bot_id:request.bot_id ?? null, resource_id:request.resource_id,
      action:request.action, action_digest:request.action_digest, decision, reason, timestamp_ms:now});
    if (!isRecord(rec) || rec.persisted !== true || !isId(rec.receipt_id)) return deny('RECEIPT_UNAVAILABLE');
    return {decision, reason, receipt_id:rec.receipt_id, invocation_performed:false};
  } catch {
    return deny('RECEIPT_UNAVAILABLE');
  }
}
