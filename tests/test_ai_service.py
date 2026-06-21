import pytest
from unittest.mock import patch, MagicMock
from app.services.ai_service import groq_provider, AIService

def test_prompt_building():
    prompt = groq_provider._build_prompt("space-weather", "Class X Solar Flare")
    assert "space weather" in prompt.lower()
    
    prompt_neo = groq_provider._build_prompt("neo", "Asteroid approaching")
    assert "orbital hazard" in prompt_neo.lower()

    prompt_launch = groq_provider._build_prompt("launch", "Falcon 9 heading to orbit")
    assert "space launch" in prompt_launch.lower()

@pytest.mark.asyncio
async def test_explanation_generation_fresh():
    with patch("app.services.ai_service.redis_client.get", return_value=None) as mock_redis_get, \
         patch("app.services.ai_service.redis_client.setex") as mock_redis_setex, \
         patch("app.services.ai_service.groq_provider.explain", return_value="A critical solar flare was observed.") as mock_explain:
         
        explanation, cached = await AIService.get_explanation("space-weather", "evt-123", "Class X Solar Flare")
        assert explanation == "A critical solar flare was observed."
        assert cached is False
        mock_explain.assert_called_once_with("space-weather", "Class X Solar Flare")
        mock_redis_get.assert_called_once()
        mock_redis_setex.assert_called_once()

@pytest.mark.asyncio
async def test_explanation_caching():
    with patch("app.services.ai_service.redis_client.get", return_value="Cached solar storm summary") as mock_redis_get, \
         patch("app.services.ai_service.groq_provider.explain") as mock_explain:
         
        explanation, cached = await AIService.get_explanation("space-weather", "evt-123", "Class X Solar Flare")
        assert explanation == "Cached solar storm summary"
        assert cached is True
        mock_explain.assert_not_called()
        mock_redis_get.assert_called_once()
