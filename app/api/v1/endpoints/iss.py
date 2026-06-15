from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.schemas import ISSTelemetryResponse
from app.services.iss_service import ISSService
from app.api.v1.websockets.connections import manager
from app.utils.logger import get_logger
import asyncio

router = APIRouter()
logger = get_logger(__name__)

@router.get("/", response_model=ISSTelemetryResponse)
def get_latest_iss(db: Session = Depends(get_db)):
    telemetry = ISSService.get_latest_telemetry(db)
    if not telemetry:
        # Fallback to fetching fresh telemetry sync synchronously
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        telemetry = loop.run_until_complete(ISSService.fetch_and_store_telemetry(db))
    return telemetry

@router.post("/sync", response_model=ISSTelemetryResponse)
async def sync_iss(db: Session = Depends(get_db)):
    telemetry = await ISSService.fetch_and_store_telemetry(db)
    # Broadcast new ISS coordinates to websocket listeners
    await manager.broadcast_json({
        "event": "iss_update",
        "latitude": telemetry.latitude,
        "longitude": telemetry.longitude,
        "altitude": telemetry.altitude,
        "velocity": telemetry.velocity,
        "timestamp": telemetry.timestamp.isoformat()
    })
    return telemetry

@router.websocket("/ws")
async def iss_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; clients can send messages or we just listen for disconnect
            data = await websocket.receive_text()
            await websocket.send_json({"message": f"Echo: {data}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)
