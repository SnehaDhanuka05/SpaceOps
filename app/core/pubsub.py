import asyncio
import json
from app.core.cache import async_redis_client
from app.api.v1.websockets.connections import manager
from app.utils.logger import get_logger

logger = get_logger(__name__)

async def redis_pubsub_listener():
    logger.info("Starting Redis pubsub listener...")
    retry_delay = 2.0
    max_retry_delay = 30.0

    while True:
        try:
            pubsub = async_redis_client.pubsub()
            await pubsub.subscribe("spaceops_live_channel")
            logger.info("Subscribed to Redis channel 'spaceops_live_channel'")
            retry_delay = 2.0  # Reset retry delay on successful subscription

            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        await manager.broadcast_json(data)
                    except Exception as e:
                        logger.error(f"Error broadcasting message from redis pubsub: {e}")
        except asyncio.CancelledError:
            logger.info("Redis pubsub listener task cancelled")
            break
        except Exception as e:
            logger.error(f"Redis pubsub connection lost: {e}. Retrying in {retry_delay} seconds...")
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, max_retry_delay)
