import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import GameSituationForm from './components/GameSituationForm';
import BestPlayRecommendation from './components/BestPlayRecommendation';
import type { GameSituation, BestPlayRecommendation as BestPlayRecommendationType } from './types';
import { getBestPlayRecommendation } from './services/apiService';
import './App.css';

function App() {
  const [gameSituation, setGameSituation] = useState<GameSituation | null>(null);
  const [bestPlayRecommendation, setBestPlayRecommendation] = useState<BestPlayRecommendationType | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  const handleSituationSubmit = async (situation: GameSituation) => {
    setGameSituation(situation);
    setBestPlayRecommendation(null);
    setIsLoadingRecommendation(true);
    
    // Generate predictions and recommendations
    const recommendation = await getBestPlayRecommendation(situation);
    
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
          <Routes>
            <Route
              path="/"
              element={
                <section className="hero">
                  <div className="hero-card">
                    <p className="hero-kicker">Bears Analytics Lab</p>
                    <h2>Playcall Engine</h2>
                    <p className="hero-blurb">
                      This project recommends play concepts based on game situation, opponent context, and
                      model-based outcomes. It is designed to surface the best call and explain why it wins.
                    </p>
                    <div className="hero-section">
                      <h3>How It Works</h3>
                      <p>
                        The engine uses two models: one predicts play success (defined below), and the other
                        estimates expected yards. A policy layer blends those scores based on game context
                        (down, distance, clock, and score) to keep recommendations realistic and situational.
                      </p>
                    </div>
                    <div className="hero-section">
                      <h3>Limitations</h3>
                      <p>
                        True NFL play calls are proprietary. This version relies on public data (PFF/ESPN),
                        which lacks formation-level detail and some play-action or screen designations. For now,
                        recommendations focus on play concepts (run/pass, depth, and direction) rather than
                        specific named plays. A new version with more features is in progress. 
                
                      </p>
                    </div>
                    <div className="hero-definition">
                      <h3>How Success Is Defined</h3>
                      <ul>
                        <li>1st down: gain at least 40% of yards to go</li>
                        <li>2nd down: gain at least 60% of yards to go</li>
                        <li>3rd/4th down: convert the full distance</li>
                      </ul>
                    </div>
                    <Link className="hero-cta" to="/engine">
                      Enter Playcall Engine
                    </Link>
                  </div>
                </section>
              }
            />
            
            <Route
              path="/engine"
              element={
                <>
                  <section className="engine">
                    <GameSituationForm onSubmit={handleSituationSubmit} initialSituation={gameSituation || undefined} />
                  </section>
                  <div className="results-grid">
                    <div className="results-column">
                      <BestPlayRecommendation
                        recommendation={bestPlayRecommendation}
                        isLoading={isLoadingRecommendation}
                      />
                    </div>
                  </div>
                </>
              }
            />
          </Routes>
        </div>
      </main>

      <footer className="app-footer">
        <p>Chicago Bears Playcalling Engine 2026</p>
      </footer>
    </div>
  );
}

export default App;
