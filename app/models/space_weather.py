from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base

class SpaceWeather(Base):
    __tablename__ = "space_weather"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    event_type = Column(String(100), nullable=False) # e.g. CME, GST (Geomagnetic Storm)
    start_time = Column(DateTime, nullable=True, index=True)
    peak_time = Column(DateTime, nullable=True)
    k_index = Column(Integer, nullable=True)
    severity = Column(String(50), nullable=True)
    details = Column(String(1000), nullable=True)
    explanation = Column(String(1000), nullable=True)

