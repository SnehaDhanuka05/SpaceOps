from sqlalchemy import Column, Integer, String, Float, Boolean, Date
from app.core.db import Base

class NEOHazard(Base):
    __tablename__ = "neo_hazards"

    id = Column(Integer, primary_key=True, index=True)
    neo_reference_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    nasa_jpl_url = Column(String(255), nullable=True)
    absolute_magnitude_h = Column(Float, nullable=True)
    estimated_diameter_km_max = Column(Float, nullable=True)
    is_potentially_hazardous_asteroid = Column(Boolean, default=False, index=True)
    close_approach_date = Column(Date, nullable=False, index=True)
    miss_distance_km = Column(Float, nullable=True)
    relative_velocity_kph = Column(Float, nullable=True)
    explanation = Column(String(1000), nullable=True)

