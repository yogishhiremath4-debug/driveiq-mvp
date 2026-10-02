export const simulatedVehicleData = {
  metadata: {
    status: 'simulated',
    label: 'Simulated vehicle data',
    recordedAt: '2026-09-15T08:30:00.000Z',
    notice: 'Vehicle data is simulated for this prototype. No real vehicle is connected.',
  },
  vehicle: {
    vehicleId: 'DRIVEIQ-DEMO-001',
    mileageKm: 48250,
    operatingState: 'idling',
  },
  obdEcu: {
    source: 'OBD-II / ECU (simulated)',
    engineTemperatureC: 89,
    rpm: 820,
    loadPercent: 21,
  },
  imu: {
    source: 'IMU / accelerometer (simulated)',
    accelerationPattern: 'Mostly steady with occasional stronger acceleration.',
    brakingPattern: 'Frequent stop-start braking in this demo snapshot.',
    averageSpeedKph: 32,
  },
  battery: {
    source: 'Battery information (simulated)',
    voltageV: 12.5,
    temperatureC: 28,
    conditionSignal: 'Simulated ageing-cell input; not a diagnosis.',
  },
  tyres: {
    source: 'TPMS / tyre pressure (simulated)',
    pressuresPsi: {
      frontLeft: 32,
      frontRight: 32,
      rearLeft: 31,
      rearRight: 31,
    },
    conditionSignal: 'Simulated pressure values only; no diagnostic threshold is applied.',
  },
  fuelEfficiency: {
    source: 'Fuel efficiency (simulated)',
    currentMileage: 14.6,
    baselineMileage: 13.2,
    unit: 'km/l',
  },
  service: {
    source: 'Service information (simulated)',
    state: 'comparison-only demo snapshot',
    lastServiceDate: '2026-09-15',
    snapshot: {
      brakePads: 'marked as replaced in demo comparison',
      battery: 'not covered in demo comparison',
    },
  },
  scenarioOutputs: {
    componentConditions: [
      { inputId: 'demo-condition-brake-pads', component: 'Brake Pads', healthPercent: 41, remainingKm: 1100 },
      { inputId: 'demo-condition-cooling-system', component: 'Cooling System', healthPercent: 58, remainingKm: 4000 },
      { inputId: 'demo-condition-battery', component: 'Battery', healthPercent: 64, remainingKm: 3200 },
      { inputId: 'demo-condition-tyres', component: 'Tyres', healthPercent: 73, remainingKm: 6400 },
      { inputId: 'demo-condition-engine', component: 'Engine', healthPercent: 88, remainingKm: 18500 },
      { inputId: 'demo-condition-fuel-system', component: 'Fuel System', healthPercent: 90, remainingKm: '20,000+' },
    ],
  },
} as const;