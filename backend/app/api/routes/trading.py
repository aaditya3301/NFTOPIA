from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models.agent import AgentConfig
from app.models.allocation import Allocation
from app.models.memory import AgentMemory
from app.models.strategy import TradingStrategy
from app.models.trade import TradeLog
from app.schemas.trading import AllocationRequest, CustomBotConfig
from app.tasks.training_task import train_custom_bot

router = APIRouter()


@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        select(AgentConfig, TradingStrategy)
        .join(TradingStrategy, AgentConfig.token_id == TradingStrategy.token_id)
        .where(AgentConfig.agent_type == "trading")
        .where(TradingStrategy.is_marketplace_listed.is_(True))
        .order_by(TradingStrategy.total_pnl.desc())
    )

    rows = result.all()
    return [
        {
            "rank": i + 1,
            "tokenId": agent.token_id,
            "specialization": agent.specialization,
            "level": agent.level,
            "traits": agent.traits,
            "strategyType": strategy.strategy_type,
            "assets": strategy.assets,
            "totalTrades": strategy.total_trades,
            "winRate": strategy.win_rate,
            "totalPnl": strategy.total_pnl,
            "sharpeRatio": strategy.sharpe_ratio,
            "maxDrawdown": strategy.max_drawdown,
        }
        for i, (agent, strategy) in enumerate(rows)
    ]


@router.get("/{token_id}/trades")
async def get_trade_log(token_id: int, limit: int = 50, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        select(TradeLog).where(TradeLog.token_id == token_id).order_by(TradeLog.timestamp.desc()).limit(limit)
    )
    return result.scalars().all()


@router.get("/{token_id}/pnl")
async def get_pnl_data(token_id: int, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(TradeLog).where(TradeLog.token_id == token_id).order_by(TradeLog.timestamp.asc()))
    trades = result.scalars().all()

    cumulative = 0.0
    series = []
    for t in trades:
        if t.pnl_forge is not None:
            cumulative += t.pnl_forge
            series.append(
                {
                    "timestamp": t.timestamp.isoformat(),
                    "pnl": t.pnl_forge,
                    "cumulative": cumulative,
                    "asset": t.asset,
                    "action": t.action,
                }
            )
    return series


@router.post("/allocate")
async def allocate_capital(request: AllocationRequest, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(AgentConfig).where(AgentConfig.token_id == request.agent_token_id))
    agent = result.scalar_one_or_none()
    if not agent or agent.agent_type.value != "trading":
        raise HTTPException(status_code=400, detail="Invalid trading agent")

    allocation = Allocation(
        agent_token_id=request.agent_token_id,
        allocator_address=agent.owner_address,
        amount_forge=request.amount_forge,
        active=True,
    )
    db.add(allocation)
    db.add(
        AgentMemory(
            token_id=request.agent_token_id,
            event_type="capital_allocated",
            event_data={"amountForge": request.amount_forge, "allocator": agent.owner_address},
        )
    )
    await db.commit()

    return {
        "message": "Allocation recorded",
        "agentTokenId": request.agent_token_id,
        "amountForge": request.amount_forge,
        "allocationId": allocation.id,
    }


@router.post("/custom/create")
async def create_custom_bot(config: CustomBotConfig):
    task = train_custom_bot.delay(config.model_dump())
    return {"trainingId": task.id, "status": "training_started"}


@router.get("/custom/training/{training_id}")
async def get_training_status(training_id: str):
    from app.tasks.celery_app import celery_app

    result = celery_app.AsyncResult(training_id)
    return {"trainingId": training_id, "status": result.status, "result": result.result}
