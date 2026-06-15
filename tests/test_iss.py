import pytest
from app.models.iss import ISSTelemetry

def test_get_latest_iss_empty(client):
    response = client.get("/api/v1/iss/")
    assert response.status_code == 200
    data = response.json()
    assert "latitude" in data
    assert "longitude" in data

def test_get_latest_iss_with_data(client, db_session):
    telemetry = ISSTelemetry(latitude=45.0, longitude=-120.0, altitude=415.0, velocity=27500.0)
    db_session.add(telemetry)
    db_session.commit()
    
    response = client.get("/api/v1/iss/")
    assert response.status_code == 200
    data = response.json()
    assert data["latitude"] == 45.0
    assert data["longitude"] == -120.0

def test_sync_iss(client):
    response = client.post("/api/v1/iss/sync")
    assert response.status_code == 200
    data = response.json()
    assert "latitude" in data
    assert "longitude" in data
