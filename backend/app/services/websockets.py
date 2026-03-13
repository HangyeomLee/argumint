from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # debate_id -> list of websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, debate_id: int):
        await websocket.accept()
        if debate_id not in self.active_connections:
            self.active_connections[debate_id] = []
        self.active_connections[debate_id].append(websocket)

    def disconnect(self, websocket: WebSocket, debate_id: int):
        if debate_id in self.active_connections:
            self.active_connections[debate_id].remove(websocket)
            if not self.active_connections[debate_id]:
                del self.active_connections[debate_id]

    async def broadcast(self, debate_id: int, message: str):
        if debate_id in self.active_connections:
            for connection in self.active_connections[debate_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    # Handle broken pipe
                    pass

manager = ConnectionManager()
