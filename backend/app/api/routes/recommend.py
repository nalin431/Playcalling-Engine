from backend.app.services.recommendation_service import recommend_play
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class Situation(BaseModel):
    down: int
    distance: int
    fieldPosition: int
    quarter: int
    timeRemaining: str
    scoreDifference: int
    opponent: str
    posteam_timeouts_remaining: int = 3
    defteam_timeouts_remaining: int = 3



@router.post("/recommend")
def recommend(s: Situation):
    return recommend_play(s.model_dump())
