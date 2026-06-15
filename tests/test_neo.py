import pytest
from datetime import datetime
from app.models.neo import NEOHazard

def test_get_neo_hazards_empty(client):
    response = client.get("/api/v1/neo/")
    assert response.status_code == 200
    assert response.json() == []

def test_get_neo_hazards_with_data(client, db_session):
    neo = NEOHazard(
        neo_reference_id="3542519",
        name="Asteroid 1",
        estimated_diameter_km_max=0.5,
        is_potentially_hazardous_asteroid=True,
        close_approach_date=datetime.utcnow().date(),
        miss_distance_km=1500000.0,
        relative_velocity_kph=45000.0
    )
    db_session.add(neo)
    db_session.commit()
    
    response = client.get("/api/v1/neo/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Asteroid 1"
    assert data[0]["is_potentially_hazardous_asteroid"] is True
