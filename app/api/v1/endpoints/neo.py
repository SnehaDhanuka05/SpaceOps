from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.models.schemas import NEOHazardResponse
from app.services.neo_service import NEOService

router = APIRouter()

@router.get("/", response_model=List[NEOHazardResponse])
def get_neo_hazards(
    hazardous_only: bool = Query(False, description="Filter for potentially hazardous objects only"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return NEOService.get_hazards(db, hazardous_only=hazardous_only, limit=limit)

@router.post("/sync", response_model=List[NEOHazardResponse])
async def sync_neo_hazards(db: Session = Depends(get_db)):
    return await NEOService.fetch_and_store_neo(db)
