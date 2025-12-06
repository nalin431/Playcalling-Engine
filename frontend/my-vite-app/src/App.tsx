import { useState } from 'react';
import GameSituationForm from './components/GameSituationForm';
import PlayPrediction from './components/PlayPrediction';
import OpponentBreakdown from './components/OpponentBreakdown';
import BestPlayRecommendation from './components/BestPlayRecommendation';
import type { GameSituation, PlayPrediction as PlayPredictionType, OpponentBreakdown as OpponentBreakdownType, BestPlayRecommendation as BestPlayRecommendationType } from './types';
import { predictPlay, getOpponentBreakdown, getBestPlayRecommendation } from './services/mockDataService';
import './App.css';

function App() {
  const [gameSituation, setGameSituation] = useState<GameSituation | null>(null);
  const [playPrediction, setPlayPrediction] = useState<PlayPredictionType | null>(null);
  const [opponentBreakdown, setOpponentBreakdown] = useState<OpponentBreakdownType | null>(null);
  const [bestPlayRecommendation, setBestPlayRecommendation] = useState<BestPlayRecommendationType | null>(null);

  const handleSituationSubmit = (situation: GameSituation) => {
    setGameSituation(situation);
    
    // Generate predictions and recommendations
    const prediction = predictPlay(situation);
    const breakdown = getOpponentBreakdown(situation.opponent);
    const recommendation = getBestPlayRecommendation(situation);
    
    setPlayPrediction(prediction);
    setOpponentBreakdown(breakdown);
    setBestPlayRecommendation(recommendation);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Chicago Bears Playcalling Engine</h1>
          <p className="subtitle">Advanced Analytics & Play Recommendations</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <GameSituationForm onSubmit={handleSituationSubmit} initialSituation={gameSituation || undefined} />
          
          <div className="results-grid">
            <div className="results-column">
              <BestPlayRecommendation recommendation={bestPlayRecommendation} />
              <PlayPrediction prediction={playPrediction} />
            </div>
            
            <div className="results-column">
              <OpponentBreakdown breakdown={opponentBreakdown} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Chicago Bears Playcalling Engine © 2024</p>
      </footer>
    </div>
  );
}

export default App;
