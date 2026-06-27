

from app.core.db import SessionLocal
from app.services.space_weather_service import SpaceWeatherService
from app.utils.logger import get_logger

logger = get_logger(__name__)


from app.api.v1.websockets.connections import manager

async def sync_space_weather():
    logger.info("Executing sync_space_weather task...")
    db = SessionLocal()
    try:
        results = await SpaceWeatherService.fetch_and_store_weather(db)
        await manager.broadcast_json({
            "event": "weather_update",
            "count": len(results),
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Error in sync_space_weather task: {e}")
    finally:
        db.close()

