export interface GameSituation {
  down: number;
  distance: number;
  fieldPosition: number; // yards from own goal line
  quarter: number;
  timeRemaining: string; // MM:SS format
  scoreDifference: number | string; // Bears score - Opponent score
  posteam_type: 'home' | 'away';
  posteam_timeouts_remaining?: number;
  defteam_timeouts_remaining?: number;
}

export interface RecommendationPlay {
  type: 'run' | 'pass';
  run_location?: string;
  run_gap?: string;
  run_player?: string;
  pass_location?: string;
  pass_depth_bucket?: string;
  success_prob?: number;
  expected_yards?: number;
  score?: number;
  shotgun?: string;
  offense_personnel?: string;
}

export interface BestPlayRecommendation {
  recommendedPlay: RecommendationPlay;
  successProbability: number;
  expectedYards: number;
  riskLevel: 'low' | 'medium' | 'high';
  alternativePlays: RecommendationPlay[];
}
