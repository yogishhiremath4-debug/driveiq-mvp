export type MileageCause = {
  cause: string;
  percentage: number;
  explanation: string;
  recommendedAction: string;
};

export const mileageInsights = {
  recoveryOpportunityPercent: 9,
  headline: 'Several factors may be affecting your mileage',
  analysisLabel: 'Simulated demo analysis',
  disclaimer: 'Illustrative prototype logic only. No live vehicle signals or validated AI predictions are used.',
  causes: [
    {
      cause: 'Driving behaviour',
      percentage: 32,
      explanation: 'Frequent acceleration and braking patterns may increase fuel consumption.',
      recommendedAction: 'Use smoother acceleration and braking.',
    },
    {
      cause: 'Tyre under-inflation',
      percentage: 24,
      explanation: 'Lower tyre pressure can increase rolling resistance and reduce efficiency.',
      recommendedAction: 'Check and correct tyre pressure.',
    },
    {
      cause: 'Engine wear / carbon build-up',
      percentage: 20,
      explanation: 'Engine condition may contribute to reduced combustion efficiency.',
      recommendedAction: 'Consider inspection during the next service.',
    },
    {
      cause: 'Fuel-system inefficiency',
      percentage: 14,
      explanation: 'Fuel delivery or combustion efficiency may be contributing to mileage loss.',
      recommendedAction: 'Request a fuel-system inspection during service.',
    },
    {
      cause: 'AC / electrical load',
      percentage: 10,
      explanation: 'Higher accessory and air-conditioning load can increase energy consumption.',
      recommendedAction: 'Review AC and accessory usage if appropriate.',
    },
  ] satisfies MileageCause[],
};