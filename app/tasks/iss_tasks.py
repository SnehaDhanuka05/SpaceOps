

from app.core.db import SessionLocal
from app.services.iss_service import ISSService
from app.utils.logger import get_logger

logger = get_logger(__name__)


from app.api.v1.websockets.connections import manager

async def sync_iss_position():
    logger.info("Executing sync_iss_position task...")
    db = SessionLocal()
    try:
        telemetry = await ISSService.fetch_and_store_telemetry(db)
        await manager.broadcast_json({
            "event": "iss_update",
            "latitude": telemetry.latitude,
            "longitude": telemetry.longitude,
            "altitude": telemetry.altitude,
            "velocity": telemetry.velocity,
            "timestamp": telemetry.timestamp.isoformat()
        })
    except Exception as e:
        logger.error(f"Error in sync_iss_position task: {e}")
    finally:
        db.close()

