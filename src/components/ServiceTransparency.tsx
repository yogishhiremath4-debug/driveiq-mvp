import ServiceMetricComparison from './ServiceMetricComparison';
import { vehicleAnalysis } from '../data/vehicleAnalysis';

const { serviceComparison } = vehicleAnalysis.outputs;

function ServiceTransparency() {
  const batteryMetric = serviceComparison.metrics.find(
    (metric) => metric.id === serviceComparison.batteryIssue.metricId,
  );

  return (
    <section className="service-transparency" aria-labelledby="service-title">
      <div className="section-heading service-section-heading">
        <div>
          <p className="eyebrow">Service Transparency</p>
          <h2 id="service-title">What changed after service?</h2>
        </div>
        <span className="service-demo-label">{serviceComparison.demoLabel}</span>
      </div>
      <p className="service-disclaimer">{serviceComparison.disclaimer}</p>

      <ol className="service-milestones">
        {serviceComparison.milestones.map((milestone, index) => (
          <li className="service-milestone" key={milestone.stage}>
            <span className="service-milestone-number" aria-hidden="true">{index + 1}</span>
            <p className="service-milestone-stage">{milestone.stage}</p>
            <h3>{milestone.prompt}</h3>
            <p className="service-milestone-detail">{milestone.detail}</p>
          </li>
        ))}
      </ol>

      <div className="service-comparison-heading">
        <div>
          <p className="eyebrow">Before and after</p>
          <h3>Service comparison</h3>
        </div>
        <p>Demo readings shown for comparison</p>
      </div>
      <table className="service-comparison-table" aria-label="Before and after service values">
        <thead>
          <tr>
            <th scope="col">Measure</th>
            <th scope="col">Before service</th>
            <th scope="col">After service</th>
          </tr>
        </thead>
        <tbody>
          {serviceComparison.metrics.map((metric) => (
            <ServiceMetricComparison key={metric.id} metric={metric} />
          ))}
        </tbody>
      </table>

      {batteryMetric && (
        <aside className="battery-issue" aria-labelledby="battery-issue-title">
          <div className="battery-issue-heading">
            <div>
              <p className="eyebrow">Remaining issue</p>
              <h3 id="battery-issue-title">Still needs attention: battery</h3>
            </div>
            <span className="service-result attention">{serviceComparison.batteryIssue.cause}</span>
          </div>
          <p className="battery-change">
            Battery health changed from <strong>{batteryMetric.before.value}%</strong> to{' '}
            <strong>{batteryMetric.after.value}%</strong>, so it did not materially improve.
          </p>
          <p className="battery-explanation">
            The simulated explanation is an ageing cell. {serviceComparison.batteryIssue.coverage}
          </p>
          <p className="battery-recommendation">
            <strong>Recommended next action:</strong> {serviceComparison.batteryIssue.recommendedAction}
          </p>
          <p className="battery-demo-note">Simulated demo information, not a real service diagnosis.</p>
        </aside>
      )}
    </section>
  );
}

export default ServiceTransparency;