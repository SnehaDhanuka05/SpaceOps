from typing import Generator
from sqlalchemy.orm import Session
from redis import Redis
from app.core.db import SessionLocal
from app.core.cache import redis_client
from app.core.security import verify_api_key

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis() -> Redis:
    return redis_client
