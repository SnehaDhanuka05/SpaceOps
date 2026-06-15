import pytest

def test_websocket_iss(client):
    with client.websocket_connect("/api/v1/iss/ws") as websocket:
        websocket.send_text("Hello SpaceOps")
        data = websocket.receive_json()
        assert data == {"message": "Echo: Hello SpaceOps"}
