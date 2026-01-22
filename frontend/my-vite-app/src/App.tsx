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
                      This project recommends play categories based on game situation, opponent context, and
                      model-based outcomes. It is designed to surface the best call and explain why it wins.

                      How it works
                      The engine utilizes two  models, one geared towards calling a sucessful play (as defined below) and 
                      one that maximizes 

                      Limitations
                      Unfortunetly, actual playcalls are propietary to NFL teams. This engine utilizes data from PFF and ESPN, sources 
                      which don't include data on formation, play action or screen passes. A new version is being worked on that includes
                      data from other sources, but this version, for now, focuses on the best concept of play in a given situation. 

                      


                    </p>
                    <div className="hero-definition">
                      <h3>How Sucess is Defined</h3>
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
