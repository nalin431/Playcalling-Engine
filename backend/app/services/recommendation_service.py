from __future__ import annotations

from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List
import pandas as pd

import joblib

from .policy_layer import GameSituation, recommend_best_play

ARTIFACTS_DIR = Path(__file__).resolve().parents[2] / "ml" / "artifacts"
SUCCESS_MODEL_PATH = ARTIFACTS_DIR / "success_classifier_CatBoost_pipeline.pkl"
YARDS_MODEL_PATH = ARTIFACTS_DIR / "yards_gained_pipeline.pkl"


def _parse_time_remaining(time_remaining: str) -> int:
    try:
        minutes, seconds = time_remaining.split(":")
        return int(minutes) * 60 + int(seconds)
    except ValueError:
        return 0


def _load_models() -> tuple[Any, Any]:
    success_model = joblib.load(SUCCESS_MODEL_PATH)
    yards_model = joblib.load(YARDS_MODEL_PATH)
    return success_model, yards_model


def _base_features(situation: Dict[str, Any]) -> Dict[str, Any]:
    time_remaining_seconds = _parse_time_remaining(situation.get("timeRemaining", "0:00"))

    return {
        "down": situation.get("down"),
        "ydstogo": situation.get("distance"),
        "yardline_100": situation.get("fieldPosition"),
        "game_seconds_remaining": time_remaining_seconds + (4 - situation.get("quarter", 1)) * 900,
        "half_seconds_remaining": time_remaining_seconds + (2 - ((situation.get("quarter", 1) - 1) % 2 + 1)) * 900,
        "score_differential": situation.get("scoreDifference"),
        "posteam_timeouts_remaining": situation.get("posteam_timeouts_remaining", 3),
        "defteam_timeouts_remaining": situation.get("defteam_timeouts_remaining", 3),
        "no_huddle": 0,
        "defteam": situation.get("opponent"),
        "posteam_type": "home",
    }


def _generate_candidates(base: Dict[str, Any]) -> List[Dict[str, Any]]:
    candidates: List[Dict[str, Any]] = []

    run_locations = ["left", "middle", "right"]
    run_gaps = ["guard", "tackle", "end"]
    run_players = ["D.Swift", "K.Monangai"]
    pass_locations = ["left", "middle", "right"]
    pass_depths = ["short", "medium", "deep"]
    shotgun = ["shotgun", "under_center"]

    for formation in shotgun:
        for location in run_locations:
            for gap in run_gaps:
                for player in run_players:
                    candidates.append(
                        {
                            **base,
                            "play_type": "run",
                            "run_location": location,
                            "run_gap": gap,
                            "run_player": player,
                            "pass_location": "unknown",
                            "pass_depth_bucket": "not_pass",
                            "shotgun": formation
                        }
                    )

    for formation in shotgun:
        for location in pass_locations:
            for depth in pass_depths:
                candidates.append(
                    {
                        **base,
                        "play_type": "pass",
                        "run_location": "unknown",
                        "run_gap": "unknown",
                        "run_player": "not_run",
                        "pass_location": location,
                        "pass_depth_bucket": depth,
                        "shotgun": formation
                    }
                )

    return candidates


def recommend_play(situation: Dict[str, Any]) -> Dict[str, Any]:
    base = _base_features(situation)
    candidates = _generate_candidates(base)
    success_model, yards_model = _load_models()

    scored_candidates: List[Dict[str, Any]] = []
    for candidate in candidates:
        X = pd.DataFrame([candidate])
        success_prob = float(success_model.predict_proba(X)[0][1])
        expected_yards = float(yards_model.predict(X)[0])

        scored_candidates.append(
            {
                "type": candidate["play_type"],
                "run_location": candidate.get("run_location"),
                "run_gap": candidate.get("run_gap"),
                "run_player": candidate.get("run_player"),
                "pass_location": candidate.get("pass_location"),
                "pass_depth_bucket": candidate.get("pass_depth_bucket"),
                "shotgun": candidate.get("shotgun"),
                "success_prob": success_prob,
                "expected_yards": expected_yards,
            }
        )

    policy_situation = GameSituation(
        down=int(base["down"]),
        distance=float(base["ydstogo"]),
        yardline_100=float(base["yardline_100"]),
        quarter=int(situation.get("quarter", 1)),
        time_remaining_seconds=int(_parse_time_remaining(situation.get("timeRemaining", "0:00"))),
        score_difference=int(base["score_differential"]),
    )


    
    return recommend_best_play(policy_situation, scored_candidates)


if __name__ == "__main__":
    sample = {
        "down": 1,
        "distance": 10,
        "fieldPosition": 63,
        "quarter": 3,
        "timeRemaining": "08:09",
        "scoreDifference": 0,
        "opponent": "GB",
    }

    test = recommend_play(sample)
    print(test)

