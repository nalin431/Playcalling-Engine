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


def _context_weights(s: GameSituation) -> Dict[str, float]:
    # Base: success drives decisions, yards provides a small tie-breaker
    success_w, yards_w = 0.80, 0.20

    # 3rd/4th: your success label = conversion, so lean hard into it
    if s.down >= 3:
        success_w, yards_w = 0.95, 0.05

    # Red zone: efficiency / avoiding negatives matters more than raw yards
    if s.yardline_100 <= 20:
        success_w += 0.05
        yards_w -= 0.05

    # Leading late (Q4 late or OT): reduce volatility
    if (((s.quarter == 4) and (s.time_remaining_seconds <= 480)) or (s.quarter == 5)) and s.score_difference > 0:
        success_w += 0.05
        yards_w -= 0.05

    # Trailing late (Q4 late or OT): allow more upside, scaled by deficit
    if (((s.quarter == 4) and (s.time_remaining_seconds <= 600)) or (s.quarter == 5)) and s.score_difference < 0:
        deficit = min(17.0, abs(float(s.score_difference)))
        bump = 0.05 + 0.15 * (deficit / 17.0)  # 0.05..0.20
        yards_w += bump
        success_w -= bump

    #Normalize
    success_w = max(0.05, success_w)
    yards_w = max(0.02, yards_w)
    total = success_w + yards_w

    return {"success_weight": success_w / total, "yards_weight": yards_w / total}



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
        return 0.15
    if level == "medium":
        return 0.05
    return 0.0


def score_candidate(situation: GameSituation, candidate: Dict[str, Any]) -> float:
    ##No deep or medium passes within the 5 yard line
    if situation.yardline_100 <= 5 and situation.distance <= 5:
        if candidate.get("type") == "pass":
            depth = str(candidate.get("pass_depth_bucket", "")).lower()
            if depth in {"medium", "deep"}:
                return float("-inf")


    ###2 minute drill behavior
    if situation.quarter in {2, 4, 5} and situation.time_remaining_seconds <= 120 and situation.score_difference < 0:

        # Down 2+ scores late → no runs unless very short
        if situation.score_difference <= -9 and candidate.get("type") == "run" and situation.distance > 2:
            return float("-inf")

        # Need chunk fast → no short passes
        if situation.time_remaining_seconds <= 90 and situation.distance >= 10:
            if candidate.get("type") == "pass" and candidate.get("pass_depth_bucket") == "short":
                return float("-inf")



    weights = _context_weights(situation)
    success_prob = _normalize_probability(float(candidate.get("success_prob", 0)))
    expected_yards = float(candidate.get("expected_yards", 0))

    risk_level = _estimate_risk_level(candidate)
    risk_penalty = _risk_penalty(risk_level)

    score = (weights["success_weight"] * success_prob) + (weights["yards_weight"] * (expected_yards / 10.0))
    #score -= risk_penalty
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
