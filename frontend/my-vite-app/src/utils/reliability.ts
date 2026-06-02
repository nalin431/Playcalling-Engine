import type { GameSituation } from '../types';

// ─── Training-data thresholds ────────────────────────────────────────────────
// All counts reference the 1,248-play 2025 Bears PBP dataset used for training.

/** ydstogo > LONG_YARDAGE_THRESHOLD: 35 plays (2.8% of training set) */
const LONG_YARDAGE_THRESHOLD = 15;

/** ydstogo > EXTREME_YARDAGE_THRESHOLD on down ≤ 2: 8 plays; 1st-down max ever seen = 25 */
const EXTREME_YARDAGE_THRESHOLD = 20;

/** 4th down total: 41 plays (3.3%) */
const FOURTH_DOWN = 4;

/** |score_differential| > BLOWOUT_THRESHOLD: 33 plays */
const BLOWOUT_THRESHOLD = 21;

/**
 * yardline_100 ≤ GOAL_LINE_THRESHOLD: ~21 plays inside the opponent 2
 * NOTE: fieldPosition is passed by the frontend directly as yardline_100
 * (yards to opponent's end zone). The backend maps fieldPosition → yardline_100
 * 1-to-1, so no transformation is needed here.
 */
const GOAL_LINE_THRESHOLD = 2;

/** yardline_100 ≥ BACKED_UP_THRESHOLD: ~10 plays — essentially unseen */
const BACKED_UP_THRESHOLD = 95;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a list of human-readable reason strings explaining why a game
 * situation falls outside the model's reliable training range.
 * An empty array means the situation is within the well-sampled region.
 */
export function getReliabilityWarnings(s: GameSituation): string[] {
  const warnings: string[] = [];

  const { down, distance, fieldPosition } = s;

  // scoreDifference arrives as number | string — coerce defensively
  const scoreDiff = Number(s.scoreDifference);

  if (distance > LONG_YARDAGE_THRESHOLD) {
    warnings.push('long-yardage downs (more than 15 to go) are rare in the training data');
  }

  if (down <= 2 && distance > EXTREME_YARDAGE_THRESHOLD) {
    warnings.push('this distance on an early down was never seen in the training data');
  }

  if (down === FOURTH_DOWN) {
    warnings.push('4th-down decisions are based on only ~41 plays');
  }

  if (!isNaN(scoreDiff) && Math.abs(scoreDiff) > BLOWOUT_THRESHOLD) {
    warnings.push('lopsided score margins are uncommon in the data');
  }

  // fieldPosition is used by the backend directly as yardline_100 (yards to
  // opponent end zone). ≤ 2 means the offense is inside the opponent's 2.
  if (fieldPosition <= GOAL_LINE_THRESHOLD) {
    warnings.push('snaps inside the 2-yard line are rare');
  }

  // ≥ 95 means the offense is backed up within its own 5 (opponent is 95+ away)
  if (fieldPosition >= BACKED_UP_THRESHOLD) {
    warnings.push('being backed up near your own goal line is almost never seen');
  }

  return warnings;
}
