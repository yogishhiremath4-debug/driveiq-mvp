# Phase 7A: Deterministic Analysis Specification

**Status:** Phase 7A approved; final decisions for Phase 7B  
**Scope:** Specification only. No application code or approved UI values are changed by this document.

## Purpose and constraints

Define a deterministic, explainable mapping from simulated vehicle signals to demo health, mileage, and risk outputs. These rules are prototype logic, not validated diagnostics, real-world thresholds, or machine learning.

- Inputs remain static and explicitly marked simulated.
- The same input snapshot and rule version must always produce the same output.
- Missing or invalid inputs produce `unavailable`; they must not be treated as zero, healthy, or a fault.
- Every calculated output should retain its source signal IDs and rule version for explanation and tests.
- Existing Phase 2-5 display values remain authoritative demo fixtures until Product approves any calculated replacements.
- Do not connect vehicle hardware, external APIs, a backend, or a database.

## Intended data flow

```text
Simulated vehicle signals
        ↓
Input validation and unit normalization
        ↓
Deterministic demo rules
        ↓
Health / mileage / risk outputs with provenance
        ↓
Existing UI
        ↓
Automated fixture and boundary tests
```

## Existing signal inventory

The current `simulatedVehicleData` snapshot supplies:

| Group | Existing simulated fields | Notes |
| --- | --- | --- |
| Vehicle | `vehicleId`, `mileageKm`, `recordedAt`, `operatingState` | Static demo metadata and state. |
| OBD-II / ECU | Engine temperature, RPM, load | Useful context; no approved health thresholds or baseline ranges are defined. |
| IMU / driving | Acceleration pattern, braking pattern, average speed | Text patterns are not numeric event counts. |
| Battery | Voltage, temperature, ageing-cell condition signal | Supports a demo issue explanation; no voltage/temperature-to-health rule is approved. |
| Tyres / TPMS | Four tyre pressures and a condition note | Per-wheel reference pressures and a health mapping are not defined. |
| Fuel efficiency | Current and baseline mileage | Supports overall efficiency comparison, not isolated fuel-system health. |
| Service | Simulated date and service snapshot | A demo comparison only, not a connected service record. |

## Output-to-input mapping

| Output | Phase 7B input and final rule | Baseline expected output |
| --- | --- | --- |
| Engine health | Pass through explicit simulated `componentSeeds.engine.healthPercent`. OBD-II temperature/RPM/load remain context only; do not infer health from them. | 88%; estimated remaining 18,500 km. |
| Battery health | Pass through `componentSeeds.battery.healthPercent`. Voltage, temperature, and ageing-cell text are context only, not a diagnosis. | 64%; estimated remaining 3,200 km. |
| Brake health | Pass through `componentSeeds.brakePads.healthPercent` and `remainingKm`. Braking pattern and service snapshot do not establish measured pad wear. | 41%; estimated remaining 1,100 km. |
| Tyre health | Pass through `componentSeeds.tyres.healthPercent`. Pressure readings remain context; no pressure-to-health inference or universal PSI threshold is applied. | 73%; estimated remaining 6,400 km. |
| Cooling health | Pass through `componentSeeds.coolingSystem.healthPercent`. Existing engine temperature does not establish cooling-system condition. | 58%; estimated remaining 4,000 km. |
| Fuel-system health | Pass through `componentSeeds.fuelSystem.healthPercent`. Whole-vehicle mileage is not treated as a fuel-system measurement. | 90%; estimated remaining 20,000+ km. |
| Overall health | **No weighted calculation in Phase 7B.** Pass through the explicit approved scenario summary fixture. Component weights are not approved and must not be invented or calibrated to force parity. | 82/100, Good; range 1,240 km; mileage recovery +9%; 2 components flagged. |
| Mileage contributors | **Fixed demo attribution fixture in Phase 7B.** Do not calculate shares from the current text patterns or proxy signals. A signal-to-factor scoring algorithm is deferred. | Driving behaviour 32%; tyre under-inflation 24%; engine wear / carbon build-up 20%; fuel-system inefficiency 14%; AC / electrical load 10%. |
| Risk status | Apply the demo-only bands below to seeded component health. Count only Attention components in “components flagged.” | `<60` Attention; `60-79` Monitor; `>=80` Healthy. This gives 2 Attention components, 2 Monitor components, and 2 Healthy components. These are presentation bands, not safety thresholds. |

