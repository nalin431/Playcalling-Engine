# Chicago Bears Playcalling Engine

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![CatBoost](https://img.shields.io/badge/ML-CatBoost-yellow)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

> A full-stack ML system that recommends NFL play calls for the Chicago Bears in real time, driven by two CatBoost models trained on 2025 play-by-play data.

**[Live Demo →](https://playcalling-engine-bears.vercel.app)**

![App Demo](docs/demo.png)

---

## How It Works

```mermaid
flowchart LR
    A["React Form\n(game situation)"] -->|"POST /recommend"| B["FastAPI\n(rate limited)"]
    B --> C["Recommendation\nService"]
    C --> D["~138 Candidate\nPlays Generated"]
    D --> E["CatBoost\nClassifier\nSuccess Prob."]
    D --> F["CatBoost\nRegressor\nExpected Yards"]
    E --> G["Policy Layer\n(context weights,\nhard constraints)"]
    F --> G
    G -->|"Top play +\n6 alternatives"| B
    B -->|JSON| A
```

Each request generates ~138 candidate plays — 3 personnel groups (11, 12, 13) × formations × run geometry (location × gap × ball carrier) + 3 personnel × formations × pass geometry (location × depth) — scores them through both models, then applies a context-aware policy layer that adjusts weights for down-and-distance, red zone, two-minute drill, and late-game scenarios before selecting the best play and up to 6 deduplicated alternatives.

---

## ML Models

Both models are trained on 2025 Chicago Bears offensive play-by-play data via `nflreadpy`, split by `game_id` to prevent data leakage.

| Model | Algorithm | Task | Eval Metric |
|-------|-----------|------|-------------|
| Success Classifier | CatBoostClassifier | Binary — did the play meet the down-specific yardage threshold? | AUC |
| Yards Regressor | CatBoostRegressor (Quantile) | Continuous — how many yards does this play gain? | MAE / RMSE |

**Success thresholds by down:**
- 1st down — gain ≥ 40% of yards to go
- 2nd down — gain ≥ 60% of yards to go
- 3rd / 4th down — full conversion

**19 input features:** `down`, `ydstogo`, `yardline_100`, `game_seconds_remaining`, `half_seconds_remaining`, `score_differential`, `posteam_timeouts_remaining`, `defteam_timeouts_remaining`, `no_huddle`, `defteam`, `posteam_type`, `play_type`, `run_location`, `run_gap`, `run_player`, `pass_location`, `pass_depth_bucket`, `shotgun`, `offense_personnel` (11 / 12 / 13)

> To see validation metrics, run `python backend/ml/training/train.py` and check the printed AUC, MAE, and RMSE output.

---

## Running Locally

### Backend
```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
# API available at http://localhost:8000
```

### Frontend
```bash
cd frontend/my-vite-app
npm install
npm run dev
# UI available at http://localhost:5173
```

Set `VITE_API_BASE=http://localhost:8000` (default) or point to your deployed backend.

---

## API

### `POST /recommend`

**Request:**
```json
{
  "down": 3,
  "distance": 7,
  "fieldPosition": 65,
  "quarter": 4,
  "timeRemaining": "02:30",
  "scoreDifference": -3,
  "opponent": "GB",
  "posteam_timeouts_remaining": 2,
  "defteam_timeouts_remaining": 1
}
```

**Response:**
```json
{
  "recommendedPlay": {
    "type": "pass",
    "shotgun": "shotgun",
    "pass_location": "middle",
    "pass_depth_bucket": "short",
    "offense_personnel": "11",
    "success_prob": 0.61,
    "expected_yards": 8.2,
    "score": 0.652341,
    "run_location": "unknown",
    "run_gap": "unknown",
    "run_player": "not_run"
  },
  "successProbability": 61.0,
  "expectedYards": 8.2,
  "riskLevel": "medium",
  "reasoning": ["Third or fourth down - prioritize conversion."],
  "alternativePlays": [...]
}
```

### `GET /health`
```json
{ "ok": true }
```

Rate limit: **60 requests / minute** per IP.

---

## Project Structure

```
backend/
  app/
    main.py               FastAPI app, CORS, rate limiting, lifespan model loading
    api/routes/           Endpoint handlers
    services/             recommendation_service.py, policy_layer.py
    core/
  ml/
    features/             build_features.py — ETL from nflreadpy
    training/             train.py — CatBoost model training
    artifacts/            Serialized model files (.pkl)
frontend/
  my-vite-app/
    src/
      components/         GameSituationForm, BestPlayRecommendation
      services/           apiService.ts
      types.ts
HealthCheck/
  ping.py                 GitHub Actions health ping (prevents Render cold starts)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript (strict), Vite, React Router |
| Backend | Python, FastAPI, slowapi (rate limiting) |
| ML | CatBoost, scikit-learn, pandas, nflreadpy |
| Deployment | Vercel (frontend), Render (backend) |
| CI | GitHub Actions (health check every 5 min) |

---

## License

MIT
