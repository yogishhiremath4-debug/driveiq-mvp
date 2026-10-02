import { simulatedVehicleData } from './simulatedVehicleData';

export type VehicleComponent = {
  name: string;
  health: number | null;
  remainingKm: number | string | null;
};

const componentNames = ['Brake Pads', 'Cooling System', 'Battery', 'Tyres', 'Engine', 'Fuel System'] as const;
const conditionSeeds = new Map(
  simulatedVehicleData.scenarioOutputs.componentConditions.map((condition) => [condition.component, condition]),
);

export const vehicleHealth = {
  summary: {
    score: 82,
    status: 'Good',
    rangeBeforeCheckKm: 1240,
    predictedMileageRecovery: 9,
    componentsFlagged: 2,
  },
  components: componentNames.map((name) => {
    const condition = conditionSeeds.get(name);

    return {
      name,
      health: condition?.healthPercent ?? null,
      remainingKm: condition?.remainingKm ?? null,
    } satisfies VehicleComponent;
  }),
};