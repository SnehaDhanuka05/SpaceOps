import pytest
from datetime import datetime
from app.models.launch import Launch

def test_get_launches_empty(client):
    response = client.get("/api/v1/launches/")
    assert response.status_code == 200
    assert response.json() == []

def test_get_launches_with_data(client, db_session):
    launch = Launch(
        launch_id="test-launch-123",
        name="Falcon 9 | Starlink",
        provider="SpaceX",
        status="Go",
        window_start=datetime.utcnow(),
        window_end=datetime.utcnow(),
        rocket_name="Falcon 9",
        launch_pad="LC-39A",
        description="Starlink deployment mission."
    )
    db_session.add(launch)
    db_session.commit()
    
    response = client.get("/api/v1/launches/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Falcon 9 | Starlink"
    assert data[0]["provider"] == "SpaceX"
