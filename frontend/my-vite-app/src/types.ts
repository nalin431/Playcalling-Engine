export interface GameSituation {
  down: number;
  distance: number;
  yardage: number; // yards to go
  fieldPosition: number; // yards from own goal line
  quarter: number;
  timeRemaining: string; // MM:SS format
  scoreDifference: number; // Bears score - Opponent score
  opponent: string;
}

export interface Play {
  id: string;
  type: 'run' | 'pass' | 'play-action' | 'screen' | 'trick';
  formation: string;
  description: string;
  successRate: number; // percentage
  yardsPerPlay: number;
  usageCount: number;
}

export interface PlayPrediction {
  predictedPlay: Play;
  confidence: number;
  factors: string[];
}

export interface OpponentBreakdown {
  opponent: string;
  defensiveTendencies: {
    runDefense: number; // rating 1-100
    passDefense: number;
    blitzFrequency: number; // percentage
    coverageType: 'man' | 'zone' | 'mixed';
  };
  weaknesses: string[];
  strengths: string[];
  recentFormation: string;
}

export interface BestPlayRecommendation {
  recommendedPlay: Play;
  reasoning: string[];
  successProbability: number;
  expectedYards: number;
  riskLevel: 'low' | 'medium' | 'high';
  alternativePlays: Play[];
}

