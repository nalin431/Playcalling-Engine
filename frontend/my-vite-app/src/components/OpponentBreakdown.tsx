import type { OpponentBreakdown as OpponentBreakdownType } from '../types';
import './OpponentBreakdown.css';

interface OpponentBreakdownProps {
  breakdown: OpponentBreakdownType | null;
}

export default function OpponentBreakdown({ breakdown }: OpponentBreakdownProps) {
  if (!breakdown) {
    return (
      <div className="opponent-breakdown">
        <h2>Opponent Breakdown</h2>
        <p className="empty-state">Enter opponent name to see breakdown</p>
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 70) return '#28a745';
    if (rating >= 50) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="opponent-breakdown">
      <h2>Opponent Breakdown: {breakdown.opponent}</h2>
      <div className="breakdown-grid">
        <div className="breakdown-section">
          <h3>Defensive Ratings</h3>
          <div className="rating-item">
            <span className="rating-label">Run Defense</span>
            <div className="rating-bar-container">
              <div
                className="rating-bar"
                style={{
                  width: `${breakdown.defensiveTendencies.runDefense}%`,
                  backgroundColor: getRatingColor(breakdown.defensiveTendencies.runDefense),
                }}
              />
              <span className="rating-value">{breakdown.defensiveTendencies.runDefense}/100</span>
            </div>
          </div>
          <div className="rating-item">
            <span className="rating-label">Pass Defense</span>
            <div className="rating-bar-container">
              <div
                className="rating-bar"
                style={{
                  width: `${breakdown.defensiveTendencies.passDefense}%`,
                  backgroundColor: getRatingColor(breakdown.defensiveTendencies.passDefense),
                }}
              />
              <span className="rating-value">{breakdown.defensiveTendencies.passDefense}/100</span>
            </div>
          </div>
          <div className="rating-item">
            <span className="rating-label">Blitz Frequency</span>
            <div className="rating-bar-container">
              <div
                className="rating-bar"
                style={{
                  width: `${breakdown.defensiveTendencies.blitzFrequency}%`,
                  backgroundColor: '#C83803',
                }}
              />
              <span className="rating-value">{breakdown.defensiveTendencies.blitzFrequency}%</span>
            </div>
          </div>
          <div className="coverage-type">
            <span className="coverage-label">Primary Coverage:</span>
            <span className="coverage-value">{breakdown.defensiveTendencies.coverageType.toUpperCase()}</span>
          </div>
        </div>

        <div className="breakdown-section">
          <h3>Strengths</h3>
          <ul className="strengths-list">
            {breakdown.strengths.map((strength, index) => (
              <li key={index} className="strength-item">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="breakdown-section">
          <h3>Weaknesses</h3>
          <ul className="weaknesses-list">
            {breakdown.weaknesses.map((weakness, index) => (
              <li key={index} className="weakness-item">
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        <div className="breakdown-section">
          <h3>Recent Formation</h3>
          <p className="formation-info">{breakdown.recentFormation}</p>
        </div>
      </div>
    </div>
  );
}

