from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.models.schemas import SpaceWeatherResponse
from app.services.space_weather_service import SpaceWeatherService

router = APIRouter()

@router.get("/", response_model=List[SpaceWeatherResponse])
def get_weather(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return SpaceWeatherService.get_weather_alerts(db, limit=limit)

@router.post("/sync", response_model=List[SpaceWeatherResponse])
async def sync_weather(db: Session = Depends(get_db)):
    return await SpaceWeatherService.fetch_and_store_weather(db)
