export type ServiceMetricValue = {
  value: string;
  unit?: string;
  context?: string;
};

export type ServiceMetric = {
  id: string;
  label: string;
  before: ServiceMetricValue;
  after: ServiceMetricValue;
  result: 'improved' | 'attention';
  resultLabel: string;
};

export const serviceComparison = {
  demoLabel: 'Simulated service data',
  disclaimer: 'Demo comparison only. No real service record or live vehicle data is connected.',
  milestones: [
    {
      stage: 'Before service',
      prompt: 'What was wrong?',
      detail: 'Mileage was below baseline, brake pad life was low, and three risk flags were active.',
    },
    {
      stage: 'Service',
      prompt: 'What was addressed?',
      detail: 'Brake pads are marked as replaced in this simulated comparison.',
    },
    {
      stage: 'After service',
      prompt: 'What improved?',
      detail: 'Mileage and engine health increased, brake life was restored, and risk flags decreased.',
    },
    {
      stage: 'Remaining issue',
      prompt: 'What still needs attention?',
      detail: 'The battery did not materially improve and remains outside the service scope.',
    },
  ],
  metrics: [
    {
      id: 'mileage',
      label: 'Mileage',
      before: { value: '13.2', unit: 'km/l', context: '-14% vs baseline' },
      after: { value: '14.6', unit: 'km/l', context: '+10.6% recovery' },
      result: 'improved',
      resultLabel: 'Improved',
    },
    {
      id: 'engine',
      label: 'Engine health',
      before: { value: '71', unit: '%' },
      after: { value: '92', unit: '%' },
      result: 'improved',
      resultLabel: 'Improved',
    },
    {
      id: 'brake-pads',
      label: 'Brake pad life',
      before: { value: '41', unit: '%', context: 'Life remaining' },
      after: { value: '100', unit: '%', context: 'Replaced' },
      result: 'improved',
      resultLabel: 'Replaced',
    },
    {
      id: 'battery',
      label: 'Battery health',
      before: { value: '64', unit: '%' },
      after: { value: '66', unit: '%' },
      result: 'attention',
      resultLabel: 'Still needs attention',
    },
    {
      id: 'risk-flags',
      label: 'Risk flags',
      before: { value: '3', context: 'Active flags' },
      after: { value: '1', context: 'Active flags' },
      result: 'improved',
      resultLabel: 'Reduced',
    },
  ] satisfies ServiceMetric[],
  batteryIssue: {
    metricId: 'battery',
    cause: 'Ageing cell',
    coverage: 'The battery was not covered by the service.',
    explanation: 'Battery health changed only slightly, so it did not materially improve in this demo comparison.',
    recommendedAction: 'Monitor battery condition and consider replacement within approximately 3,200 km.',
  },
};