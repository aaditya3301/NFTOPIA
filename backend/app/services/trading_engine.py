import random
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategy import TradingStrategy
from app.models.trade import TradeAction, TradeLog
from app.services.prism_service import PrismService


class TradingEngine:
    def __init__(self) -> None:
        self.prism = PrismService()

    async def execute_strategy(self, db: AsyncSession, strategy: TradingStrategy) -> dict:
        trades_created = 0
        strategy_pnl = 0.0

        for asset in strategy.assets:
            snapshot = await self.prism.market_snapshot(asset)
            price = self._price_from_snapshot(snapshot)
            change_24h = self._change_from_snapshot(snapshot)

            action = self._choose_action(change_24h)
            quantity = self._position_size(strategy)
            pnl = self._simulate_pnl(action, quantity, change_24h)
            strategy_pnl += pnl

            trade = TradeLog(
                token_id=strategy.token_id,
                trade_id=str(uuid.uuid4()),
                action=action,
                asset=asset,
                entry_price=price,
                exit_price=price * (1 + (change_24h / 100.0)) if action != TradeAction.HOLD else price,
                quantity_forge=quantity,
                pnl_forge=pnl,
                reasoning=f"{strategy.strategy_type} decision using 24h change={change_24h:.2f}%",
                prism_data_snapshot=snapshot,
            )
            db.add(trade)
            trades_created += 1

        strategy.total_trades += trades_created
        strategy.total_pnl += strategy_pnl

        wins = await self._count_wins(db, strategy.token_id)
        strategy.win_rate = (wins / strategy.total_trades) if strategy.total_trades > 0 else 0.0

        strategy.sharpe_ratio = self._estimate_sharpe(strategy)
        strategy.max_drawdown = self._estimate_drawdown(strategy)

        await db.commit()

        return {
            "tokenId": strategy.token_id,
            "tradesCreated": trades_created,
            "strategyPnl": strategy_pnl,
            "totalPnl": strategy.total_pnl,
            "winRate": strategy.win_rate,
        }

    def _price_from_snapshot(self, snapshot: dict) -> float:
        for key in ["price", "lastPrice", "close", "markPrice"]:
            if key in snapshot:
                try:
                    return float(snapshot[key])
                except (TypeError, ValueError):
                    pass
        return random.uniform(1, 200)

    def _change_from_snapshot(self, snapshot: dict) -> float:
        for key in ["change24h", "change_pct", "changePercent", "percentChange24h"]:
            if key in snapshot:
                try:
                    return float(snapshot[key])
                except (TypeError, ValueError):
                    pass
        return random.uniform(-3, 3)

    def _choose_action(self, change_24h: float) -> TradeAction:
        if change_24h > 0.8:
            return TradeAction.BUY
        if change_24h < -0.8:
            return TradeAction.SELL
        return TradeAction.HOLD

    def _position_size(self, strategy: TradingStrategy) -> float:
        risk_bps = float(strategy.risk_params.get("risk_bps", 250)) if strategy.risk_params else 250.0
        base = max(10.0, min(500.0, risk_bps / 2.0))
        return round(base + random.uniform(-5, 5), 4)

    def _simulate_pnl(self, action: TradeAction, quantity: float, change_24h: float) -> float:
        if action == TradeAction.HOLD:
            return 0.0
        signed_change = change_24h / 100.0
        direction = 1.0 if action == TradeAction.BUY else -1.0
        noise = random.uniform(-0.01, 0.01)
        return round(quantity * (direction * signed_change + noise), 6)

    async def _count_wins(self, db: AsyncSession, token_id: int) -> int:
        from sqlalchemy import func, select

        result = await db.execute(
            select(func.count(TradeLog.id)).where(TradeLog.token_id == token_id, TradeLog.pnl_forge > 0)
        )
        return int(result.scalar() or 0)

    def _estimate_sharpe(self, strategy: TradingStrategy) -> float:
        if strategy.total_trades == 0:
            return 0.0
        return round((strategy.win_rate * 2.0) - 0.5, 4)

    def _estimate_drawdown(self, strategy: TradingStrategy) -> float:
        if strategy.total_trades == 0:
            return 0.0
        loss_bias = max(0.0, 1.0 - strategy.win_rate)
        return round(loss_bias * 0.35, 4)
