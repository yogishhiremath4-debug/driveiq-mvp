export const riskRuleId = 'component-health-percent-bands';
export const riskRuleVersion = 'demo-health-risk-v1';

export function evaluateComponentHealth(healthPercent) {
  let status;

  if (
    typeof healthPercent !== 'number'
    || !Number.isFinite(healthPercent)
    || healthPercent < 0
    || healthPercent > 100
  ) {
    status = 'Unavailable';
  } else if (healthPercent < 60) {
    status = 'Attention';
  } else if (healthPercent < 80) {
    status = 'Monitor';
  } else {
    status = 'Healthy';
  }

  return {
    riskBand: status,
    status,
    ruleId: riskRuleId,
    ruleVersion: riskRuleVersion,
  };
}

export function classifyComponentHealth(healthPercent) {
  return evaluateComponentHealth(healthPercent).status;
}

export function countFlaggedComponents(components) {
  return components.reduce(
    (count, component) => count + Number(classifyComponentHealth(component.health) === 'Attention'),
    0,
  );
}