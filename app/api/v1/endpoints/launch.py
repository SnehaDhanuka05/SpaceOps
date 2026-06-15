from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.models.schemas import LaunchResponse
from app.services.launch_service import LaunchService

router = APIRouter()

@router.get("/", response_model=List[LaunchResponse])
def get_launches(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return LaunchService.get_upcoming_launches(db, limit=limit)

@router.post("/sync", response_model=List[LaunchResponse])
async def sync_launches(db: Session = Depends(get_db)):
    return await LaunchService.fetch_and_store_launches(db)
