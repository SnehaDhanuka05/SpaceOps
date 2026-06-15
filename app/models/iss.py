from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from app.core.db import Base

class ISSTelemetry(Base):
    __tablename__ = "iss_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    velocity = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