## Final decision: simulated input additions

Do not fabricate additional physical sensor readings to fill gaps. Phase 7B will add a clearly labelled `scenarioOutputs`/condition-seed group to the static demo snapshot. It is the source for the existing approved condition outputs, not telemetry and not a claim that a sensor calculated those outputs.

The seed values are:

| Seed | Health | Remaining life |
| --- | ---: | ---: |
| Engine | 88% | 18,500 km |
| Battery | 64% | 3,200 km |
| Brake pads | 41% | 1,100 km |
| Tyres | 73% | 6,400 km |
| Cooling system | 58% | 4,000 km |
| Fuel system | 90% | 20,000+ km |

Keep current OBD-II, IMU, battery, tyre-pressure, fuel-efficiency, and service fields as simulated contextual signals. No new coolant-temperature, brake-wear-sensor, fuel-delivery, AC-load, acceleration-count, braking-count, or tyre-reference-pressure values are approved for this baseline. The current signal snapshot does not support those values; add them only with a separately approved scenario and explicit units.

If a required condition seed is absent or invalid, return `unavailable` with an explanation. Never silently substitute a raw proxy or present a seeded value as sensor-derived.

## Final decision: risk bands and weighting

Risk labels are determined only from a component's seeded health percentage:

| Health | Label |
| ---: | --- |
| 0-59% | Attention |
| 60-79% | Monitor |
| 80-100% | Healthy |

The “components flagged” summary counts Attention items only. The approved baseline therefore remains 2 (Brake Pads and Cooling System). Apply the rule consistently in the UI, alerts, and tests.

Overall health is **not component-weighted in Phase 7B**. Keep the approved `82/100, Good` result as an explicit scenario summary fixture. Weighting has no approved product rationale and can produce a materially different score from the current fixture. Do not choose weights to make the calculation happen to equal 82. Any weighted formula requires a later Product decision and a newly approved expected score.

## Baseline expected outputs to preserve

These exact outputs are the Phase 7B golden baseline:

- Overall: 82/100 Good; 1,240 km before next check; +9% recovery; 2 components flagged.
- Components: Engine 88% / 18,500 km; Battery 64% / 3,200 km; Brake Pads 41% / 1,100 km; Tyres 73% / 6,400 km; Cooling System 58% / 4,000 km; Fuel System 90% / 20,000+ km.
- Mileage attribution: Driving behaviour 32%; Tyre under-inflation 24%; Engine wear / carbon build-up 20%; Fuel-system inefficiency 14%; AC / electrical load 10%; total 100%.
- Service comparison: mileage 13.2 → 14.6 km/l; engine 71% → 92%; brake pads 41% → replaced/100%; battery 64% → 66%; active risk flags 3 → 1.
- Alerts: Brake Pads Attention 41% / approx. 1,100 km; Cooling System Attention 58% / approx. 4,000 km; Battery Monitor 64% / approx. 3,200 km; Tyres Monitor 73% / approx. 6,400 km.

Service comparison remains a separate before/after demo snapshot. Do not overwrite the current Battery health seed of 64% with the service-after value of 66%.

## Phase 7B acceptance tests

- Fixed scenario snapshot returns identical output on repeated calls; no random numbers, timers, polling, or side effects.
- Seeded component values and approved scenario fixtures pass through unchanged.
- Risk boundaries are tested at 59/60 and 79/80; missing or invalid health returns `unavailable`, not Healthy.
- The two Attention results yield exactly 2 flagged components.
- Fixed mileage contributor percentages remain non-negative and total exactly 100%.
- Golden-fixture tests protect all listed Phase 2-5 values.
- UI copy continues to state that vehicle data and analysis are simulated, with no live connection or validated diagnostic claim.

## Phase 7B implementation contract

1. Implement deterministic pass-through of approved scenario condition seeds and fixed Phase 2-5 output fixtures.
2. Calculate only risk labels/counts using the approved demo bands above.
3. Keep the analysis boundary pure, static, and explicit about fixture provenance; do not implement health weighting or mileage attribution scoring.
4. Preserve all baseline expected outputs and return unavailable for missing condition seeds.