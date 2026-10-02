import type { MileageCause } from '../data/mileageInsights';

type MileageCauseCardProps = {
  cause: MileageCause;
  rank: number;
};

function MileageCauseCard({ cause, rank }: MileageCauseCardProps) {
  return (
    <li className="mileage-cause-item">
      <article className="mileage-cause-card">
        <div className="mileage-cause-heading">
          <span className="mileage-cause-rank" aria-hidden="true">{rank}</span>
          <h3>{cause.cause}</h3>
          <strong className="mileage-cause-percentage">{cause.percentage}%</strong>
        </div>
        <progress
          className="mileage-contribution-progress"
          value={cause.percentage}
          max="100"
          aria-label={`${cause.cause} contribution: ${cause.percentage}%`}
        >
          {cause.percentage}%
        </progress>
        <div className="mileage-cause-details">
          <div>
            <h4>Why it may matter</h4>
            <p>{cause.explanation}</p>
          </div>
          <div>
            <h4>Suggested action</h4>
            <p>{cause.recommendedAction}</p>
          </div>
        </div>
      </article>
    </li>
  );
}

export default MileageCauseCard;