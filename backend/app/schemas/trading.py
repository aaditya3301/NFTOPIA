from pydantic import BaseModel


class AllocationRequest(BaseModel):
    agent_token_id: int
    amount_forge: float


class CustomBotConfig(BaseModel):
    owner_address: str
    agent_token_id: int | None = None
    strategy_type: str
    assets: list[str]
    timeframe: str = "4h"
    risk_params: dict = {}
