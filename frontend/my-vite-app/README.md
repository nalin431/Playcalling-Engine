# Chicago Bears Playcalling Engine

A React-based frontend application for the Chicago Bears playcalling engine. This application provides advanced analytics and play recommendations based on game situations, opponent analysis, and historical performance data.

## Features

### 1. Play Prediction
Predicts what play the Bears will run based on various game factors including:
- Down and distance
- Field position
- Game situation (quarter, time, score)
- Historical play patterns

### 2. Opponent Breakdown
Provides detailed analysis of the opponent's defense including:
- Defensive ratings (run defense, pass defense)
- Blitz frequency
- Coverage tendencies
- Strengths and weaknesses
- Recent defensive formations

### 3. Best Play Recommendation (Main Feature)
Recommends the optimal play to call based on:
- Current down, distance, and yardage
- Position in the game (quarter, time remaining, score)
- Most successful plays throughout the season for the Bears
- Most successful plays against the specific opponent
- Risk assessment and success probability
- Alternative play options

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with Bears-themed design (Navy Blue #0B162A and Orange #C83803)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
cd frontend/my-vite-app
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── BestPlayRecommendation.tsx    # Main recommendation component
│   ├── GameSituationForm.tsx         # Input form for game situation
│   ├── OpponentBreakdown.tsx          # Opponent analysis display
│   └── PlayPrediction.tsx             # Play prediction display
├── services/
│   └── mockDataService.ts            # Mock data and logic (to be replaced with backend)
├── types.ts                           # TypeScript type definitions
├── App.tsx                            # Main application component
└── main.tsx                           # Application entry point
```

## Usage

1. Enter the current game situation using the form:
   - Down (1st-4th)
   - Distance and yards to go
   - Field position
   - Quarter and time remaining
   - Score difference
   - Opponent name

2. Click "Analyze Situation" to get:
   - **Best Play Recommendation**: The optimal play to call with reasoning
   - **Play Prediction**: What play the Bears are likely to run
   - **Opponent Breakdown**: Analysis of the opponent's defense

## Future Enhancements

- Backend API integration for real-time data
- Historical play database
- Machine learning models for predictions
- Real-time game data integration
- Advanced analytics and visualizations

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
