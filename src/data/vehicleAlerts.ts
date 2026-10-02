import { serviceComparison } from './serviceComparison';
import type { RiskStatus } from './riskRules.mjs';

export type AlertPriority = RiskStatus;

export type VehicleAlert = {
  id: string;
  component: string;
  priority: AlertPriority;
  health: number | null;
  remainingKm: string | null;
  explanation: string;
  recommendedAction: string;
};

export type VehicleAlertDefinition = Omit<VehicleAlert, 'component' | 'priority' | 'health' | 'remainingKm'> & {
  componentName: string;
};

export const vehicleAlertDefinitions: VehicleAlertDefinition[] = [
  {
    id: 'brake-pads',
    componentName: 'Brake Pads',
    explanation: 'Brake pad life is lower than the other monitored components in this demo vehicle profile.',
    recommendedAction: 'Consider a brake inspection/service before the estimated remaining life is reached.',
  },
  {
    id: 'cooling-system',
    componentName: 'Cooling System',
    explanation: 'The cooling system is showing a lower health value in the simulated vehicle profile.',
    recommendedAction: 'Consider a cooling-system inspection during the next service.',
  },
  {
    id: 'battery',
    componentName: 'Battery',
    explanation: `The service comparison indicates that the battery did not materially improve and has a simulated ${serviceComparison.batteryIssue.cause.toLowerCase()} issue.`,
    recommendedAction: serviceComparison.batteryIssue.recommendedAction,
  },
  {
    id: 'tyres',
    componentName: 'Tyres',
    explanation: 'The simulated vehicle profile indicates that tyre condition may contribute to reduced efficiency.',
    recommendedAction: 'Check tyre condition and pressure during routine maintenance.',
  },
];
