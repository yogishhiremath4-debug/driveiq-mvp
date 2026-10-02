import type { AnalyzedVehicleComponent } from '../data/vehicleAnalysis';

export type VehicleExplanation = {
  component: string;
  status: AnalyzedVehicleComponent['riskStatus'];
  whatWasDetected: string;
  whyItMatters: string;
  evidence: Array<{
    kind: 'component-condition' | 'recommendation-context';
    sourceType: AnalyzedVehicleComponent['provenance']['source']['type'];
    inputId: string | null;
    signalPath: string;
    value: number | null;
    unit: string | null;
    ruleId: string | null;
    ruleVersion: string | null;
    riskBand: AnalyzedVehicleComponent['provenance']['riskBand'] | null;
  }>;
  recommendedAction: string;
  limitations: string[];
};

function isValidCondition(value: number | null): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= 100;
}

function getWhyItMatters(status: VehicleExplanation['status']) {
  switch (status) {
    case 'Attention':
      return 'The deterministic demo rule placed this supplied value in the Attention band. This is not confirmation of a mechanical fault.';
    case 'Monitor':
      return 'The deterministic demo rule placed this supplied value in the Monitor band. It is a prototype status, not a diagnosis.';
    case 'Healthy':
      return 'The deterministic demo rule placed this supplied value in the Healthy band. This is not a complete vehicle assessment.';
    case 'Unavailable':
      return 'The rule cannot assign a health category because a valid condition value or its provenance is unavailable.';
  }
}

function getDefaultAction(status: VehicleExplanation['status']) {
  switch (status) {
    case 'Attention':
      return 'Consider reviewing this component; this simulated status is not a mandatory safety instruction.';
    case 'Monitor':
      return 'Consider monitoring this component during routine maintenance.';
    case 'Healthy':
      return 'No component-specific action is suggested by this demo status.';
    case 'Unavailable':
      return 'No action can be suggested until valid condition evidence is available.';
  }
}

export function createVehicleExplanation(
  component: AnalyzedVehicleComponent,
  approvedRecommendedAction?: string,
): VehicleExplanation {
  const { provenance } = component;
  const conditionValue = isValidCondition(provenance.condition.value)
    ? provenance.condition.value
    : null;
  const hasEvidence = provenance.source.type === 'simulated-condition-seed'
    && provenance.source.inputId !== null
    && conditionValue !== null
    && component.riskStatus !== 'Unavailable';
  const status = hasEvidence ? component.riskStatus : 'Unavailable';
  const evidence: VehicleExplanation['evidence'] = [{
    kind: 'component-condition' as const,
    sourceType: provenance.source.type,
    inputId: provenance.source.inputId,
    signalPath: provenance.source.signalPath,
    value: conditionValue,
    unit: conditionValue === null ? null : provenance.condition.unit,
    ruleId: provenance.rule.id,
    ruleVersion: provenance.rule.version,
    riskBand: provenance.riskBand,
  }];
  const remainingKm = component.remainingKm;
  const formattedRemainingKm = typeof remainingKm === 'number' && Number.isFinite(remainingKm)
    ? remainingKm.toLocaleString()
    : null;

  if (
    hasEvidence
    && provenance.source.inputId
    && typeof remainingKm === 'number'
    && Number.isFinite(remainingKm)
    && formattedRemainingKm
    && approvedRecommendedAction?.includes(`${formattedRemainingKm} km`)
  ) {
    evidence.push({
      kind: 'recommendation-context',
      sourceType: provenance.source.type,
      inputId: provenance.source.inputId,
      signalPath: provenance.source.signalPath.replace('healthPercent', 'remainingKm'),
      value: remainingKm,
      unit: 'km',
      ruleId: null,
      ruleVersion: null,
      riskBand: null,
    });
  }

  return {
    component: provenance.component,
    status,
    whatWasDetected: hasEvidence
      ? `The simulated condition seed for ${provenance.component} is ${conditionValue}${provenance.condition.unit}.`
      : `Sufficient valid condition data for ${provenance.component} is unavailable.`,
    whyItMatters: getWhyItMatters(status),
    evidence,
    recommendedAction: hasEvidence && approvedRecommendedAction
      ? approvedRecommendedAction
      : getDefaultAction(status),
    limitations: [
      'Condition data is simulated for this prototype, not live vehicle telemetry.',
      'The status comes from a deterministic demo rule, not a validated diagnosis or AI prediction.',
      ...(!hasEvidence ? ['A valid condition value and source are unavailable; no health claim is made.'] : []),
    ],
  };
}