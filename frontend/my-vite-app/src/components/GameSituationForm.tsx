import { useState } from 'react';
import type { GameSituation } from '../types';
import './GameSituationForm.css';

interface GameSituationFormProps {
  onSubmit: (situation: GameSituation) => void;
  initialSituation?: GameSituation;
}

export default function GameSituationForm({ onSubmit, initialSituation }: GameSituationFormProps) {
  const [situation, setSituation] = useState<GameSituation>(
    initialSituation || {
      down: 1,
      distance: 10,
      yardage: 10,
      fieldPosition: 25,
      quarter: 1,
      timeRemaining: '15:00',
      scoreDifference: 0,
      opponent: 'Packers',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(situation);
  };

  return (
    <form className="game-situation-form" onSubmit={handleSubmit}>
      <h3>Game Situation</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="down">Down</label>
          <select
            id="down"
            value={situation.down}
            onChange={(e) => setSituation({ ...situation, down: parseInt(e.target.value) })}
          >
            <option value={1}>1st</option>
            <option value={2}>2nd</option>
            <option value={3}>3rd</option>
            <option value={4}>4th</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="distance">Distance (yards)</label>
          <input
            id="distance"
            type="number"
            min="1"
            max="99"
            value={situation.distance}
            onChange={(e) => setSituation({ ...situation, distance: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="yardage">Yards to Go</label>
          <input
            id="yardage"
            type="number"
            min="1"
            max="99"
            value={situation.yardage}
            onChange={(e) => setSituation({ ...situation, yardage: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fieldPosition">Field Position (yards from goal)</label>
          <input
            id="fieldPosition"
            type="number"
            min="0"
            max="100"
            value={situation.fieldPosition}
            onChange={(e) => setSituation({ ...situation, fieldPosition: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="quarter">Quarter</label>
          <select
            id="quarter"
            value={situation.quarter}
            onChange={(e) => setSituation({ ...situation, quarter: parseInt(e.target.value) })}
          >
            <option value={1}>1st Quarter</option>
            <option value={2}>2nd Quarter</option>
            <option value={3}>3rd Quarter</option>
            <option value={4}>4th Quarter</option>
            <option value={5}>Overtime</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timeRemaining">Time Remaining (MM:SS)</label>
          <input
            id="timeRemaining"
            type="text"
            pattern="[0-9]{2}:[0-9]{2}"
            placeholder="15:00"
            value={situation.timeRemaining}
            onChange={(e) => setSituation({ ...situation, timeRemaining: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="scoreDifference">Score Difference (Bears - Opponent)</label>
          <input
            id="scoreDifference"
            type="number"
            value={situation.scoreDifference}
            onChange={(e) => setSituation({ ...situation, scoreDifference: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="opponent">Opponent</label>
          <input
            id="opponent"
            type="text"
            value={situation.opponent}
            onChange={(e) => setSituation({ ...situation, opponent: e.target.value })}
            placeholder="Packers"
          />
        </div>
      </div>

      <button type="submit" className="submit-button">
        Analyze Situation
      </button>
    </form>
  );
}

