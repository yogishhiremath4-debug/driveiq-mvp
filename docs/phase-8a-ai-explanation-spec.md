# Phase 8A: AI Explanation Requirements and Specification

**Status:** Draft for Product approval  
**Scope:** Product specification only. No application code or approved values are changed.

## 1. User problem

“I can see that something needs attention, but I need to understand why.”

DriveIQ Explain should translate a component status into a concise account of the supplied condition, the rule that assigned the status, the evidence actually available, and a proportionate next step. It should also make the limits of that evidence clear so owners do not mistake a prototype result for a confirmed fault.

## 2. Allowed explanation inputs

Phase 8B explanations may use only fields already present in `AnalyzedVehicleComponent` provenance and the associated approved demo outputs. Every evidence item must be traceable to one of these inputs.

| Input | Permitted use | Constraint |
| --- | --- | --- |
| `component` | Identify which component the explanation describes. | Use the component name from the analysis result. |
| `condition.value` and `condition.unit` | State the supplied condition, such as 41%. | Describe it as a simulated condition seed, not a sensor measurement. |
| `source.type`, `source.inputId`, `source.signalPath` | Identify where the condition came from. | Preserve `missing`/null when unavailable; never invent an input ID. |
| `riskBand` and `status` | Explain the assigned category. | Use the existing values; do not relabel or add severity levels. |
| `rule.id` and `rule.version` | Explain which deterministic rule was applied. | Do not describe the rule as a trained or validated model. |
| Related fields from `simulatedVehicleData` | Add context only if an existing rule actually consumed that signal for this component. | Do not use merely nearby telemetry as causal evidence. Current health classification consumes the seeded health percentage only. |
| Existing approved outputs | Use only where the output is already available and directly relevant. | Do not infer a cause, trend, remaining distance, or service result from unrelated outputs. |

For the current risk rule, the relevant evidence is the component health seed, its provenance, and the risk-band rule result. OBD-II/ECU, IMU, battery-temperature, tyre-pressure, mileage, and service fields do not currently contribute to component risk classification and must not be cited as if they did.

## 3. Explanation output structure

Phase 8B should return one deterministic structured object per analyzed component:

```ts
type VehicleExplanation = {
  component: string;
  status: 'Attention' | 'Monitor' | 'Healthy' | 'Unavailable';
  whatWasDetected: string;
  whyItMatters: string;
  evidence: Array<{
    sourceType: 'simulated-condition-seed' | 'missing';
    inputId: string | null;
    signalPath: string;
    value: number | null;
    unit: string | null;
    ruleId: string;
    ruleVersion: string;
    riskBand: 'Attention' | 'Monitor' | 'Healthy' | 'Unavailable';
  }>;
  recommendedAction: string;
  limitations: string[];
};
```

`Unavailable` explanations must explicitly state which evidence is missing. Do not calculate a numeric confidence score: no confidence calibration or empirical validation exists. Explain uncertainty through `limitations` instead.

Owner-facing language should be short, plain, and non-alarmist. Keep structured evidence separate from its display wording so a future UI can show a concise summary and optionally reveal the trace.

## 4. Approved example: Brake Pads

Input: Brake Pads condition seed `41%`; source `demo-condition-brake-pads`; path `scenarioOutputs.componentConditions[].healthPercent`; rule `component-health-percent-bands`, version `demo-health-risk-v1`. The rule maps values from 0% through 59% to Attention.

```json
{
  "component": "Brake Pads",
  "status": "Attention",
  "whatWasDetected": "The simulated Brake Pads condition seed is 41%, which falls in the Attention band.",
  "whyItMatters": "The demo rule places health values below 60% in Attention. This is a prototype status, not confirmation of brake wear or failure.",
  "evidence": [
    {
      "sourceType": "simulated-condition-seed",
      "inputId": "demo-condition-brake-pads",
      "signalPath": "scenarioOutputs.componentConditions[].healthPercent",
      "value": 41,
      "unit": "%",
      "ruleId": "component-health-percent-bands",
      "ruleVersion": "demo-health-risk-v1",
      "riskBand": "Attention"
    }
  ],
  "recommendedAction": "Consider planning a brake inspection/service; this simulated result is not a mandatory safety instruction.",
  "limitations": [
    "The 41% value is a simulated condition seed, not a live brake sensor reading.",
    "No direct brake-wear evidence was used by the risk rule.",
    "The threshold is a demo rule, not a validated diagnosis or failure prediction."
  ]
}
```

