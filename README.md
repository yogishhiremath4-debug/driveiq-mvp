# DriveIQ Web Prototype

DriveIQ MVP web prototype with simulated vehicle health, mileage, service comparison, and alerts. All vehicle readings and analysis outputs are demo data; the application is not connected to a real vehicle.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

## Verify a production build

```powershell
npm run build
```

## Prototype boundary

The prototype has no real sensor integration, backend, database, authentication, or predictive model. Existing health, mileage, service, and alert values remain approved static demo outputs.

## Simulated data flow

```text
simulatedVehicleData.ts (static signals + scenario condition seeds)
	↓
vehicleAnalysis.ts
  - condition seed pass-through
	- deterministic risk bands and flagged count with per-component provenance
  - approved health/mileage/service fixtures
	↓
UI components
	↓
automated risk-rule tests
```

The simulated snapshot represents OBD-II/ECU, IMU, battery, TPMS, fuel-efficiency, vehicle, and service fields. Scenario condition seeds remain explicit demo values. Only the Attention/Monitor/Healthy bands and Attention count are calculated. Overall health weighting and mileage attribution remain approved fixtures; they are not derived from the signals.
