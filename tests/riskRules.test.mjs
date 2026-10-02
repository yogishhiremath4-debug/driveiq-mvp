import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';
import { classifyComponentHealth, countFlaggedComponents, evaluateComponentHealth, riskRuleId, riskRuleVersion } from '../src/data/riskRules.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

test('classifies the approved risk bands at boundaries', () => {
  assert.equal(classifyComponentHealth(0), 'Attention');
  assert.equal(classifyComponentHealth(59), 'Attention');
  assert.equal(classifyComponentHealth(60), 'Monitor');
  assert.equal(classifyComponentHealth(79), 'Monitor');
  assert.equal(classifyComponentHealth(80), 'Healthy');
  assert.equal(classifyComponentHealth(100), 'Healthy');
});

test('returns unavailable for missing and invalid health values', () => {
  for (const value of [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1, 101, '64']) {
    assert.equal(classifyComponentHealth(value), 'Unavailable');
  }
});

test('returns the rule identity and version with a risk result', () => {
  assert.deepEqual(evaluateComponentHealth(41), {
    riskBand: 'Attention',
    status: 'Attention',
    ruleId: 'component-health-percent-bands',
    ruleVersion: 'demo-health-risk-v1',
  });
  assert.equal(riskRuleId, 'component-health-percent-bands');
});

test('counts only Attention components as flagged', () => {
  const components = [
    { health: 41 },
    { health: 58 },
    { health: 64 },
    { health: 73 },
    { health: 88 },
    { health: null },
  ];

  assert.equal(countFlaggedComponents(components), 2);
});

test('uses a versioned deterministic rule for the approved component fixture', () => {
  const healthValues = [41, 58, 64, 73, 88, 90];
  const expectedStatuses = ['Attention', 'Attention', 'Monitor', 'Monitor', 'Healthy', 'Healthy'];

  assert.equal(riskRuleVersion, 'demo-health-risk-v1');
  assert.deepEqual(healthValues.map(classifyComponentHealth), expectedStatuses);
  assert.deepEqual(healthValues.map(classifyComponentHealth), expectedStatuses);
});

test('actual analysis output preserves provenance, approved baseline, and determinism', async () => {
  const server = await createServer({
    root: projectRoot,
    logLevel: 'silent',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const { vehicleAnalysis } = await server.ssrLoadModule('/src/data/vehicleAnalysis.ts');
    const { summary, components } = vehicleAnalysis.outputs.vehicleHealth;

    assert.deepEqual(summary, {
      score: 82,
      status: 'Good',
      rangeBeforeCheckKm: 1240,
      predictedMileageRecovery: 9,
      componentsFlagged: 2,
    });
    assert.deepEqual(
      components.map(({ name, health, remainingKm, riskStatus }) => [name, health, remainingKm, riskStatus]),
      [
        ['Brake Pads', 41, 1100, 'Attention'],
        ['Cooling System', 58, 4000, 'Attention'],
        ['Battery', 64, 3200, 'Monitor'],
        ['Tyres', 73, 6400, 'Monitor'],
        ['Engine', 88, 18500, 'Healthy'],
        ['Fuel System', 90, '20,000+', 'Healthy'],
      ],
    );
    assert.deepEqual(
      components.map(({ provenance }) => [
        provenance.component,
        provenance.source.type,
        provenance.source.inputId,
        provenance.condition.value,
        provenance.condition.unit,
        provenance.rule.id,
        provenance.rule.version,
        provenance.riskBand,
        provenance.status,
      ]),
      [
        ['Brake Pads', 'simulated-condition-seed', 'demo-condition-brake-pads', 41, '%', riskRuleId, riskRuleVersion, 'Attention', 'Attention'],
        ['Cooling System', 'simulated-condition-seed', 'demo-condition-cooling-system', 58, '%', riskRuleId, riskRuleVersion, 'Attention', 'Attention'],
        ['Battery', 'simulated-condition-seed', 'demo-condition-battery', 64, '%', riskRuleId, riskRuleVersion, 'Monitor', 'Monitor'],
        ['Tyres', 'simulated-condition-seed', 'demo-condition-tyres', 73, '%', riskRuleId, riskRuleVersion, 'Monitor', 'Monitor'],
        ['Engine', 'simulated-condition-seed', 'demo-condition-engine', 88, '%', riskRuleId, riskRuleVersion, 'Healthy', 'Healthy'],
        ['Fuel System', 'simulated-condition-seed', 'demo-condition-fuel-system', 90, '%', riskRuleId, riskRuleVersion, 'Healthy', 'Healthy'],
      ],
    );
    assert.deepEqual(components[0].provenance, {
      component: 'Brake Pads',
      source: {
        type: 'simulated-condition-seed',
        inputId: 'demo-condition-brake-pads',
        signalPath: 'scenarioOutputs.componentConditions[].healthPercent',
      },
      condition: { value: 41, unit: '%' },
      rule: { id: riskRuleId, version: riskRuleVersion },
      riskBand: 'Attention',
      status: 'Attention',
    });

    const mileageShares = vehicleAnalysis.outputs.mileageInsights.causes.map(({ percentage }) => percentage);
    assert.deepEqual(mileageShares, [32, 24, 20, 14, 10]);
    assert.equal(mileageShares.reduce((total, share) => total + share, 0), 100);
    assert.deepEqual(
      vehicleAnalysis.outputs.serviceComparison.metrics.map(({ label, before, after }) => [label, before.value, after.value]),
      [
        ['Mileage', '13.2', '14.6'],
        ['Engine health', '71', '92'],
        ['Brake pad life', '41', '100'],
        ['Battery health', '64', '66'],
        ['Risk flags', '3', '1'],
      ],
    );
    assert.deepEqual(
      vehicleAnalysis.outputs.vehicleAlerts.map(({ component, health, priority, remainingKm }) => [component, health, priority, remainingKm]),
      [
        ['Brake Pads', 41, 'Attention', 'Approximately 1,100 km'],
        ['Cooling System', 58, 'Attention', 'Approximately 4,000 km'],
        ['Battery', 64, 'Monitor', 'Approximately 3,200 km'],
        ['Tyres', 73, 'Monitor', 'Approximately 6,400 km'],
      ],
    );

    const { analyzeVehicleComponents } = await server.ssrLoadModule('/src/data/vehicleAnalysis.ts');
    const missingCondition = analyzeVehicleComponents(
      [{ name: 'Brake Pads', health: 41, remainingKm: 1100 }],
      [],
    )[0];

    assert.equal(missingCondition.health, null);
    assert.equal(missingCondition.remainingKm, null);
    assert.equal(missingCondition.riskStatus, 'Unavailable');
    assert.deepEqual(missingCondition.provenance.source, {
      type: 'missing',
      inputId: null,
      signalPath: 'scenarioOutputs.componentConditions[].healthPercent',
    });
    assert.deepEqual(missingCondition.provenance.condition, { value: null, unit: '%' });

    const componentInputs = components.map(({ name }) => ({ name, health: null, remainingKm: null }));
    const conditionSeeds = vehicleAnalysis.input.scenarioOutputs.componentConditions;
    const firstRun = analyzeVehicleComponents(componentInputs, conditionSeeds);
    const secondRun = analyzeVehicleComponents(componentInputs, conditionSeeds);

    assert.deepEqual(firstRun, components);
    assert.deepEqual(secondRun, firstRun);
  } finally {
    await server.close();
  }
});