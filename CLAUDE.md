# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chicago Bears Playcalling Engine — a full-stack web app that recommends NFL play calls based on game situation. A FastAPI backend runs two CatBoost ML models (success classifier + yards regressor) through a policy layer that applies context-aware weights and hard constraints, then returns the top play with alternatives. A React/TypeScript frontend collects the game situation and displays results. End goal is a working system that provides useful insights to the Chicago Bears.

**Important — prescriptive, not descriptive:** The engine recommends what play concepts had the highest success rate and most yards gained in the Bears' 2025 data for a given situation. It does NOT reflect what the Bears historically called or tend to call — it reflects what worked best when they did call it. The models are trained on plays the Bears actually ran, so they score play concepts within the Bears' observed distribution; they have no counterfactual knowledge of plays never attempted. Run-heavy outputs in many situations are a product of which play types succeeded at higher rates in that single-season dataset, not a reflection of playcalling tendencies.

The engine is opponent-agnostic and situation-driven; `defteam` (opponent team abbreviation) was removed from the feature set because it contributed only ~0.02 AUC and was learned from a single season of data (~19 games). The `reasoning` field was also removed — it was hand-written situational copy, not a real model attribution.

## Commands

### Backend
```bash
# Run the API server (from repo root)
uvicorn backend.app.main:app --reload

# Train ML models (also prints validation AUC, MAE, RMSE)
python backend/ml/training/train.py

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

1. **Candidate generation** (`recommendation_service.py`): Builds ~138 candidate plays — 84 runs (3 personnel groups `["11","12","13"]` × 2 formations × [2 directed locations × 3 gaps + middle × "unknown"] × 2 ball carriers) + 54 passes (3 personnel × 2 formations × 3 locations × 3 depths) — then scores each using the loaded CatBoost models via a single batched DataFrame call. Middle runs use `run_gap="unknown"` to match the NFL PBP training distribution (middle runs have no recorded gap).
2. **Policy layer** (`policy_layer.py`): Applies context-aware scoring weights (default 80% success / 20% yards), adjusts for 3rd/4th down, red zone, and late-game scenarios, enforces hard constraints (no medium/deep passes inside the 5-yard line; run/short-pass suppression in 2-minute drill when trailing), then returns the top play + up to 6 alternatives. Alternatives are deduplicated by concept key (max 2 per run-location/gap or pass-location/depth grouping) from the top 40 candidates.

### ML Models (`backend/ml/`)
- `artifacts/success_classifier_CatBoost_pipeline.pkl` — raw `CatBoostClassifier`; predicts play success (down-specific threshold: 1st=40% yards gained, 2nd=60%, 3rd/4th=full conversion)
- `artifacts/yards_gained_pipeline.pkl` — raw `CatBoostRegressor` (quantile); regresses expected yards
- Both accept DataFrames directly with native categorical handling (no sklearn preprocessing wrapper). 18 input features: `down`, `ydstogo`, `yardline_100`, `game_seconds_remaining`, `half_seconds_remaining`, `score_differential`, `posteam_timeouts_remaining`, `defteam_timeouts_remaining`, `no_huddle`, `posteam_type` (user-provided: home/away), `play_type`, `run_location`, `run_gap`, `run_player`, `pass_location`, `pass_depth_bucket`, `shotgun`, `offense_personnel`
- Trained on 2025 Chicago Bears play-by-play data via `nflreadpy`; split by `game_id` to prevent leakage.

### API
- `GET /health` — health check, returns `{"ok": true}`; supports HEAD (used by GitHub Actions cron)
- `POST /recommend` — main inference endpoint; rate limited at 60 req/min per IP via `slowapi`
- CORS allows `localhost:5173`, `localhost:4173`, and the Vercel production URL

### Frontend (`frontend/my-vite-app/src/`)
- Two routes: `/` (landing/explanation) and `/engine` (main form)
- `GameSituationForm.tsx` — collects down, distance, field position, quarter, time remaining, score difference, home/away (posteam_type), and both teams' timeouts. No opponent text field.
- `BestPlayRecommendation.tsx` — displays recommended play, success probability, projected yards (median), model score, risk level, and up to 6 alternative plays. Shows an offense personnel badge (e.g. "11 Personnel (1 RB / 1 TE)") on the recommended play and each alternative. `formatPlay` suppresses the `"unknown"` gap sentinel so middle runs render as `RUN - SHOTGUN - MIDDLE - D.Swift`. A subtle confidence footnote on the card notes the single-season scope.
- API calls go through `services/apiService.ts`; the base URL is controlled by the `VITE_API_BASE` env var (defaults to `http://localhost:8000`)

### CI/CD
- `.github/workflows/healthcheckping.yml` pings the backend health endpoint every 5 minutes via `HealthCheck/ping.py`; backend URL stored in GitHub secrets as `BACKEND_URL`
- Frontend is deployed to Vercel; `frontend/my-vite-app/vercel.json` configures SPA routing rewrites
