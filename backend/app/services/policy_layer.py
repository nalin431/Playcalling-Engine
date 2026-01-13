from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class GameSituation:
    down: int
    distance: float
    yardline_100: float
    quarter: int
    time_remaining_seconds: int
    score_difference: int


def _normalize_probability(value: float) -> float:
    if value > 1:
        return value / 100.0
    return value


def _context_weights(situation: GameSituation) -> Dict[str, float]:
    success_weight = 0.65
    yards_weight = 0.35

    if situation.down >= 3:
        success_weight = 0.9
        yards_weight = 0.1

    if situation.yardline_100 <= 20:
        success_weight = 0.8
        yards_weight = 0.2

    if situation.quarter == 4 and situation.time_remaining_seconds <= 480 and situation.score_difference > 0:
        success_weight = 0.85
        yards_weight = 0.15

    if situation.quarter >= 3 and situation.score_difference < -7:
        success_weight = 0.55
        yards_weight = 0.45

    return {"success_weight": success_weight, "yards_weight": yards_weight}


def _estimate_risk_level(candidate: Dict[str, Any]) -> str:
    play_type = candidate.get("type", "").lower()
    depth = str(candidate.get("pass_depth_bucket", "")).lower()

    if play_type == "pass" and depth == "deep":
        return "high"
    if play_type == "run":
        return "low"
    return "medium"


def _risk_penalty(level: str) -> float:
    if level == "high":
        return 0.20
    if level == "medium":
        return 0.05
    return 0.0


def score_candidate(situation: GameSituation, candidate: Dict[str, Any]) -> float:
    weights = _context_weights(situation)
    success_prob = _normalize_probability(float(candidate.get("success_prob", 0)))
    expected_yards = float(candidate.get("expected_yards", 0))

    risk_level = _estimate_risk_level(candidate)
    risk_penalty = _risk_penalty(risk_level)

    score = (weights["success_weight"] * success_prob) + (weights["yards_weight"] * (expected_yards / 10.0))
    score -= risk_penalty
    return score


def recommend_best_play(situation: GameSituation, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not candidates:
        return {
            "recommendedPlay": None,
            "reasoning": ["No candidates available for this situation."],
            "successProbability": 0,
            "expectedYards": 0,
            "riskLevel": "medium",
            "alternativePlays": [],
        }

    scored = []
    for candidate in candidates:
        score = score_candidate(situation, candidate)
        candidate = {**candidate, "score": score}
        scored.append(candidate)

    scored.sort(key=lambda c: c["score"], reverse=True)
    best = scored[0]
    alternatives = scored[1:4]

    reasoning = []
    if situation.down >= 3:
        reasoning.append("Third or fourth down - prioritize conversion.")
    if situation.yardline_100 <= 20:
        reasoning.append("Red zone - prioritize efficiency over raw yards.")
    if situation.quarter == 4 and situation.time_remaining_seconds <= 480 and situation.score_difference > 0:
        reasoning.append("Leading late - reduce risk and keep the clock running.")
    if situation.quarter >= 3 and situation.score_difference < -7:
        reasoning.append("Trailing - lean toward higher upside plays.")

    risk_level = _estimate_risk_level(best)
    success_prob = _normalize_probability(float(best.get("success_prob", 0)))

    return {
        "recommendedPlay": best,
        "reasoning": reasoning,
        "successProbability": round(success_prob * 100, 1),
        "expectedYards": float(best.get("expected_yards", 0)),
        "riskLevel": risk_level,
        "alternativePlays": alternatives,
    }