This example intentionally does not state brake temperature, braking frequency, driving distance, wear rate, failure probability, or remaining kilometres. Such details may only appear if they are present in an approved, provenance-backed input for that explanation.

## 5. Explanation safety and accuracy rules

- Never invent evidence, signal values, units, causes, or source identifiers.
- Never say a component fault or mechanical failure is confirmed from a demo rule.
- Never present simulated values as live vehicle telemetry or imply localhost is vehicle-connected.
- Never claim a validated AI prediction or provide an uncalibrated confidence percentage.
- Cite only evidence actually consumed by the rule; distinguish condition seeds from contextual signals.
- If the condition or provenance is missing/invalid, say evidence is unavailable and preserve `Unavailable` status.
- Keep `Attention`, `Monitor`, `Healthy`, and `Unavailable` distinct and consistent with the analysis result.
- Recommendations must be optional, proportionate to the evidence, and not represented as mandatory or safety-critical instructions.
- Do not change the existing risk thresholds or approved Phase 2–5 outputs as part of explanation generation.

## 6. Determinism

For the current MVP, identical component provenance and rule version must produce byte-for-byte equivalent structured explanations. Explanation generation must be local and deterministic, with no randomness, current-time dependence, external APIs, LLM calls, network calls, or real ML.

## 7. Current MVP and future AI boundary

| Current MVP | Future capability; not part of Phase 8A/8B |
| --- | --- |
| Static simulated vehicle signals and explicit condition seeds. | Real vehicle telemetry and validated sensor adapters. |
| Deterministic health-percentage risk bands. | Learned anomaly detection or trained failure prediction. |
| Structured source/rule provenance. | Natural-language generation by an LLM. |
| Template/rule-based explanations grounded in existing provenance. | Confidence calibration and model-derived uncertainty. |
| Fixed mileage attribution and overall-health demo fixtures. | Learned mileage attribution or weighted health models. |

Any future ML requires representative labeled data, a defined prediction target, offline evaluation, calibration, failure-mode analysis, ongoing monitoring, and Product approval. No such model or validation currently exists.

## 8. Phase 8B acceptance criteria

- Every explanation is generated from an analyzed component and its provenance, not from UI-hard-coded condition claims.
- `component`, `status`, `whatWasDetected`, `whyItMatters`, `evidence`, `recommendedAction`, and `limitations` are present with the specified types.
- Evidence source ID, signal path, value/unit, rule ID/version, risk band, and status match the actual analysis input/output.
- Brake Pads 41% produces the example Attention explanation without adding unsupported brake signals or claims.
- Attention, Monitor, Healthy, and Unavailable are preserved exactly from the deterministic analysis rule.
- Missing/invalid conditions produce an Unavailable explanation that explicitly identifies unavailable evidence and fabricates no source.
- Tests reject explanations that reference absent signals, unsupported causes, or values not present in their provenance.
- Recommendations remain optional and proportional; no mandatory safety advice or confirmed-fault language appears.
- The same provenance and rule version produce identical structured explanation output on repeated runs.
- The UI clearly discloses simulated data and does not claim live connection, validated diagnostics, or AI accuracy.
- Existing overall health, mileage, service, remaining-distance, and alert baselines remain unchanged.

## Source availability

No original DriveIQ product requirements/source PDF was found in the project workspace during this specification pass. This document is based on the approved Phase 7A/7E specifications and current implementation; Product should reconcile it with the original source if that document becomes available.