import asyncio
from app.tasks.celery_app import celery_app
from app.core.db import SessionLocal
from app.services.launch_service import LaunchService
from app.utils.logger import get_logger

logger = get_logger(__name__)

@celery_app.task
def sync_upcoming_launches():
    logger.info("Executing sync_upcoming_launches Celery task...")
    db = SessionLocal()
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    try:
        results = loop.run_until_complete(LaunchService.fetch_and_store_launches(db))
        # Publish update event to Redis live channel
        from app.core.cache import redis_client
        import json
        redis_client.publish("spaceops_live_channel", json.dumps({
            "event": "launch_update",
            "count": len(results),
            "status": "success"
        }))
    except Exception as e:
        logger.error(f"Error in sync_upcoming_launches Celery task: {e}")
    finally:
        db.close()

