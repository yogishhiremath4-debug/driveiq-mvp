import AlertCard from './AlertCard';
import { vehicleAnalysis } from '../data/vehicleAnalysis';

const { vehicleAlerts } = vehicleAnalysis.outputs;

function AlertsSection() {
  return (
    <section className="alerts-section" aria-labelledby="alerts-title">
      <div className="section-heading alerts-section-heading">
        <div>
          <p className="eyebrow">ENGAGE</p>
          <h2 id="alerts-title">Alerts &amp; Recommended Actions</h2>
          <p className="alerts-question">What should I pay attention to right now?</p>
        </div>
        <span className="alerts-demo-label">Simulated alerts</span>
      </div>
      <p className="alerts-disclaimer">
        Simulated alerts based on demo vehicle data. These are prototype recommendations, not live telemetry or validated diagnostics.
      </p>
      <ol className="alert-grid">
        {vehicleAlerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} rank={index + 1} />
        ))}
      </ol>
    </section>
  );
}

export default AlertsSection;