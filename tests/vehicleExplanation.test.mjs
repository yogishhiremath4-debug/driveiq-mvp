import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
let server;
let analyzeVehicleComponents;
let createVehicleExplanation;
let vehicleAnalysis;
let ComponentHealthCard;
let AlertCard;

before(async () => {
  server = await createServer({
    root: projectRoot,
    logLevel: 'silent',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  ({ analyzeVehicleComponents, vehicleAnalysis } = await server.ssrLoadModule('/src/data/vehicleAnalysis.ts'));
  ({ createVehicleExplanation } = await server.ssrLoadModule('/src/analysis/vehicleExplanation.ts'));
  ({ default: ComponentHealthCard } = await server.ssrLoadModule('/src/components/ComponentHealthCard.tsx'));
  ({ default: AlertCard } = await server.ssrLoadModule('/src/components/AlertCard.tsx'));
});

after(async () => {
  await server?.close();
});

function findComponent(name) {
  return vehicleAnalysis.outputs.vehicleHealth.components.find((component) => component.name === name);
}

function findRecommendedAction(name) {
  return vehicleAnalysis.outputs.vehicleAlerts.find((alert) => alert.component === name)?.recommendedAction;
}

test('explains Brake Pads 41% as Attention using owner-facing demo language', () => {
  const explanation = createVehicleExplanation(findComponent('Brake Pads'), findRecommendedAction('Brake Pads'));

  assert.equal(explanation.component, 'Brake Pads');
  assert.equal(explanation.status, 'Attention');
  assert.equal(explanation.whatWasDetected, 'The simulated condition seed for Brake Pads is 41%.');
  assert.match(explanation.whyItMatters, /deterministic demo rule.*Attention band/i);
  assert.match(explanation.recommendedAction, /^Consider .*brake inspection\/service/i);
  assert.ok(explanation.limitations.some((limitation) => /not a validated diagnosis/i.test(limitation)));
});

test('explains a Monitor component without escalating its status', () => {
  const explanation = createVehicleExplanation(findComponent('Battery'), findRecommendedAction('Battery'));

  assert.equal(explanation.status, 'Monitor');
  assert.equal(explanation.whatWasDetected, 'The simulated condition seed for Battery is 64%.');
  assert.match(explanation.whyItMatters, /Monitor band/i);
  assert.match(explanation.recommendedAction, /consider replacement within approximately 3,200 km/i);
});

test('explains a Healthy component without claiming a complete vehicle assessment', () => {
  const explanation = createVehicleExplanation(findComponent('Engine'));

  assert.equal(explanation.status, 'Healthy');
  assert.equal(explanation.whatWasDetected, 'The simulated condition seed for Engine is 88%.');
  assert.match(explanation.whyItMatters, /Healthy band/i);
  assert.match(explanation.whyItMatters, /not a complete vehicle assessment/i);
});

test('missing and invalid condition inputs produce Unavailable explanations', () => {
  const missing = analyzeVehicleComponents(
    [{ name: 'Brake Pads', health: 41, remainingKm: 1100 }],
    [],
  )[0];
  const invalid = analyzeVehicleComponents(
    [{ name: 'Brake Pads', health: 41, remainingKm: 1100 }],
    [{ inputId: 'invalid-demo-condition', component: 'Brake Pads', healthPercent: Number.NaN, remainingKm: 1100 }],
  )[0];

  for (const explanation of [createVehicleExplanation(missing), createVehicleExplanation(invalid)]) {
    assert.equal(explanation.status, 'Unavailable');
    assert.match(explanation.whatWasDetected, /condition data.*unavailable/i);
    assert.match(explanation.whyItMatters, /cannot assign a health category/i);
    assert.ok(explanation.limitations.some((limitation) => /no health claim/i.test(limitation)));
    assert.equal(explanation.evidence[0].value, null);
    assert.equal(explanation.evidence[0].unit, null);
  }

  assert.equal(missing.provenance.source.inputId, null);
  assert.equal(invalid.provenance.source.inputId, 'invalid-demo-condition');
});

test('explanation evidence matches actual analysis provenance and rule output', () => {
  const component = findComponent('Brake Pads');
  const explanation = createVehicleExplanation(component, findRecommendedAction('Brake Pads'));

  assert.deepEqual(explanation.evidence, [{
    kind: 'component-condition',
    sourceType: component.provenance.source.type,
    inputId: component.provenance.source.inputId,
    signalPath: component.provenance.source.signalPath,
    value: component.provenance.condition.value,
    unit: component.provenance.condition.unit,
    ruleId: component.provenance.rule.id,
    ruleVersion: component.provenance.rule.version,
    riskBand: component.provenance.riskBand,
  }]);
  assert.equal(explanation.status, component.provenance.status);
});

test('does not add unsupported evidence or a remaining-distance claim', () => {
  const explanation = createVehicleExplanation(findComponent('Brake Pads'), findRecommendedAction('Brake Pads'));

  assert.deepEqual(explanation.evidence.map(({ value, unit }) => [value, unit]), [[41, '%']]);
  assert.doesNotMatch(JSON.stringify(explanation), /1,100|temperature|braking frequency|failure probability|wear rate/i);
});

test('returns identical explanations for identical analyzed inputs', () => {
  const component = findComponent('Brake Pads');
  const action = findRecommendedAction('Brake Pads');
  const first = createVehicleExplanation(component, action);
  const second = createVehicleExplanation(component, action);

  assert.deepEqual(second, first);
});

test('includes Battery 3,200 km in evidence when the approved recommendation cites it', () => {
  const battery = findComponent('Battery');
  const explanation = createVehicleExplanation(battery, findRecommendedAction('Battery'));
  const distanceEvidence = explanation.evidence.find((item) => item.kind === 'recommendation-context');

  assert.deepEqual(distanceEvidence, {
    kind: 'recommendation-context',
    sourceType: 'simulated-condition-seed',
    inputId: 'demo-condition-battery',
    signalPath: 'scenarioOutputs.componentConditions[].remainingKm',
    value: 3200,
    unit: 'km',
    ruleId: null,
    ruleVersion: null,
    riskBand: null,
  });

  const batteryCard = renderToStaticMarkup(createElement(ComponentHealthCard, {
    component: battery,
    recommendedAction: findRecommendedAction('Battery'),
  }));
  assert.match(batteryCard, /3,200 km/);
});

test('renders invalid NaN health as Unavailable in component and alert cards', () => {
  const invalidComponent = analyzeVehicleComponents(
    [{ name: 'Brake Pads', health: 41, remainingKm: 1100 }],
    [{ inputId: 'invalid-demo-condition', component: 'Brake Pads', healthPercent: Number.NaN, remainingKm: 1100 }],
  )[0];
  const componentMarkup = renderToStaticMarkup(createElement(ComponentHealthCard, { component: invalidComponent }));
  const alertMarkup = renderToStaticMarkup(createElement(AlertCard, {
    alert: {
      id: 'brake-pads',
      component: 'Brake Pads',
      priority: 'Unavailable',
      health: Number.NaN,
      remainingKm: null,
      explanation: 'Condition data is unavailable.',
      recommendedAction: 'No action can be suggested until valid data is available.',
    },
    rank: 1,
  }));

  assert.match(componentMarkup, /Unavailable/);
  assert.match(alertMarkup, /Unavailable/);
  assert.doesNotMatch(componentMarkup, /NaN%/);
  assert.doesNotMatch(alertMarkup, /NaN%/);
});