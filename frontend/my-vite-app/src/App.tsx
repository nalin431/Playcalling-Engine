import { useState } from 'react';
import GameSituationForm from './components/GameSituationForm';
import OpponentBreakdown from './components/OpponentBreakdown';
import BestPlayRecommendation from './components/BestPlayRecommendation';
import type { GameSituation, OpponentBreakdown as OpponentBreakdownType, BestPlayRecommendation as BestPlayRecommendationType } from './types';
import { getBestPlayRecommendation } from './services/apiService';
import { getOpponentBreakdown } from './services/mockDataService';
import './App.css';

function App() {
  const [gameSituation, setGameSituation] = useState<GameSituation | null>(null);
  const [opponentBreakdown, setOpponentBreakdown] = useState<OpponentBreakdownType | null>(null);
  const [bestPlayRecommendation, setBestPlayRecommendation] = useState<BestPlayRecommendationType | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  const handleSituationSubmit = async (situation: GameSituation) => {
    setGameSituation(situation);
    setIsLoadingRecommendation(true);
    
    // Generate predictions and recommendations
    const breakdown = getOpponentBreakdown(situation.opponent);
    console.log("Submitting situation:", situation);
    const recommendation = await getBestPlayRecommendation(situation);
    
    
    setOpponentBreakdown(breakdown);
    setBestPlayRecommendation(recommendation);
    setIsLoadingRecommendation(false);
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
              <BestPlayRecommendation
                recommendation={bestPlayRecommendation}
                isLoading={isLoadingRecommendation}
              />
            </div>
            
            <div className="results-column">
              <OpponentBreakdown breakdown={opponentBreakdown} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Chicago Bears Playcalling Engine 2026</p>
      </footer>
    </div>
  );
}

export default App;
