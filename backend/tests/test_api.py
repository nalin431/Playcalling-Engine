import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


@pytest.fixture(scope="module")
def client():
    # Context manager runs the lifespan hook, which loads the real CatBoost models
    with TestClient(app) as c:
        yield c


def _situation(**overrides):
    situation = {
        "down": 1,
        "distance": 10,
        "fieldPosition": 75,
        "quarter": 1,
        "timeRemaining": "15:00",
        "scoreDifference": 0,
        "posteam_type": "home",
        "posteam_timeouts_remaining": 3,
        "defteam_timeouts_remaining": 3,
    }
    situation.update(overrides)
    return situation


def test_health_get(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_health_head(client):
    response = client.head("/health")

    assert response.status_code == 200


def test_recommend_returns_play(client):
    response = client.post("/recommend", json=_situation())

    assert response.status_code == 200
    body = response.json()
    assert body["recommendedPlay"] is not None
    assert body["recommendedPlay"]["type"] in {"run", "pass"}
    assert 0 <= body["successProbability"] <= 100
    assert len(body["alternativePlays"]) <= 6



def test_recommend_rejects_invalid_payload(client):
    response = client.post("/recommend", json={"down": "first"})

    assert response.status_code == 422
