import jspaceWorker from './jspace-index.js';
import { executeGovernedDryRun, createDryRunReceipt } from './dry-run-executor.js';
import { listOpsEvents, opsSupervisionEnabled } from './ops-supervisor.js';
import { canaryReadiness } from './canary-admission.js';
import { buildSpawnPlan } from './spawn-plan.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/spawn/plan') {
      if (request.method !== 'POST') {
        return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'The spawn plan endpoint accepts POST only.' } }, 405, {
          allow: 'POST',
        });
      }

      const maxBytes = positive(env.MAX_REQUEST_BYTES, 131072);
      const text = await request.text();
      if (new TextEncoder().encode(text).byteLength > maxBytes) {
        return json({ error: { code: 'REQUEST_TOO_LARGE', message: 'Request body exceeds the configured limit.' } }, 413);
      }
      if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
        return json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Request body must use application/json.' } }, 415);
      }

      let envelope;
      try {
        envelope = text ? JSON.parse(text) : {};
      } catch {
        return json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } }, 400);
      }

      try {
        const plan = buildSpawnPlan(envelope, {
          serviceVersion: env.SERVICE_VERSION || null,
          executionMode: env.EXECUTION_MODE || 'AUTHORIZATION_ONLY',
        });
        return json({
          ...plan,
          invocation_performed: false,
          deployment_performed: false,
          source_mutation_performed: false,
        });
      } catch (error) {
        return json({
          error: {
            code: error?.code || 'INVALID_SPAWN_REQUEST',
            message: error instanceof Error ? error.message : 'Spawn request is invalid.',
          },
        }, error?.status || 400);
      }
    }

    if (url.pathname === '/api/execution/canary/readiness') {
      if (request.method !== 'GET') {
        return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'The CANARY readiness endpoint accepts GET only.' } }, 405, {
          allow: 'GET',
        });
      }
      const auth = authorizeOperator(request, env);
      if (auth) return auth;
      const readiness = canaryReadiness(env);
      return json({
        ...readiness,
        execution_mode: env.EXECUTION_MODE || 'AUTHORIZATION_ONLY',
        provider_invocation: 'DISABLED',
      });
    }

    if (url.pathname === '/api/execution/ops') {
      if (request.method !== 'GET') {
        return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'The OPS endpoint accepts GET only.' } }, 405, {
          allow: 'GET',
        });
      }
      const auth = authorizeOperator(request, env);
      if (auth) return auth;
      if (!opsSupervisionEnabled(env)) {
        return json({ error: { code: 'OPS_SUPERVISION_DISABLED', message: 'OPS supervision is not enabled.' } }, 503);
      }
      try {
        const events = await listOpsEvents(env.DB, {
          job_id: url.searchParams.get('job_id'),
          production_id: url.searchParams.get('production_id'),
          authorization_receipt_id: url.searchParams.get('authorization_receipt_id'),
          limit: url.searchParams.get('limit'),
        });
        return json({
          authority: 'READ_ONLY_SUPERVISION',
          execution_mode: env.EXECUTION_MODE || 'AUTHORIZATION_ONLY',
          provider_invocation: 'DISABLED',
          count: events.length,
          events,
        });
      } catch {
        return json({ error: { code: 'OPS_SUPERVISION_UNAVAILABLE', message: 'OPS supervision store is unavailable.' } }, 503);
      }
    }

    if (url.pathname !== '/api/execution/dry-run') {
      return jspaceWorker.fetch(request, env, ctx);
    }

    if (request.method !== 'POST') {
      return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'The dry-run endpoint accepts POST only.' } }, 405, {
        allow: 'POST',
      });
    }

    const auth = authorizeOperator(request, env);
    if (auth) return auth;

    const maxBytes = positive(env.MAX_REQUEST_BYTES, 131072);
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      return json({ error: { code: 'REQUEST_TOO_LARGE', message: 'Request body exceeds the configured limit.' } }, 413);
    }
    if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
      return json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Request body must use application/json.' } }, 415);
    }

    let envelope;
    try {
      envelope = text ? JSON.parse(text) : {};
    } catch {
      return json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } }, 400);
    }

    const result = await executeGovernedDryRun(envelope, env);
    const receipt = createDryRunReceipt(result);
    const status = result.state === 'DRY_RUN_ACCEPTED' ? 200 : 403;
    return json({ ...result, dry_run_receipt: receipt }, status);
  },
};

function authorizeOperator(request, env) {
  if (!env.MCP_API_TOKEN) {
    return json({ error: { code: 'OPERATOR_TOKEN_NOT_CONFIGURED', message: 'Operator access is not configured.' } }, 503);
  }
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !constantEqual(token, env.MCP_API_TOKEN)) {
    return json({ error: { code: 'UNAUTHORIZED', message: 'A valid bearer token is required.' } }, 401, {
      'www-authenticate': 'Bearer',
    });
  }
  return null;
}

function constantEqual(left, right) {
  const a = new TextEncoder().encode(String(left));
  const b = new TextEncoder().encode(String(right));
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (a[index % a.length] || 0) ^ (b[index % b.length] || 0);
  }
  return diff === 0;
}

function positive(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function json(value, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}
