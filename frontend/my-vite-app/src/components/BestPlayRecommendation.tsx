import type { BestPlayRecommendation as BestPlayRecommendationType, RecommendationPlay } from '../types';
import './BestPlayRecommendation.css';

interface BestPlayRecommendationProps {
  recommendation: BestPlayRecommendationType | null;
}

export default function BestPlayRecommendation({ recommendation }: BestPlayRecommendationProps) {
  if (!recommendation) {
    return (
      <div className="best-play-recommendation">
        <h2>Best Play Recommendation</h2>
        <p className="empty-state">Enter game situation to get play recommendation</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return '#28a745';
      case 'medium':
        return '#ffc107';
      case 'high':
        return '#dc3545';
      default:
        return '#666';
    }
  };

  const formatPlay = (play: RecommendationPlay) => {
    if (play.type === 'run') {
      const location = play.run_location ? play.run_location.toUpperCase() : 'UNKNOWN';
      const gap = play.run_gap ? play.run_gap.toUpperCase() : 'UNKNOWN';
      const player = play.run_player ? ` • ${play.run_player}` : '';
      return `RUN • ${location} ${gap}${player}`;
    }

    const depth = play.pass_depth_bucket ? play.pass_depth_bucket.toUpperCase() : 'UNKNOWN';
    const location = play.pass_location ? play.pass_location.toUpperCase() : 'UNKNOWN';
    return `PASS • ${depth} ${location}`;
  };

  return (
    <div className="best-play-recommendation">
      <h2>Best Play Recommendation</h2>
      <div className="recommendation-card">
        <div className="recommendation-header">
          <div className="play-badge">
            <span className="play-type-badge">{recommendation.recommendedPlay.type.toUpperCase()}</span>
            <span
              className="risk-badge"
              style={{ backgroundColor: getRiskColor(recommendation.riskLevel) }}
            >
              {recommendation.riskLevel.toUpperCase()} RISK
            </span>
          </div>
          <div className="success-probability">
            <span className="probability-label">Success Probability</span>
            <span className="probability-value">{recommendation.successProbability}%</span>
          </div>
        </div>

        <div className="recommended-play">
          <h3>{formatPlay(recommendation.recommendedPlay)}</h3>
          <p className="formation">Play Type: {recommendation.recommendedPlay.type.toUpperCase()}</p>
          
          <div className="play-metrics">
            <div className="metric">
              <span className="metric-label">Expected Yards</span>
              <span className="metric-value">{recommendation.expectedYards.toFixed(1)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Success Rate</span>
              <span className="metric-value">
                {recommendation.recommendedPlay.success_prob
                  ? `${(recommendation.recommendedPlay.success_prob * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Model Score</span>
              <span className="metric-value">
                {recommendation.recommendedPlay.score !== undefined
                  ? recommendation.recommendedPlay.score.toFixed(2)
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="reasoning">
          <h4>Why This Play?</h4>
          <ul>
            {recommendation.reasoning.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>

        {recommendation.alternativePlays.length > 0 && (
          <div className="alternatives">
            <h4>Alternative Plays</h4>
            <div className="alternatives-grid">
              {recommendation.alternativePlays.map((play, index) => (
                <div key={index} className="alternative-play">
                  <span className="alt-play-type">{play.type.toUpperCase()}</span>
                  <p className="alt-play-desc">{formatPlay(play)}</p>
                  <div className="alt-play-stats">
                    <span>
                      {play.success_prob !== undefined
                        ? `${(play.success_prob * 100).toFixed(1)}% success`
                        : 'Success N/A'}
                    </span>
                    <span>
                      {play.expected_yards !== undefined
                        ? `${play.expected_yards.toFixed(1)} avg yds`
                        : 'Yards N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

