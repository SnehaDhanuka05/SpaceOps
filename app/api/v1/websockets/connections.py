from fastapi import WebSocket
from typing import List
from app.utils.logger import get_logger

logger = get_logger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket client connected. Active connections count: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections count: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_json(self, data: dict):
        logger.debug(f"Broadcasting websocket data: {data}")
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                # We don't remove here to avoid modifying list during iteration;
                # instead, let disconnect handle it or clean up later

manager = ConnectionManager()
