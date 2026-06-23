from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
from app.config import settings
from app.utils.logger import get_logger
from app.utils.errors import SpaceOpsException, spaceops_exception_handler
from app.core.db import engine
from app.models import Base
from app.core.cache import ping_redis
from app.core.pubsub import redis_pubsub_listener
from app.dependencies import get_redis as get_redis_dep
from app.scheduler import start_scheduler, shutdown_scheduler
logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Starting up SpaceOps API...")
    
    # Start Redis Pub/Sub listener
    listener_task = asyncio.create_task(redis_pubsub_listener())
    
    # Start APScheduler
    start_scheduler()
    
    # Test Redis Connection
    if ping_redis():
        logger.info("Successfully connected to Redis.")
    else:
        logger.warning("Could not establish connection to Redis.")
        
    # Check DB Connection
    try:
        with engine.connect() as conn:
            logger.info("Successfully connected to database.")
        
        # Automatically create database tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        
    yield
    # Shutdown tasks
    logger.info("Shutting down SpaceOps API...")
    shutdown_scheduler()
    listener_task.cancel()
    await asyncio.gather(listener_task, return_exceptions=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Space Operations, monitoring, and telemetry.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://space-ops-phi.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(SpaceOpsException, spaceops_exception_handler)

@app.get("/health")
def health_check(redis: Redis = Depends(get_redis_dep)):
    try:
        nasa_limit = redis.get("spaceops:ratelimit:nasa:limit")
        nasa_remaining = redis.get("spaceops:ratelimit:nasa:remaining")
    except Exception:
        nasa_limit = None
        nasa_remaining = None

    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "rate_limits": {
            "nasa_limit": int(nasa_limit) if nasa_limit else None,
            "nasa_remaining": int(nasa_remaining) if nasa_remaining else None
        }
    }

# We will include api router once it's created
from app.api import api_router
app.include_router(api_router, prefix="/api")

