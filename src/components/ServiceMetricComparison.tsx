import type { ServiceMetric, ServiceMetricValue } from '../data/serviceComparison';

type ServiceMetricComparisonProps = {
  metric: ServiceMetric;
};

function ServiceMetricValueDisplay({ value }: { value: ServiceMetricValue }) {
  return (
    <>
      <span className="service-reading">
        <strong>{value.value}</strong>{value.unit && (
          <span className="service-unit">{value.unit === '%' ? '' : ' '}{value.unit}</span>
        )}
      </span>
      {value.context && <span className="service-reading-context">{value.context}</span>}
    </>
  );
}

function ServiceMetricComparison({ metric }: ServiceMetricComparisonProps) {
  return (
    <tr className={`service-metric-row result-${metric.result}`}>
      <th scope="row">
        <span className="service-metric-name">{metric.label}</span>
        <span className={`service-result ${metric.result}`}>{metric.resultLabel}</span>
      </th>
      <td>
        <span className="service-column-label">Before service</span>
        <ServiceMetricValueDisplay value={metric.before} />
      </td>
      <td>
        <span className="service-column-label">After service</span>
        <ServiceMetricValueDisplay value={metric.after} />
      </td>
    </tr>
  );
}

export default ServiceMetricComparison;