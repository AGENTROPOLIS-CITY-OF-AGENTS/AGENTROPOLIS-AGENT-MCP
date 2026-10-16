import test from 'node:test';
import assert from 'node:assert/strict';
import { runSimulationScenario, simulationRuntimeProfile } from '../src/core.js';

test('simulation runtime is advisory only',()=>{
  const p=simulationRuntimeProfile();
  assert.equal(p.authority,'ADVISORY_ONLY');
  assert.ok(p.invariants.includes('simulation_output_never_becomes_observed_fact_automatically'));
});

test('simulation is deterministic for the same seed',()=>{
  const input={scenarioId:'demo',purpose:'bounded test',populationSize:100,runs:50,seed:589,baselineProbability:0.4,shock:0.1};
  const a=runSimulationScenario(input);
  const b=runSimulationScenario(input);
  assert.deepEqual(a.distribution,b.distribution);
  assert.equal(a.label,'HYPOTHESIS');
  assert.equal(a.epistemicType,'simulation_outcome');
  assert.equal(a.policy.observedFactPromotion,'DENY');
  assert.equal(a.policy.executionAuthority,'NONE');
});

test('simulation rejects unsafe scale',()=>{
  assert.throws(()=>runSimulationScenario({scenarioId:'x',purpose:'x',populationSize:100001,runs:10,seed:1,baselineProbability:0.5}),/populationSize/);
});
