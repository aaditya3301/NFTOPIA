from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import AgentConfig
from app.models.memory import AgentMemory
from app.models.trade import TradeLog
from app.services.blockchain_service import blockchain


class EvolutionEngine:
    TRAITS = [
        "adaptive",
        "resilient",
        "high_conviction",
        "pattern_hunter",
        "precision_tuned",
        "viral_instinct",
    ]

    async def evaluate_agent(self, db: AsyncSession, token_id: int) -> dict:
        result = await db.execute(select(AgentConfig).where(AgentConfig.token_id == token_id))
        agent = result.scalar_one_or_none()
        if not agent:
            return {"tokenId": token_id, "status": "missing"}

        level_before = agent.level
        target_level = self._target_level(agent)
        evolved = False
        new_trait = None

        if target_level > agent.level:
            evolved = True
            agent.level = target_level
            new_trait = self._pick_new_trait(agent.traits)
            if new_trait:
                agent.traits = [*agent.traits, new_trait]

        rep = await self._reputation_score(db, token_id, agent)
        agent.reputation_score = rep

        db.add(
            AgentMemory(
                token_id=token_id,
                event_type="evolution_checked",
                event_data={
                    "levelBefore": level_before,
                    "levelAfter": agent.level,
                    "reputation": rep,
                    "evolved": evolved,
                },
            )
        )

        if evolved and new_trait:
            db.add(
                AgentMemory(
                    token_id=token_id,
                    event_type="evolution_triggered",
                    event_data={
                        "newLevel": agent.level,
                        "newTrait": new_trait,
                    },
                )
            )

            if blockchain.account and blockchain.agent_nft:
                try:
                    blockchain.evolve_agent(token_id, agent.level, new_trait, agent.metadata_uri or "ipfs://placeholder")
                except Exception:
                    db.add(
                        AgentMemory(
                            token_id=token_id,
                            event_type="evolution_onchain_failed",
                            event_data={"reason": "onchain_sync_error"},
                        )
                    )

        await db.commit()

        return {
            "tokenId": token_id,
            "status": "ok",
            "evolved": evolved,
            "level": agent.level,
            "newTrait": new_trait,
            "reputation": rep,
        }

    async def check_all_agents(self, db: AsyncSession) -> dict:
        result = await db.execute(select(AgentConfig.token_id))
        token_ids = [row[0] for row in result.all()]
        outcomes = []
        for token_id in token_ids:
            outcomes.append(await self.evaluate_agent(db, token_id))
        return {"checked": len(token_ids), "results": outcomes}

    def _target_level(self, agent: AgentConfig) -> int:
        job_component = agent.jobs_completed // 10
        earnings_component = int(agent.total_earnings // 1000)
        return max(1, 1 + job_component + earnings_component)

    def _pick_new_trait(self, traits: list[str]) -> str | None:
        for trait in self.TRAITS:
            if trait not in traits:
                return trait
        return None

    async def _reputation_score(self, db: AsyncSession, token_id: int, agent: AgentConfig) -> int:
        from sqlalchemy import func

        wins = await db.execute(select(func.count(TradeLog.id)).where(TradeLog.token_id == token_id, TradeLog.pnl_forge > 0))
        losses = await db.execute(
            select(func.count(TradeLog.id)).where(TradeLog.token_id == token_id, TradeLog.pnl_forge < 0)
        )

        win_count = int(wins.scalar() or 0)
        loss_count = int(losses.scalar() or 0)

        base = 50
        base += min(20, agent.jobs_completed // 5)
        base += min(20, win_count)
        base -= min(20, loss_count)

        return max(0, min(100, base))
