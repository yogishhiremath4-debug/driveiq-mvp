import type { AnalyzedVehicleComponent } from '../data/vehicleAnalysis';
import { createVehicleExplanation } from '../analysis/vehicleExplanation';

type ComponentHealthCardProps = {
  component: AnalyzedVehicleComponent;
  recommendedAction?: string;
};

function ComponentHealthCard({ component, recommendedAction }: ComponentHealthCardProps) {
  const explanation = createVehicleExplanation(component, recommendedAction);
  const statusTone = component.riskStatus.toLowerCase();
  const hasValidHealth = typeof component.health === 'number'
    && Number.isFinite(component.health)
    && component.health >= 0
    && component.health <= 100;
  const healthLabel = hasValidHealth ? `${component.health}%` : 'Unavailable';
  const remaining = component.remainingKm === null ? 'Unavailable' : `${typeof component.remainingKm === 'number'
    ? component.remainingKm.toLocaleString()
    : component.remainingKm} km`;

  return (
    <article className={`component-card ${statusTone}`}>
      <div className="component-card-top">
        <h3>{component.name}</h3>
        <span className={`component-status ${statusTone}`}>
          <span aria-hidden="true" />{component.riskStatus}
        </span>
      </div>
      <div className="component-values">
        <strong className="component-percentage">{healthLabel}</strong>
        <span className="remaining-distance">{remaining} <small>estimated remaining</small></span>
      </div>
      {hasValidHealth && (
        <progress
          className={`health-progress ${statusTone}`}
          value={component.health ?? 0}
          max="100"
          aria-label={`${component.name} health: ${component.health}%`}
        >
          {component.health}%
        </progress>
      )}
      <details className="component-explanation">
        <summary>Why this status?</summary>
        <div className="component-explanation-content">
          <p><strong>What was detected</strong>{explanation.whatWasDetected}</p>
          <p><strong>Why it matters</strong>{explanation.whyItMatters}</p>
          <div className="explanation-evidence">
            <strong>Evidence and rule</strong>
            {explanation.evidence.map((item) => {
              const formattedValue = item.value === null
                ? 'value unavailable'
                : item.unit === 'km'
                  ? `${item.value.toLocaleString()} km`
                  : `${item.value}${item.unit ?? ''}`;

              return (
                <p key={`${item.inputId ?? 'missing'}-${item.ruleId ?? item.kind}`}>
                  {item.sourceType === 'simulated-condition-seed' ? 'Simulated condition' : 'Condition source unavailable'}
                  {item.inputId ? ` (${item.inputId})` : ''}; {item.signalPath}; {formattedValue};{' '}
                  {item.ruleId && item.ruleVersion
                    ? `${item.ruleId} v${item.ruleVersion}; ${item.riskBand}.`
                    : 'This approved estimate was not calculated by the risk rule.'}
                </p>
              );
            })}
          </div>
          <p><strong>What to consider</strong>{explanation.recommendedAction}</p>
          <div className="explanation-limitations">
            <strong>Limitations</strong>
            <ul>
              {explanation.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
            </ul>
          </div>
        </div>
      </details>
    </article>
  );
}

export default ComponentHealthCard;