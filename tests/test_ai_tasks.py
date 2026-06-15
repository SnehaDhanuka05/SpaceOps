import pytest
from datetime import datetime
from unittest.mock import patch
from app.models.neo import NEOHazard
from app.models.launch import Launch
from app.models.space_weather import SpaceWeather
from app.tasks.ai_tasks import generate_ai_explanations

def test_generate_ai_explanations_task(db_session):
    # 1. Setup DB entries lacking explanations
    neo = NEOHazard(
        neo_reference_id="neo-t-1",
        name="Test Asteroid",
        close_approach_date=datetime.utcnow().date(),
        is_potentially_hazardous_asteroid=False
    )
    launch = Launch(
        launch_id="launch-t-1",
        name="Test Launch",
    )
    weather = SpaceWeather(
        event_id="weather-t-1",
        event_type="Solar Flare",
    )
    db_session.add_all([neo, launch, weather])
    db_session.commit()
    
    # 2. Mock redis client publish and AIService response
    with patch("app.tasks.ai_tasks.redis_client.publish") as mock_publish, \
         patch("app.services.ai_service.redis_client.get", return_value=None), \
         patch("app.services.ai_service.ollama_provider.explain", return_value="Explanation success"):
         
         # Execute task synchronously with test session
         generate_ai_explanations(db=db_session)
         
         # Re-fetch models from db and check explanations
         db_session.expire_all()
         updated_neo = db_session.query(NEOHazard).filter(NEOHazard.neo_reference_id == "neo-t-1").first()
         updated_launch = db_session.query(Launch).filter(Launch.launch_id == "launch-t-1").first()
         updated_weather = db_session.query(SpaceWeather).filter(SpaceWeather.event_id == "weather-t-1").first()
         
         assert updated_neo.explanation == "Explanation success"
         assert updated_launch.explanation == "Explanation success"
         assert updated_weather.explanation == "Explanation success"
         
         # Check pub/sub messages were published (3 events total)
         assert mock_publish.call_count == 3
