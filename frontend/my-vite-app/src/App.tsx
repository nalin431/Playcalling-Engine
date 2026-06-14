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
                    <p className="hero-kicker">Built on 2025 Chicago Bears play-by-play data</p>
                    <h2>Playcall Engine</h2>
                    <p className="hero-blurb">
                      Enter a game situation. See which play concepts gave the Bears the best chance of
                      success, ranked by outcome data.
                    </p>
                    <div className="hero-section">
                      <h3>How It Works</h3>
                      <p>
                        Two ML models score every candidate play: one predicts play success (defined below), the other
                        projects expected yards. A policy layer blends those scores by game context (down,
                        distance, clock, score, etc.) and returns the top call with up to six alternatives.
                      </p>
                    </div>
                    <div className="hero-section">
                      <h3>What the Data Shows</h3>
                      <p>
                        The 2025 Bears ran the ball very effectively. The engine and models reflects that run concepts rank
                        highly across most situations. That's not a limitation; it's what the numbers show. Recommendations are play concepts (run/pass,
                        direction, depth) drawn from a single Bears season (~19 games), so treat outputs as
                        directional, not definitive.
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
                        situation={gameSituation}
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
