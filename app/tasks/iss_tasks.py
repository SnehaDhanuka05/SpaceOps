import asyncio
from app.tasks.celery_app import celery_app
from app.core.db import SessionLocal
from app.services.iss_service import ISSService
from app.utils.logger import get_logger

logger = get_logger(__name__)

@celery_app.task
def sync_iss_position():
    logger.info("Executing sync_iss_position Celery task...")
    db = SessionLocal()
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    try:
        telemetry = loop.run_until_complete(ISSService.fetch_and_store_telemetry(db))
        # Publish update event to Redis live channel
        from app.core.cache import redis_client
        import json
        redis_client.publish("spaceops_live_channel", json.dumps({
            "event": "iss_update",
            "latitude": telemetry.latitude,
            "longitude": telemetry.longitude,
            "altitude": telemetry.altitude,
            "velocity": telemetry.velocity,
            "timestamp": telemetry.timestamp.isoformat()
        }))
    except Exception as e:
        logger.error(f"Error in sync_iss_position Celery task: {e}")
    finally:
        db.close()

