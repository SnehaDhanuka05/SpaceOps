from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime
from app.core.db import Base

class RawAPIResponse(Base):
    __tablename__ = "raw_api_responses"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(50), nullable=False, index=True) # e.g. "iss", "neo", "launches", "space_weather"
    payload = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
