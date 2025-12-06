import type { PlayPrediction as PlayPredictionType } from '../types';
import './PlayPrediction.css';

interface PlayPredictionProps {
  prediction: PlayPredictionType | null;
}

export default function PlayPrediction({ prediction }: PlayPredictionProps) {
  if (!prediction) {
    return (
      <div className="play-prediction">
        <h2>Play Prediction</h2>
        <p className="empty-state">Enter game situation to predict Bears' play</p>
      </div>
    );
  }

  return (
    <div className="play-prediction">
      <h2>Predicted Bears Play</h2>
      <div className="prediction-card">
        <div className="play-header">
          <span className="play-type">{prediction.predictedPlay.type.toUpperCase()}</span>
          <span className="confidence">Confidence: {prediction.confidence}%</span>
        </div>
        <div className="play-details">
          <h3>{prediction.predictedPlay.description}</h3>
          <p className="formation">Formation: {prediction.predictedPlay.formation}</p>
          <div className="play-stats">
            <div className="stat">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value">{prediction.predictedPlay.successRate}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Avg Yards</span>
              <span className="stat-value">{prediction.predictedPlay.yardsPerPlay.toFixed(1)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Times Used</span>
              <span className="stat-value">{prediction.predictedPlay.usageCount}</span>
            </div>
          </div>
        </div>
        <div className="factors">
          <h4>Key Factors:</h4>
          <ul>
            {prediction.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

