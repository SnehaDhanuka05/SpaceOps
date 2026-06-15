import redis
import redis.asyncio as aioredis
from app.config import settings

# Initialize Redis connection client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Async Redis client for Pub/Sub listener
async_redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

def ping_redis() -> bool:
    try:
        return redis_client.ping()
    except Exception:
        return False

