from fastapi import APIRouter
from app.api.v1.endpoints import iss, neo, launch, space_weather, ai

v1_router = APIRouter()

v1_router.include_router(iss.router, prefix="/iss", tags=["ISS Tracker"])
v1_router.include_router(neo.router, prefix="/neo", tags=["NEO Hazards"])
v1_router.include_router(launch.router, prefix="/launches", tags=["Launch Schedule"])
v1_router.include_router(space_weather.router, prefix="/space-weather", tags=["Space Weather"])
v1_router.include_router(ai.router, prefix="/ai", tags=["AI Analysis"])
