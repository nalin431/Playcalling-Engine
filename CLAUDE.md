# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chicago Bears Playcalling Engine — a full-stack web app that recommends NFL play calls based on game situation. A FastAPI backend runs two CatBoost ML models (success classifier + yards regressor) through a policy layer that applies context-aware weights and hard constraints, then returns the top play with alternatives. A React/TypeScript frontend collects the game situation and displays results. End goal is a working system that provides useful insights to the Chicago Bears. 

## Commands

### Backend
```bash
# Run the API server (from repo root)
uvicorn backend.app.main:app --reload

# Train ML models
python backend/ml/training/train.py

# Evaluate models
python backend/ml/evaluation/evaluate.py

# Install dependencies
pip install -r requirements.txt
```

### Frontend (from `frontend/my-vite-app/`)
```bash
npm install
npm run dev        # Dev server on port 5173
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Architecture

### Request Flow
`POST /recommend` → `recommendation_service.py` → `policy_layer.py` → response

1. **Candidate generation** (`recommendation_service.py`): Builds ~36 candidate plays (18 runs × formations/locations/gaps/players + 18 passes × formations/locations/depths), then scores each using the loaded CatBoost pipelines.
2. **Policy layer** (`policy_layer.py`): Applies context-aware scoring weights (default 80% success / 20% yards), adjusts for 3rd/4th down, red zone, and late-game scenarios, enforces hard constraints (e.g., no deep passes inside the 5-yard line), then returns the top play + 3 alternatives with reasoning text.

### ML Models (`backend/ml/`)
- `artifacts/success_classifier_CatBoost_pipeline.pkl` — predicts play success (down-specific threshold: 1st=40% yards gained, 2nd=60%, 3rd/4th=full conversion)
- `artifacts/yards_gained_pipeline.pkl` — regresses expected yards
- Both are sklearn `Pipeline` objects with `OneHotEncoder` for categoricals and `StandardScaler` for numerics, trained on historical Bears play data via `nflreadpy`

### API
- `GET /health` — health check, returns `{"ok": true}`; supports HEAD (used by GitHub Actions cron)
- `POST /recommend` — main inference endpoint; rate limited at 60 req/min per IP via `slowapi`
- CORS allows `localhost:5173`, `localhost:4173`, and the Vercel production URL

### Frontend (`frontend/my-vite-app/src/`)
- Two routes: `/` (landing/explanation) and `/engine` (main form)
- `GameSituationForm.tsx` — collects down, distance, field position, quarter, time remaining, score difference, opponent, timeouts
- `BestPlayRecommendation.tsx` — displays recommended play, success probability, expected yards, risk level, reasoning, and alternatives
- API calls go through `services/apiService.ts`; the base URL is controlled by the `VITE_API_BASE` env var (defaults to `http://localhost:8000`)

### CI/CD
- `.github/workflows/healthcheckping.yml` pings the backend health endpoint every 5 minutes via `HealthCheck/ping.py`; backend URL stored in GitHub secrets as `BACKEND_URL`
- Frontend is deployed to Vercel; `frontend/my-vite-app/vercel.json` configures SPA routing rewrites
