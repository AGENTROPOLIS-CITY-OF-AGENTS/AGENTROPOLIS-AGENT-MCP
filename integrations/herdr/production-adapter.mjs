import { HerdrAdapter } from './adapter.mjs';
import { assertManagedHerdrSession, verifyManagedHerdrSession } from './session-context.mjs';
import { verifyOmarchyHerdrEvidence } from './omarchy-host-profile.mjs';

export class GovernedHerdrRuntime {
  constructor(options = {}) {
    this.adapter = options.adapter ?? new HerdrAdapter(options);
    this.env = options.env ?? process.env;
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
    return verifyOmarchyHerdrEvidence({
      runner: this.adapter.runner,
      env: this.env,
      machineProfile,
      missionId,
      ...options
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
