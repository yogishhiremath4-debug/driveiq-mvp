# Phase 8C: Explainability Validation and Product Review

**Scope:** Review of the existing Phase 8B explanation layer and UI  
**Code changes:** None

## 1. Validation summary

The explanation layer is deterministic and generally grounded in the actual component provenance and risk-rule result. It clearly labels condition values as simulated, avoids failure predictions and invented sensor readings, and distinguishes all four statuses.

The review found two trace/presentation gaps that should be addressed in a separately approved change before considering the experience fully complete:

1. The Battery explanation inherits an approved recommendation containing “approximately 3,200 km,” but its `evidence` array contains only the health-condition provenance, not the remaining-distance source.
2. An invalid numeric health value is explained as Unavailable, but `ComponentHealthCard` checks only for `null`; a `NaN` value can still render as `NaN%` with a progress element.

The Brake Pads explanation does not claim a failure, probability, temperature, wear rate, or exact remaining kilometres. Its existing recommendation is supported by approved demo alert data, but its imperative “Plan…” phrasing is stronger than the Phase 8A example’s “Consider…” wording.

## 2. Status-by-status review

| Status | Condition observed | Grounded / correct | Fabricated evidence? | Owner understandable | Result |
| --- | --- | --- | --- | --- | --- |
| Attention | Brake Pads 41%; Cooling System 58%. | Yes. Values and Attention statuses match the analyzed components and the `<60` demo band. | No. Evidence uses the simulated condition seed and rule provenance. | Yes. The explanation says what value was supplied and why the rule assigned Attention; it does not assert a physical cause. | Pass, with recommendation wording note above. |
| Monitor | Battery 64%; Tyres 73%. | Yes. Both values map to Monitor under the existing rule. | No sensor or fault evidence is added. The Battery action’s 3,200 km value is approved demo data but is not included in explanation evidence. | Yes. The category and optional monitoring action are plain language; no physical cause is claimed by the explanation template. | Pass with a provenance gap for the Battery distance recommendation. |
| Healthy | Engine 88%; Fuel System 90%. | Yes. Both map to Healthy under the existing rule. | No. | Yes. The copy says the result is not a complete vehicle assessment and suggests no component-specific action. | Pass. |
| Unavailable | Missing seed and invalid `NaN` seed are covered by tests. | The explanation returns Unavailable, null evidence value/unit, and says sufficient valid data is unavailable. | No source ID is fabricated for a missing seed. | The explanation is understandable; however, the card can display `NaN%` for an invalid numeric value even while its status is Unavailable. | Explanation passes; UI presentation gap for invalid numeric input. |

Across the four cases, “why it matters” explains the deterministic status band, not a mechanical cause. This is appropriate to the available evidence; causal claims would be unsupported by the current inputs.

## 3. Brake Pads trace

```text
Simulated condition seed
  component: Brake Pads
  inputId: demo-condition-brake-pads
  signalPath: scenarioOutputs.componentConditions[].healthPercent
  value: 41%
        ↓
Rule: component-health-percent-bands / demo-health-risk-v1
  41% maps to the Attention band
        ↓
Analysis result: riskBand Attention, status Attention
        ↓
Explanation: simulated condition is 41%; the demo rule assigned Attention
        ↓
Existing approved recommendation: plan brake inspection/service before estimated remaining life is reached
```

The explanation evidence reproduces the component source, input ID, signal path, value/unit, rule ID/version, and risk band from the actual analysis provenance. It does not state the approved 1,100 km estimate, a failure date, failure probability, temperature, braking frequency, wear rate, or a confirmed brake fault. The recommendation comes from the existing approved alert data, not a new inference; its source is not represented in the explanation’s evidence array.

## 4. Unsupported-claim audit

- No explanation claims imminent failure, a failure probability, a mechanical diagnosis, or validated AI accuracy.
- The Brake Pads explanation contains no exact remaining-kilometre figure and cites no real brake sensor.
- The explanation does not cite adjacent OBD-II, IMU, battery, or tyre signals as causes; those signals are not inputs to the risk rule.
- Battery’s approximately 3,200 km recommendation exists in approved demo data, so it is not invented. However, the explanation evidence does not identify the remaining-distance input that supports it; traceability is incomplete for that part of the recommendation.
- Brake Pads uses the approved alert text “Plan a brake inspection/service…”. It is not phrased as mandatory, but “Consider planning…” would align more closely with Phase 8A’s optional, non-alarmist example.
- For invalid numeric health, the explanation is Unavailable, but the surrounding component card can show `NaN%`. This is a genuine UI consistency defect; it was documented, not fixed, in this review.

## 5. Product limitations

- All condition values are simulated, not live vehicle telemetry.
- Risk categories are deterministic demo rules, not validated thresholds or diagnostic standards.
- Explanations are templates, not validated AI-generated diagnostics.
- The output is not a confirmed mechanical diagnosis and has no calibrated confidence score.
- The rule explains why a value maps to a status; it cannot establish the underlying physical cause with current evidence.
- Recommendation provenance is not uniformly carried into the explanation evidence object.
- Missing input is handled correctly by the explanation layer; invalid numeric input still needs UI normalization before presentation.

## 6. Phase 8B verification

- Test suite: 13 tests passed, 0 failed. Coverage includes all four statuses, Brake Pads 41%, provenance matching, unavailable inputs, unsupported evidence, deterministic output, and Phase 7 regressions.
- Build: `npm run build` passed (`tsc --noEmit` and Vite production build).
- Editor/type scan: no errors found in the explanation layer, UI integration, tests, analysis, or risk rule.
- Browser: explanation disclosure opened and rendered the Brake Pads trace. At 390px, 768px, and 1280px, the page had no horizontal overflow.
- Baseline: overall health remained 82/100 Good with 2 flagged components; all six approved component values/statuses remained unchanged.

## Review conclusion

The explanations are substantially grounded, deterministic, and appropriately cautious for simulated demo rules. The two findings are limited to recommendation-evidence traceability and invalid-number display consistency. No code was changed; any remediation should be separately approved.