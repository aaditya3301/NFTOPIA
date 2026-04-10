import asyncio

from sqlalchemy import select

from app.models.base import async_session
from app.models.strategy import TradingStrategy
from app.services.trading_engine import TradingEngine
from app.tasks.celery_app import celery_app

engine = TradingEngine()


def _run_async(coro):
    try:
        return asyncio.run(coro)
    except RuntimeError:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()


async def _execute_all() -> dict:
    async with async_session() as db:
        result = await db.execute(select(TradingStrategy).order_by(TradingStrategy.token_id.asc()))
        strategies = result.scalars().all()

        if not strategies:
            return {"status": "ok", "executed": 0, "results": []}

        results = []
        for strategy in strategies:
            results.append(await engine.execute_strategy(db, strategy))

        return {"status": "ok", "executed": len(results), "results": results}


async def _execute_single(token_id: int) -> dict:
    async with async_session() as db:
        result = await db.execute(select(TradingStrategy).where(TradingStrategy.token_id == token_id))
        strategy = result.scalar_one_or_none()
        if not strategy:
            return {"status": "missing", "tokenId": token_id}
        outcome = await engine.execute_strategy(db, strategy)
        return {"status": "ok", **outcome}


@celery_app.task
def execute_all_strategies():
    return _run_async(_execute_all())


@celery_app.task
def execute_single_strategy(token_id: int):
    return _run_async(_execute_single(token_id))
