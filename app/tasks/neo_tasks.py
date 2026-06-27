

from app.core.db import SessionLocal
from app.services.neo_service import NEOService
from app.utils.logger import get_logger

logger = get_logger(__name__)


from app.api.v1.websockets.connections import manager

async def sync_neo_hazards():
    logger.info("Executing sync_neo_hazards task...")
    db = SessionLocal()
    try:
        results = await NEOService.fetch_and_store_neo(db)
        await manager.broadcast_json({
            "event": "neo_update",
            "count": len(results),
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Error in sync_neo_hazards task: {e}")
    finally:
        db.close()

