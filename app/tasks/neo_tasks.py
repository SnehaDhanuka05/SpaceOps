import asyncio

from app.core.db import SessionLocal
from app.services.neo_service import NEOService
from app.utils.logger import get_logger

logger = get_logger(__name__)


def sync_neo_hazards():
    logger.info("Executing sync_neo_hazards Celery task...")
    db = SessionLocal()
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    try:
        results = loop.run_until_complete(NEOService.fetch_and_store_neo(db))
        # Publish update event to Redis live channel
        from app.core.cache import redis_client
        import json
        redis_client.publish("spaceops_live_channel", json.dumps({
            "event": "neo_update",
            "count": len(results),
            "status": "success"
        }))
    except Exception as e:
        logger.error(f"Error in sync_neo_hazards Celery task: {e}")
    finally:
        db.close()

