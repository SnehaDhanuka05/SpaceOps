import pytest
from datetime import datetime
from unittest.mock import patch
from app.models.iss import ISSTelemetry
from app.models.neo import NEOHazard
from app.models.launch import Launch
from app.models.space_weather import SpaceWeather
from app.services.iss_service import ISSService
from app.services.neo_service import NEOService
from app.services.launch_service import LaunchService
from app.services.space_weather_service import SpaceWeatherService

@pytest.mark.asyncio
async def test_iss_fallback(db_session):
    record = ISSTelemetry(latitude=10.0, longitude=20.0, altitude=420.0, velocity=27600.0)
    db_session.add(record)
    db_session.commit()
    
    with patch("app.services.external_apis.nasa_api_client.get_iss_position", side_effect=Exception("API Down")):
        result = await ISSService.fetch_and_store_telemetry(db_session)
        assert result.latitude == 10.0
        assert result.longitude == 20.0
        assert result.altitude == 420.0

@pytest.mark.asyncio
async def test_neo_fallback(db_session):
    record = NEOHazard(
        neo_reference_id="999",
        name="Fallback Asteroid",
        nasa_jpl_url="http://example.com",
        absolute_magnitude_h=18.5,
        estimated_diameter_km_max=0.2,
        is_potentially_hazardous_asteroid=False,
        close_approach_date=datetime.utcnow().date(),
        miss_distance_km=5000000.0,
        relative_velocity_kph=30000.0
    )
    db_session.add(record)
    db_session.commit()

    with patch("app.services.external_apis.nasa_api_client.get_neo_hazards", side_effect=Exception("API Down")):
        results = await NEOService.fetch_and_store_neo(db_session)
        assert len(results) == 1
        assert results[0].name == "Fallback Asteroid"
        assert results[0].neo_reference_id == "999"

@pytest.mark.asyncio
async def test_launch_fallback(db_session):
    record = Launch(
        launch_id="l-fallback",
        name="Fallback Rocket Launch",
        provider="ULA",
        status="Hold",
        window_start=datetime.utcnow(),
        window_end=datetime.utcnow(),
        rocket_name="Vulcan Centaur",
        launch_pad="SLC-41",
        description="Launch fallback test."
    )
    db_session.add(record)
    db_session.commit()

    with patch("app.services.external_apis.nasa_api_client.get_upcoming_launches", side_effect=Exception("API Down")):
        results = await LaunchService.fetch_and_store_launches(db_session)
        assert len(results) == 1
        assert results[0].name == "Fallback Rocket Launch"
        assert results[0].provider == "ULA"

@pytest.mark.asyncio
async def test_space_weather_fallback(db_session):
    record = SpaceWeather(
        event_id="solar-flr-999",
        event_type="Solar Flare",
        start_time=datetime.utcnow(),
        peak_time=datetime.utcnow(),
        severity="X9.9",
        details="Active Region 4567"
    )
    db_session.add(record)
    db_session.commit()

    with patch("app.services.external_apis.nasa_api_client.get_solar_flares", side_effect=Exception("API Down")):
        results = await SpaceWeatherService.fetch_and_store_weather(db_session)
        assert len(results) == 1
        assert results[0].event_id == "solar-flr-999"
        assert results[0].severity == "X9.9"

