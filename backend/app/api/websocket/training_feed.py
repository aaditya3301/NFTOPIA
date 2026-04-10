import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.tasks.celery_app import celery_app

router = APIRouter()


@router.websocket("/ws/training/{training_id}")
async def training_feed(websocket: WebSocket, training_id: str) -> None:
    await websocket.accept()
    try:
        result = celery_app.AsyncResult(training_id)

        while True:
            payload = {
                "trainingId": training_id,
                "status": result.status,
                "ready": result.ready(),
            }

            if result.ready():
                if result.successful():
                    payload["result"] = result.result
                else:
                    payload["error"] = str(result.result)

            await websocket.send_json(
                payload
            )

            if result.ready():
                await websocket.close(code=1000)
                return

            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=2.0)
                if message.lower() in {"close", "disconnect", "stop"}:
                    await websocket.close(code=1000)
                    return
            except TimeoutError:
                continue

            result = celery_app.AsyncResult(training_id)
    except WebSocketDisconnect:
        return
