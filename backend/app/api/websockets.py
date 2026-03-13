from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websockets import manager

router = APIRouter()

@router.websocket("/ws/debates/{debate_id}")
async def websocket_endpoint(websocket: WebSocket, debate_id: int):
    await manager.connect(websocket, debate_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, debate_id)
