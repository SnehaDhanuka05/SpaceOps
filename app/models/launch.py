from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base

class Launch(Base):
    __tablename__ = "launches"

    id = Column(Integer, primary_key=True, index=True)
    launch_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)
    window_start = Column(DateTime, nullable=True, index=True)
    window_end = Column(DateTime, nullable=True)
    rocket_name = Column(String(100), nullable=True)
    launch_pad = Column(String(100), nullable=True)
    description = Column(String(1000), nullable=True)
    explanation = Column(String(1000), nullable=True)

