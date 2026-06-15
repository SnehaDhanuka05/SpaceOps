from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional, List

# --- ISS TELEMETRY ---
class ISSTelemetryBase(BaseModel):
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    velocity: Optional[float] = None

class ISSTelemetryCreate(ISSTelemetryBase):
    pass

class ISSTelemetryResponse(ISSTelemetryBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# --- NEO HAZARDS ---
class NEOHazardBase(BaseModel):
    neo_reference_id: str
    name: str
    nasa_jpl_url: Optional[str] = None
    absolute_magnitude_h: Optional[float] = None
    estimated_diameter_km_max: Optional[float] = None
    is_potentially_hazardous_asteroid: bool
    close_approach_date: date
    miss_distance_km: Optional[float] = None
    relative_velocity_kph: Optional[float] = None

class NEOHazardResponse(NEOHazardBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- LAUNCHES ---
class LaunchBase(BaseModel):
    launch_id: str
    name: str
    provider: Optional[str] = None
    status: Optional[str] = None
    window_start: Optional[datetime] = None
    window_end: Optional[datetime] = None
    rocket_name: Optional[str] = None
    launch_pad: Optional[str] = None
    description: Optional[str] = None

class LaunchResponse(LaunchBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- SPACE WEATHER ---
class SpaceWeatherBase(BaseModel):
    event_id: str
    event_type: str
    start_time: Optional[datetime] = None
    peak_time: Optional[datetime] = None
    k_index: Optional[int] = None
    severity: Optional[str] = None
    details: Optional[str] = None

class SpaceWeatherResponse(SpaceWeatherBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- AI EXPLANATION ---
class AIExplanationRequest(BaseModel):
    data_id: str
    data_summary: str

class AIExplanationResponse(BaseModel):
    event_type: str
    data_id: str
    explanation: str
    cached: bool

