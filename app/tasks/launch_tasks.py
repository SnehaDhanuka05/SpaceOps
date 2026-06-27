

from app.core.db import SessionLocal
from app.services.launch_service import LaunchService
from app.utils.logger import get_logger

logger = get_logger(__name__)


from app.api.v1.websockets.connections import manager

async def sync_upcoming_launches():
    logger.info("Executing sync_upcoming_launches task...")
    db = SessionLocal()
    try:
        results = await LaunchService.fetch_and_store_launches(db)
        await manager.broadcast_json({
            "event": "launch_update",
            "count": len(results),
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Error in sync_upcoming_launches task: {e}")
    finally:
        db.close()

