from backend.app.services.recommendation_service import recommend_play
from typing import Literal
from pydantic import BaseModel
from fastapi import APIRouter, Request

router = APIRouter()

class Situation(BaseModel):
    down: int
    distance: int
    fieldPosition: int
    quarter: int
    timeRemaining: str
    scoreDifference: int
    posteam_type: Literal["home", "away"] = "home"
    posteam_timeouts_remaining: int = 3
    defteam_timeouts_remaining: int = 3



@router.post("/recommend")
def recommend(s: Situation, request: Request):
    return recommend_play(s.model_dump(), request.app.state.success_model, request.app.state.yards_model)
