import type { VehicleAlert } from '../data/vehicleAlerts';

type AlertCardProps = {
  alert: VehicleAlert;
  rank: number;
};

function AlertCard({ alert, rank }: AlertCardProps) {
  const priorityClass = alert.priority.toLowerCase();
  const hasValidHealth = typeof alert.health === 'number'
    && Number.isFinite(alert.health)
    && alert.health >= 0
    && alert.health <= 100;
  const healthLabel = hasValidHealth ? `${alert.health}% health` : 'Unavailable';
  const remainingLabel = alert.remainingKm ?? 'Unavailable';

  return (
    <li className="alert-list-item">
      <article className={`alert-card ${priorityClass}`}>
        <div className="alert-card-heading">
          <span className="alert-rank" aria-hidden="true">{rank}</span>
          <h3>{alert.component}</h3>
          <span className={`component-status ${priorityClass}`}>
            <span aria-hidden="true" />{alert.priority}
          </span>
        </div>
        <div className="alert-condition-grid">
          <div>
            <span className="alert-field-label">Current condition</span>
            <strong>{healthLabel}</strong>
          </div>
          <div>
            <span className="alert-field-label">Estimated remaining</span>
            <strong>{remainingLabel}</strong>
          </div>
        </div>
        <div className="alert-guidance">
          <div>
            <h4>Why pay attention</h4>
            <p>{alert.explanation}</p>
          </div>
          <div className="alert-recommendation">
            <h4>Recommended action</h4>
            <p>{alert.recommendedAction}</p>
          </div>
        </div>
      </article>
    </li>
  );
}

export default AlertCard;