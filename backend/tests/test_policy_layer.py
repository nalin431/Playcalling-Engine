from backend.app.services.policy_layer import GameSituation, recommend_best_play, score_candidate

SITUATION = GameSituation(
    down=1,
    distance=10,
    yardline_100=75,
    quarter=1,
    time_remaining_seconds=900,
    score_difference=0,
)


def _candidate(play_type, success_prob, expected_yards, **extra):
    return {
        "type": play_type,
        "success_prob": success_prob,
        "expected_yards": expected_yards,
        **extra,
    }


def test_empty_candidates_returns_empty_response():
    result = recommend_best_play(SITUATION, [])

    assert result["recommendedPlay"] is None
    assert result["alternativePlays"] == []
    assert result["successProbability"] == 0
    assert result["expectedYards"] == 0


def test_top_play_is_highest_scoring_candidate():
    candidates = [
        _candidate("run", 0.40, 3.0, run_location="left", run_gap="tackle"),
        _candidate("pass", 0.65, 7.0, pass_location="middle", pass_depth_bucket="short"),
        _candidate("pass", 0.30, 12.0, pass_location="right", pass_depth_bucket="deep"),
        _candidate("run", 0.55, 4.5, run_location="right", run_gap="guard"),
    ]

    result = recommend_best_play(SITUATION, candidates)

    expected_best = max(candidates, key=lambda c: score_candidate(SITUATION, c))
    best = result["recommendedPlay"]
    assert best["type"] == expected_best["type"]
    assert best["success_prob"] == expected_best["success_prob"]
    assert best["score"] == max(score_candidate(SITUATION, c) for c in candidates)
