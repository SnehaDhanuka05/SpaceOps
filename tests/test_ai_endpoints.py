import pytest
from unittest.mock import patch

def test_explain_space_weather_endpoint(client):
    with patch("app.services.ai_service.redis_client.get", return_value=None), \
         patch("app.services.ai_service.ollama_provider.explain", return_value="Test solar flare summary"):
        response = client.post(
            "/api/v1/ai/explain/space-weather",
            json={"data_id": "solar-1", "data_summary": "Solar storm activity"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["event_type"] == "space-weather"
        assert data["data_id"] == "solar-1"
        assert data["explanation"] == "Test solar flare summary"
        assert data["cached"] is False

def test_explain_neo_endpoint(client):
    with patch("app.services.ai_service.redis_client.get", return_value="Cached NEO summary"):
        response = client.post(
            "/api/v1/ai/explain/neo",
            json={"data_id": "neo-1", "data_summary": "Large asteroid close approach"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["event_type"] == "neo"
        assert data["data_id"] == "neo-1"
        assert data["explanation"] == "Cached NEO summary"
        assert data["cached"] is True

def test_explain_launch_endpoint(client):
    with patch("app.services.ai_service.redis_client.get", return_value=None), \
         patch("app.services.ai_service.ollama_provider.explain", return_value="Test launch briefing"):
        response = client.post(
            "/api/v1/ai/explain/launch",
            json={"data_id": "launch-1", "data_summary": "Falcon Heavy launch"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["event_type"] == "launch"
        assert data["data_id"] == "launch-1"
        assert data["explanation"] == "Test launch briefing"
        assert data["cached"] is False
