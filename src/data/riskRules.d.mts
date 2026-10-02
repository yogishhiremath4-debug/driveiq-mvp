export type RiskStatus = 'Attention' | 'Monitor' | 'Healthy' | 'Unavailable';

export const riskRuleId: string;
export const riskRuleVersion: string;
export function evaluateComponentHealth(healthPercent: unknown): {
	riskBand: RiskStatus;
	status: RiskStatus;
	ruleId: string;
	ruleVersion: string;
};
export function classifyComponentHealth(healthPercent: unknown): RiskStatus;
export function countFlaggedComponents(components: ReadonlyArray<{ health: unknown }>): number;