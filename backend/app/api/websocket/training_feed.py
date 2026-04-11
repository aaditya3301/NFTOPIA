import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from redis import asyncio as redis_async

from app.config import settings
from app.tasks.celery_app import celery_app

router = APIRouter()


@router.websocket("/ws/training/{training_id}")
async def training_feed(websocket: WebSocket, training_id: str) -> None:
    await websocket.accept()
    redis_client = None
    pubsub = None

    try:
        try:
            redis_client = redis_async.from_url(settings.REDIS_URL, decode_responses=True)
            pubsub = redis_client.pubsub()
            await pubsub.subscribe(f"training:{training_id}")
        except Exception:
            pubsub = None

        result = celery_app.AsyncResult(training_id)

        while True:
            payload = {
                "trainingId": training_id,
                "status": result.status,
                "ready": result.ready(),
            }

            if pubsub is not None:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.25)
                if message and message.get("data"):
                    raw_data = message["data"]
                    try:
                        payload["progress"] = json.loads(raw_data)
                    except (TypeError, json.JSONDecodeError):
                        payload["progressRaw"] = raw_data

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
                message = await asyncio.wait_for(websocket.receive_text(), timeout=1.5)
                if message.lower() in {"close", "disconnect", "stop"}:
                    await websocket.close(code=1000)
                    return
            except TimeoutError:
                pass

            result = celery_app.AsyncResult(training_id)
    except WebSocketDisconnect:
        return
    finally:
        if pubsub is not None:
            await pubsub.unsubscribe(f"training:{training_id}")
            await pubsub.close()
        if redis_client is not None:
            await redis_client.close()
