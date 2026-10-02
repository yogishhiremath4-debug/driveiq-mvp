import { mileageInsights } from './mileageInsights';
import { vehicleHealth } from './mockVehicleData';
import { countFlaggedComponents, evaluateComponentHealth, riskRuleId, riskRuleVersion } from './riskRules.mjs';
import { serviceComparison } from './serviceComparison';
import { simulatedVehicleData } from './simulatedVehicleData';
import { vehicleAlertDefinitions } from './vehicleAlerts';
import type { VehicleComponent } from './mockVehicleData';
import type { RiskStatus } from './riskRules.mjs';
import type { VehicleAlert } from './vehicleAlerts';

export type AnalyzedVehicleComponent = VehicleComponent & {
  riskStatus: RiskStatus;
  provenance: {
    component: string;
    source: {
      type: 'simulated-condition-seed' | 'missing';
      inputId: string | null;
      signalPath: string;
    };
    condition: {
      value: number | null;
      unit: '%';
    };
    rule: {
      id: string;
      version: string;
    };
    riskBand: RiskStatus;
    status: RiskStatus;
  };
};

type ComponentConditionSeed = typeof simulatedVehicleData.scenarioOutputs.componentConditions[number];

export function analyzeVehicleComponents(
  components: readonly VehicleComponent[],
  conditionSeeds: readonly ComponentConditionSeed[],
): AnalyzedVehicleComponent[] {
  const conditionSeedsByName = new Map<string, ComponentConditionSeed>(
    conditionSeeds.map((condition) => [condition.component, condition]),
  );

  return components.map((component) => {
    const condition = conditionSeedsByName.get(component.name);
    const health = condition?.healthPercent ?? null;
    const riskEvaluation = evaluateComponentHealth(health);

    return {
      ...component,
      health,
      remainingKm: condition?.remainingKm ?? null,
      riskStatus: riskEvaluation.status,
      provenance: {
        component: component.name,
        source: {
          type: condition ? 'simulated-condition-seed' : 'missing',
          inputId: condition?.inputId ?? null,
          signalPath: 'scenarioOutputs.componentConditions[].healthPercent',
        },
        condition: {
          value: health,
          unit: '%',
        },
        rule: {
          id: riskEvaluation.ruleId,
          version: riskEvaluation.ruleVersion,
        },
        riskBand: riskEvaluation.riskBand,
        status: riskEvaluation.status,
      },
    };
  });
}

const analyzedComponents = analyzeVehicleComponents(
  vehicleHealth.components,
  simulatedVehicleData.scenarioOutputs.componentConditions,
);

const componentsByName = new Map(analyzedComponents.map((component) => [component.name, component]));

const analyzedAlerts: VehicleAlert[] = vehicleAlertDefinitions.map((definition) => {
  const component = componentsByName.get(definition.componentName);
  const remainingKm = component?.remainingKm;
  const formattedRemaining = typeof remainingKm === 'number'
    ? remainingKm.toLocaleString()
    : remainingKm;

  return {
    id: definition.id,
    component: definition.componentName,
    priority: component?.riskStatus ?? 'Unavailable',
    health: component?.health ?? null,
    remainingKm: formattedRemaining === null || formattedRemaining === undefined
      ? null
      : `Approximately ${formattedRemaining} km`,
    explanation: definition.explanation,
    recommendedAction: definition.recommendedAction,
  };
});

const riskSummary = {
  componentsFlagged: countFlaggedComponents(analyzedComponents),
  provenance: {
    inputIds: analyzedComponents
      .map((component) => component.provenance.source.inputId)
      .filter((inputId): inputId is string => inputId !== null),
    ruleId: riskRuleId,
    ruleVersion: riskRuleVersion,
  },
};

export const vehicleAnalysis = {
  status: 'simulated',
  input: simulatedVehicleData,
  metadata: {
    ruleVersion: riskRuleVersion,
    outputSource: 'Approved demo fixtures plus deterministic risk bands',
  },
  notice: 'Condition values are simulated seeds. Only risk labels and flagged count are calculated; other approved outputs remain fixtures.',
  outputs: {
    vehicleHealth: {
      summary: {
        ...vehicleHealth.summary,
        componentsFlagged: riskSummary.componentsFlagged,
      },
      components: analyzedComponents,
    },
    riskSummary,
    mileageInsights,
    serviceComparison,
    vehicleAlerts: analyzedAlerts,
  },
};