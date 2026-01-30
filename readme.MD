## Chicago Bears Playcalling Engine

This project is a Bears-focused playcall recommendation engine. It uses a backend
API to score play concepts (run/pass, depth, direction, formation) and a frontend
UI to submit game situations and display recommendations.

### What "Success" Means
- 1st down: gain at least 40% of yards to go
- 2nd down: gain at least 60% of yards to go
- 3rd/4th down: convert the full distance

### Project Structure
```
backend/
  app/                  FastAPI API, services, policy layer
  ml/                   data prep, training, evaluation, artifacts
frontend/
  my-vite-app/          React + Vite UI
```

### Backend (FastAPI)
Key files:
- `backend/app/main.py` - FastAPI app, CORS, rate limiting, health check
- `backend/app/api/routes/recommend.py` - `/recommend` endpoint
- `backend/app/services/recommendation_service.py` - candidate generation + model scoring
- `backend/app/services/policy_layer.py` - scoring/selection logic

**Endpoints**
- `POST /recommend` - returns a recommendation payload
- `GET /health` - health check

**Rate limiting**
Global limit is set in `backend/app/main.py` using `slowapi`.

### ML / Models
Key files:
-A- saved models and datasets

Models currently used:
- Success classifier (CatBoost)
- Yards regressor (CatBoost)

### Frontend (React)
Key files:
- `frontend/my-vite-app/src/App.tsx` - routing (`/` landing, `/engine` app)
- `frontend/my-vite-app/src/components/GameSituationForm.tsx` - form inputs
- `frontend/my-vite-app/src/components/BestPlayRecommendation.tsx` - display output
- `frontend/my-vite-app/src/services/apiService.ts` - API client

### Running Locally
Backend:
```
uvicorn backend.app.main:app --reload
```

Frontend:
```
cd frontend/my-vite-app
npm install
npm run dev
```

### Notes
- Frontend calls the backend at `http://localhost:8000`.
- Update CORS origins in `backend/app/main.py` if you deploy to a different URL.
- The frontend is hosted on Vercel (see `frontend/my-vite-app/vercel.json` for deployment config).
- Early experiments used scikit-learn baselines, but CatBoost produced higher accuracy for this dataset.
