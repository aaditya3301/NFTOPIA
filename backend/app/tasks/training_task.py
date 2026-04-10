import asyncio
import json
import uuid
from pathlib import Path

from sqlalchemy import select

from app.models.agent import AgentConfig
from app.models.base import async_session
from app.models.memory import AgentMemory
from app.models.strategy import TradingStrategy
from app.tasks.celery_app import celery_app


def _run_async(coro):
    try:
        return asyncio.run(coro)
    except RuntimeError:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()


def _artifact_root() -> Path:
    return Path(__file__).resolve().parents[1] / "ml" / "models"


async def _train_custom_bot(config: dict) -> dict:
    owner = (config.get("owner_address") or "").lower()
    token_id = config.get("agent_token_id")

    async with async_session() as db:
        if token_id is None:
            res = await db.execute(
                select(AgentConfig)
                .where(AgentConfig.owner_address == owner, AgentConfig.agent_type == "trading")
                .order_by(AgentConfig.level.desc())
            )
            candidate = res.scalars().first()
            token_id = candidate.token_id if candidate else None

        if token_id is None:
            return {
                "status": "failed",
                "detail": "No trading agent found for this owner",
                "owner": owner,
            }

        strategy_res = await db.execute(select(TradingStrategy).where(TradingStrategy.token_id == token_id))
        strategy = strategy_res.scalar_one_or_none()
        if not strategy:
            strategy = TradingStrategy(
                token_id=token_id,
                strategy_type=config.get("strategy_type", "momentum"),
                assets=config.get("assets", ["BTC"]),
                timeframe=config.get("timeframe", "4h"),
                risk_params=config.get("risk_params", {}),
                indicator_config={},
                decision_model="ml_model",
            )
            db.add(strategy)
        else:
            strategy.strategy_type = config.get("strategy_type", strategy.strategy_type)
            strategy.assets = config.get("assets", strategy.assets)
            strategy.timeframe = config.get("timeframe", strategy.timeframe)
            strategy.risk_params = config.get("risk_params", strategy.risk_params)
            strategy.decision_model = "ml_model"

        artifact_dir = _artifact_root()
        artifact_dir.mkdir(parents=True, exist_ok=True)

        run_id = uuid.uuid4().hex[:10]
        model_path = artifact_dir / f"bot_{token_id}_{run_id}.json"

        artifact_payload = {
            "runId": run_id,
            "tokenId": token_id,
            "strategyType": strategy.strategy_type,
            "assets": strategy.assets,
            "timeframe": strategy.timeframe,
            "riskParams": strategy.risk_params,
            "trainer": "phase3_baseline",
        }
        model_path.write_text(json.dumps(artifact_payload, indent=2), encoding="utf-8")

        strategy.model_path = str(model_path)

        db.add(
            AgentMemory(
                token_id=token_id,
                event_type="model_trained",
                event_data={
                    "strategyType": strategy.strategy_type,
                    "assets": strategy.assets,
                    "modelPath": strategy.model_path,
                },
            )
        )

        await db.commit()

        return {
            "status": "completed",
            "detail": "training finished",
            "tokenId": token_id,
            "strategy": strategy.strategy_type,
            "assets": strategy.assets,
            "modelPath": strategy.model_path,
            "decisionModel": strategy.decision_model,
        }


@celery_app.task
def train_custom_bot(config: dict):
    return _run_async(_train_custom_bot(config))
