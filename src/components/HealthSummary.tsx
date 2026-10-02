type HealthSummaryProps = {
  summary: {
    score: number;
    status: string;
    rangeBeforeCheckKm: number;
    predictedMileageRecovery: number;
    componentsFlagged: number;
  };
};

function HealthSummary({ summary }: HealthSummaryProps) {
  return (
    <section className="health-summary" aria-labelledby="health-summary-title">
      <div className="score-block">
        <p className="summary-kicker" id="health-summary-title">Overall vehicle health</p>
        <div
          className="score-meter"
          role="meter"
          aria-label="Overall vehicle health"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.score}
          aria-valuetext={`${summary.score} out of 100, ${summary.status}`}
          style={{ '--score': `${summary.score}%` } as React.CSSProperties}
        >
          <div className="score-meter-inner">
            <span className="score-value">{summary.score}</span>
            <span className="score-total">/ 100</span>
          </div>
        </div>
        <span className="overall-status"><span aria-hidden="true" />{summary.status}</span>
      </div>

      <div className="summary-details">
        <div className="summary-intro">
          <p className="summary-kicker">A good place to be</p>
          <p className="summary-description">Your vehicle is in good overall condition.</p>
        </div>
        <div className="summary-metrics">
          <div className="summary-metric">
            <span className="metric-label">Estimated range before next check</span>
            <strong>{summary.rangeBeforeCheckKm.toLocaleString()} <span>km</span></strong>
          </div>
          <div className="summary-metric">
            <span className="metric-label">Predicted mileage recovery</span>
            <strong className="recovery-value">+{summary.predictedMileageRecovery}%</strong>
          </div>
          <div className="summary-metric">
            <span className="metric-label">Components flagged</span>
            <strong>{summary.componentsFlagged}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HealthSummary;