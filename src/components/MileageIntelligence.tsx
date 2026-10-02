import MileageCauseCard from './MileageCauseCard';
import { vehicleAnalysis } from '../data/vehicleAnalysis';

const { mileageInsights } = vehicleAnalysis.outputs;

function MileageIntelligence() {
  return (
    <section className="mileage-section" aria-labelledby="mileage-title">
      <div className="section-heading mileage-section-heading">
        <div>
          <p className="eyebrow">Mileage Intelligence</p>
          <h2 id="mileage-title">Why is my mileage dropping?</h2>
        </div>
        <span className="analysis-label">{mileageInsights.analysisLabel}</span>
      </div>

      <div className="mileage-overview">
        <div>
          <p className="eyebrow">Estimated mileage opportunity</p>
          <h3>{mileageInsights.headline}</h3>
          <p className="mileage-disclaimer">{mileageInsights.disclaimer}</p>
        </div>
        <strong className="mileage-opportunity">
          +{mileageInsights.recoveryOpportunityPercent}<span>%</span>
        </strong>
      </div>

      <div className="mileage-causes-heading">
        <h3>Possible contributors</h3>
        <p>Relative share of simulated mileage loss</p>
      </div>
      <ol className="mileage-cause-list">
        {mileageInsights.causes.map((cause, index) => (
          <MileageCauseCard key={cause.cause} cause={cause} rank={index + 1} />
        ))}
      </ol>
    </section>
  );
}

export default MileageIntelligence;