import type { BestPlayRecommendation as BestPlayRecommendationType, GameSituation, RecommendationPlay } from '../types';
import { getReliabilityWarnings } from '../utils/reliability';
import './BestPlayRecommendation.css';

interface BestPlayRecommendationProps {
  recommendation: BestPlayRecommendationType | null;
  isLoading?: boolean;
  situation?: GameSituation | null;
}

export default function BestPlayRecommendation({ recommendation, isLoading = false, situation = null }: BestPlayRecommendationProps) {
  if (!recommendation) {
    return (
      <div className="best-play-recommendation">
        <h2>Best Play Recommendation</h2>
        <p className="empty-state">
          {isLoading ? 'Loading play recommendation...' : 'Enter game situation to get play recommendation'}
        </p>
      </div>
    );
  }

  const warnings = situation ? getReliabilityWarnings(situation) : [];

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

  const formatPersonnel = (personnel?: string): string => {
    const map: Record<string, string> = {
      '10': '10 Personnel (4 WR)',
      '11': '11 Personnel (1 RB / 1 TE)',
      '12': '12 Personnel (1 RB / 2 TE)',
      '13': '13 Personnel (1 RB / 3 TE)',
      '21': '21 Personnel (2 RB / 1 TE)',
      '22': '22 Personnel (2 RB / 2 TE)',
    };
    if (!personnel) return '';
    return map[personnel] ?? `${personnel} Personnel`;
  };

  const formatPlay = (play: RecommendationPlay) => {
    const shotgun = play.shotgun
      ? play.shotgun.replace(/_/g, ' ').toUpperCase()
      : 'UNKNOWN';
    if (play.type === 'run') {
      const location = (play.run_location && play.run_location !== 'unknown') ? play.run_location.toUpperCase() : '';
      const gap = (play.run_gap && play.run_gap !== 'unknown') ? ` ${play.run_gap.toUpperCase()}` : '';
      const player = play.run_player ? ` - ${play.run_player}` : '';
      return `RUN - ${shotgun} - ${location}${gap}${player}`;
    }

    const depth = play.pass_depth_bucket ? play.pass_depth_bucket.toUpperCase() : 'UNKNOWN';
    const location = play.pass_location ? play.pass_location.toUpperCase() : 'UNKNOWN';
    return `PASS - ${shotgun} - ${depth} ${location}`;
  };

  return (
    <div className="best-play-recommendation">
      <h2>Best Play Recommendation</h2>
      <div className="recommendation-card">
        <div className="recommendation-header">
          <div className="play-badge">
            <span className="play-type-badge">{recommendation.recommendedPlay.type.toUpperCase()}</span>
            {recommendation.recommendedPlay.offense_personnel && (
              <span className="personnel-badge">
                {formatPersonnel(recommendation.recommendedPlay.offense_personnel)}
              </span>
            )}
            <span
              className="risk-badge"
              style={{ backgroundColor: getRiskColor(recommendation.riskLevel) }}
            >
              {recommendation.riskLevel.toUpperCase()} RISK
            </span>
          </div>
         
        </div>

        <div className="recommended-play">
          <h3>{formatPlay(recommendation.recommendedPlay)}</h3>
          <p className="formation">Play Type: {recommendation.recommendedPlay.type.toUpperCase()}</p>

          {warnings.length > 0 && (
            <div className="reliability-warning">
              <p className="reliability-warning-lead">
                <span className="reliability-warning-icon">⚠️</span>
                <strong> Outside reliable range</strong>
                <span className="reliability-warning-icon">⚠️</span>
              </p>
              <p className="reliability-warning-body">
                This situation is uncommon in the model&apos;s training data and the model is extrapolating. Treat the numbers below as unreliable.
              </p>
              <p className="reliability-warning-reasons">
                {warnings.join(' · ')}
              </p>
            </div>
          )}

          <div className="play-metrics">

              <div className="metric">
                <span className="metric-label">Success Probability</span>
                <span className="metric-value">{Number(recommendation.successProbability).toPrecision(4)}%</span>
              </div>
            
            
            <div className="metric">
              <span className="metric-label">Projected Yards</span>
              <span className="metric-value">{recommendation.expectedYards.toFixed(2)}</span>
            </div>

            <div className="metric">
              <span className="metric-label">Model Score</span>
              <span className="metric-value">
                {recommendation.recommendedPlay.score !== undefined
                  ? Number(recommendation.recommendedPlay.score).toPrecision(5)
                  : 'N/A'}
              </span>
            </div>
          </div>

          <p className="confidence-note">
            Directional estimate from a single-season model (~19 games, ~48% league-baseline success). Built to inform play-calling, not replace it.
          </p>
        </div>

        {recommendation.alternativePlays.length > 0 && (
          <div className="alternatives">
            <h4>Alternative Plays</h4>
            <div className="alternatives-grid">
              {recommendation.alternativePlays.map((play, index) => (
                <div key={index} className="alternative-play">
                  <div className="alt-play-header">
                    <span className="alt-play-type">{play.type.toUpperCase()}</span>
                    {play.offense_personnel && (
                      <span className="alt-personnel-badge">
                        {formatPersonnel(play.offense_personnel)}
                      </span>
                    )}
                  </div>
                  <p className="alt-play-desc">{formatPlay(play)}</p>
                  <div className="alt-play-stats">
                    <span>
                      {play.success_prob !== undefined
                        ? `${Number(play.success_prob * 100).toPrecision(4)}% success`
                        : 'Success N/A'}
                    </span>
                    <span>
                      {play.expected_yards !== undefined
                        ? `${play.expected_yards.toFixed(2)} proj yds`
                        : 'Yards N/A'}
                    </span>
                    <span>
                    {play.score !== undefined
                        ? `${play.score.toFixed(5)} Model Score`
                        : 'Score N/A'}
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
