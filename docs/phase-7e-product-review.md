# Phase 7E: Product Review / Implementation Audit

**Review scope:** Phase 7 analysis layer and its existing UI/test path  
**Code changes:** None

## Current architecture and data flow

```text
simulatedVehicleData.ts
  static telemetry-like fields + explicit scenario condition seeds
        ↓
vehicleAnalysis.ts / analyzeVehicleComponents
  match condition seed by component name
        ↓
riskRules.mjs
  deterministic health-percentage band
        ↓
AnalyzedVehicleComponent
  health + riskStatus + structured provenance
        ↓
App.tsx → ComponentHealthCard / AlertCard
```

`vehicleAnalysis.ts` also passes through the approved mileage, service, and alert content. It combines the seeded overall-health summary with a calculated Attention count. The UI reads the analysis output, displays statuses and simulated-data notices, but does not currently display the detailed provenance object.

## What is implemented

- A fixed simulated snapshot includes vehicle, OBD-II/ECU, IMU, battery, tyre-pressure, fuel-efficiency, and service context.
- Explicit `scenarioOutputs.componentConditions` seeds supply the six approved component health and remaining-distance values.
- `analyzeVehicleComponents` maps seeds to component outputs and records component, source type/ID/path, condition value/unit, rule ID/version, risk band, and status.
- `evaluateComponentHealth` applies the deterministic demo bands: 0–59 Attention, 60–79 Monitor, 80–100 Healthy; invalid or missing values return Unavailable.
- The flagged count counts only Attention components. The existing baseline produces two.
- Mileage attribution, overall score/status/range/recovery, service comparison, and remaining-kilometre estimates remain approved fixtures; they are not calculated from telemetry.

## What is simulated and deterministic

All signals and condition seeds are static demo data. The rule maps a supplied health percentage to a status; it does not infer the percentage from OBD, IMU, battery, or tyre signals. Given the same component inputs and condition seeds, `analyzeVehicleComponents` returns the same output. There are no live vehicle connections, timers, polling, or network calls in this analysis path.

The six baseline condition seeds remain Brake Pads 41%, Cooling System 58%, Battery 64%, Tyres 73%, Engine 88%, and Fuel System 90%. The approved overall fixture remains 82/100 Good with 2 flagged components.

## What is not real AI/ML

There is no trained model, inference service, learned attribution, or validated predictive accuracy. Risk bands are transparent threshold rules. Health values, remaining life, mileage attribution, overall score, and service comparisons are demo fixtures. These outputs must not be represented as validated diagnostics or predictions.

## Explainability assessment

The analysis output can explain the current rule path. For example, Brake Pads uses `demo-condition-brake-pads` at `scenarioOutputs.componentConditions[].healthPercent`; its value is 41%, rule `component-health-percent-bands` version `demo-health-risk-v1` returns the Attention band and Attention status. Missing seeds identify their source as `missing`, have no fabricated input ID, and return Unavailable.

This trace is available to code and tests, not yet to the dashboard user. The visible UI communicates simulated data and status but does not expose signal path, rule version, or provenance details.

## Product correctness and validation

- Approved Phase 2–5 outputs are preserved, including the 82/100 score, 1,240 km range, +9% recovery, two flagged components, component values/statuses, mileage shares, service comparison, and alert values.
- Statuses are deterministic and match the approved bands; two Attention components produce a flagged count of two.
- Missing and invalid health values are classified Unavailable rather than Healthy or Attention.
- The current Node test suite passes: 6 tests, 6 passed, 0 failed. It covers band boundaries, invalid values, flagged count, baseline outputs, provenance, and repeated calls to the analysis function.
- `npm run build` passed during this review.

## Known limitations

- The condition seeds are not derived from the adjacent simulated telemetry fields. OBD temperature/RPM/load, IMU text patterns, battery readings, and tyre pressures are contextual only.
- Thresholds are product-demo bands, not empirically calibrated safety or diagnostic thresholds.
- Overall health is a fixed 82 fixture, not a weighted component calculation. Mileage shares, recovery, and remaining life are also fixtures.
- The fixed timestamp and static snapshot have no freshness or data-quality lifecycle.
- Provenance is not surfaced in the UI.
- Invalid numeric values are classified Unavailable by the rule, but current health and alert cards only special-case `null`; a `NaN` value could render as `NaN%`. The UI should normalize non-finite values before presentation in a future approved change.
- No real service record, sensor fault, service outcome, or vehicle diagnosis is verified by this prototype.

## Future telemetry integration boundary

Replacing the simulator would require approved source adapters and a normalized input contract before analysis: stable vehicle/component identifiers, units, timestamps, source metadata, quality/freshness state, missing-value behavior, and explicit mappings for each supported vehicle/sensor. Real OBD-II, TPMS, IMU, battery, and service sources have different availability and semantics; a field name alone does not make signals equivalent.

Integration would also require vehicle/user consent, privacy and security review, transport/error handling, storage/retention decisions, and validation against representative vehicles. Keep hardware ingestion outside the UI components; have an adapter provide the same validated analysis input shape. Do not present a source as connected until its connection and data quality are actually verified.

Any future ML capability would additionally need labeled representative data, a defined prediction target, offline evaluation, calibration and uncertainty handling, false-positive/false-negative review, monitoring, and product approval. None of that exists in the current prototype.

## Recommended next product phase

Before real integrations or ML, prioritize a **data-quality and explainability validation phase**: decide whether provenance should be visible to users, fix the invalid-number presentation gap, define freshness/unavailable states, and agree how demo rules will be evaluated against labeled scenarios. Keep the current approved baseline as a golden fixture unless Product explicitly approves a replacement.