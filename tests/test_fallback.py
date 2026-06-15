import pytest
from unittest.mock import patch
from app.models.raw_response import RawAPIResponse
from app.services.iss_service import ISSService
from app.services.neo_service import NEOService
from app.services.launch_service import LaunchService
from app.services.space_weather_service import SpaceWeatherService

@pytest.mark.asyncio
async def test_iss_fallback(db_session):
    # Setup: add a raw cached response to the database
    raw_payload = {
        "iss_position": {"latitude": "10.0", "longitude": "20.0"},
        "message": "success",
        "timestamp": 123456
    }
    raw_record = RawAPIResponse(source="iss", payload=raw_payload)
    db_session.add(raw_record)
    db_session.commit()
    
    # Mock get_iss_position to fail
    with patch("app.services.external_apis.nasa_api_client.get_iss_position", side_effect=Exception("API Down")):
        result = await ISSService.fetch_and_store_telemetry(db_session)
        assert result.latitude == 10.0
        assert result.longitude == 20.0
        assert result.altitude == 420.0

@pytest.mark.asyncio
async def test_neo_fallback(db_session):
    raw_payload = {
        "element_count": 1,
        "near_earth_objects": {
            "2026-06-15": [
                {
                    "neo_reference_id": "999",
                    "name": "Fallback Asteroid",
                    "nasa_jpl_url": "http://example.com",
                    "absolute_magnitude_h": 18.5,
                    "estimated_diameter": {"kilometers": {"estimated_diameter_max": 0.2}},
                    "is_potentially_hazardous_asteroid": False,
                    "close_approach_data": [
                        {
                            "close_approach_date": "2026-06-15",
                            "miss_distance": {"kilometers": "5000000.0"},
                            "relative_velocity": {"kilometers_per_hour": "30000.0"}
                        }
                    ]
                }
            ]
        }
    }
    raw_record = RawAPIResponse(source="neo", payload=raw_payload)
    db_session.add(raw_record)
    db_session.commit()

    with patch("app.services.external_apis.nasa_api_client.get_neo_hazards", side_effect=Exception("API Down")):
        results = await NEOService.fetch_and_store_neo(db_session)
        assert len(results) == 1
        assert results[0].name == "Fallback Asteroid"
        assert results[0].neo_reference_id == "999"

@pytest.mark.asyncio
async def test_launch_fallback(db_session):
    raw_payload = {
        "results": [
            {
                "id": "l-fallback",
                "name": "Fallback Rocket Launch",
                "launch_service_provider": {"name": "ULA"},
                "status": {"name": "Hold"},
                "window_start": "2026-06-15T12:00:00Z",
                "window_end": "2026-06-15T13:00:00Z",
                "rocket": {"configuration": {"full_name": "Vulcan Centaur"}},
                "pad": {"name": "SLC-41"},
                "mission": {"description": "Launch fallback test."}
            }
        ]
    }
    raw_record = RawAPIResponse(source="launches", payload=raw_payload)
    db_session.add(raw_record)
    db_session.commit()

    with patch("app.services.external_apis.nasa_api_client.get_upcoming_launches", side_effect=Exception("API Down")):
        results = await LaunchService.fetch_and_store_launches(db_session)
        assert len(results) == 1
        assert results[0].name == "Fallback Rocket Launch"
        assert results[0].provider == "ULA"

@pytest.mark.asyncio
async def test_space_weather_fallback(db_session):
    raw_payload = [
        {
            "flrID": "solar-flr-999",
            "beginTime": "2026-06-15T01:00:00Z",
            "peakTime": "2026-06-15T02:00:00Z",
            "classType": "X9.9",
            "sourceLocation": "Active Region 4567"
        }
    ]
    raw_record = RawAPIResponse(source="space_weather", payload=raw_payload)
    db_session.add(raw_record)
    db_session.commit()

    with patch("app.services.external_apis.nasa_api_client.get_solar_flares", side_effect=Exception("API Down")):
        results = await SpaceWeatherService.fetch_and_store_weather(db_session)
        assert len(results) == 1
        assert results[0].event_id == "solar-flr-999"
        assert results[0].severity == "X9.9"
