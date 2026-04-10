import asyncio

from app.models.base import async_session
from app.services.evolution_engine import EvolutionEngine
from app.tasks.celery_app import celery_app

engine = EvolutionEngine()


def _run_async(coro):
    try:
        return asyncio.run(coro)
    except RuntimeError:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()


async def _check_all() -> dict:
    async with async_session() as db:
        return await engine.check_all_agents(db)


@celery_app.task
def check_all_agents():
    return _run_async(_check_all())
