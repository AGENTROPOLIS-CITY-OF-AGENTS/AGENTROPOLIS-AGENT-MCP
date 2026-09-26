import { HerdrAdapter, HerdrAdapterError } from './adapter.mjs';
import { assertManagedHerdrSession, verifyManagedHerdrSession } from './session-context.mjs';
import { verifyOmarchyHerdrEvidence, DEFAULT_MAX_MACHINE_PROFILE_AGE_MS } from './omarchy-host-profile.mjs';

const OMARCHY_VERIFY_OPTIONS = Object.freeze([]);

function freezeIssuers(issuers) {
  const out = {};
  for (const [issuer, keys] of Object.entries(issuers ?? {})) {
    out[issuer] = Object.freeze({ ...keys });
  }
  return Object.freeze(out);
}

export class GovernedHerdrRuntime {
  constructor(options = {}) {
    this.adapter = options.adapter ?? new HerdrAdapter(options);
    this.env = options.env ?? process.env;
    this.trustedIssuers = freezeIssuers(options.trustedIssuers);
    this.clock = typeof options.clock === 'function' ? options.clock : () => new Date();
    this.maxMachineProfileAgeMs = options.maxMachineProfileAgeMs ?? DEFAULT_MAX_MACHINE_PROFILE_AGE_MS;
  }

  get contract() { return this.adapter.contract; }
  get runner() { return this.adapter.runner; }

  detect() { return this.adapter.detect(); }
  listAgents() { return this.adapter.listAgents(); }
  inspectSessions() { return this.adapter.inspectSessions(); }
  listPanes(workspaceId) { return this.adapter.listPanes(workspaceId); }
  readAgent(agentName, options) { return this.adapter.readAgent(agentName, options); }
  readPane(paneId, options) { return this.adapter.readPane(paneId, options); }
  waitAgent(agentName, options) { return this.adapter.waitAgent(agentName, options); }
  waitPane(paneId, options) { return this.adapter.waitPane(paneId, options); }

  verifyContext() {
    return verifyManagedHerdrSession({ runner: this.adapter.runner, env: this.env });
  }

  verifyOmarchyHost(machineProfile, missionId, options = {}) {
    if (options === null || typeof options !== 'object' || Array.isArray(options)) {
      throw new TypeError('options must be an object');
    }
    const forbidden = Object.keys(options).filter((key) => !OMARCHY_VERIFY_OPTIONS.includes(key));
    if (forbidden.length > 0) {
      throw new HerdrAdapterError('OMARCHY_OPTION_FORBIDDEN', 'verifyOmarchyHost does not accept caller overrides of runtime-owned verification inputs', {
        forbidden: forbidden.sort()
      });
    }
    return verifyOmarchyHerdrEvidence({
      runner: this.adapter.runner,
      env: this.env,
      trustedIssuers: this.trustedIssuers,
      now: this.clock(),
      maxMachineProfileAgeMs: this.maxMachineProfileAgeMs,
      machineProfile,
      missionId
    });
  }

  promptAgent(agentName, prompt, options = {}) {
    const context = assertManagedHerdrSession(this.env);
    return this.adapter.promptAgent(agentName, prompt, { ...options, context });
  }

  spawnAgent(options = {}) {
    const context = assertManagedHerdrSession(this.env);
    return this.adapter.spawnAgent({ ...options, context });
  }

  runPane(paneId, command, options = {}) {
    const context = assertManagedHerdrSession(this.env);
    return this.adapter.runPane(paneId, command, { ...options, context });
  }
}

export function createGovernedHerdrRuntime(options = {}) {
  return new GovernedHerdrRuntime(options);
}
