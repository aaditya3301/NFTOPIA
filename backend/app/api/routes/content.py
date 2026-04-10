from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models.agent import AgentConfig
from app.models.content import ContentOutput
from app.schemas.content import GenerationRequest, GenerationResponse
from app.services.content_engine import ContentEngine

router = APIRouter()
engine = ContentEngine()


@router.post("/generate", response_model=GenerationResponse)
async def generate_content(request: GenerationRequest, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(AgentConfig).where(AgentConfig.token_id == request.agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.agent_type.value != "content":
        raise HTTPException(status_code=400, detail="Not a content agent")

    return await engine.generate(agent, request, db)


@router.get("/agent/{agent_id}")
async def get_agent_content(agent_id: int, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        select(ContentOutput).where(ContentOutput.agent_token_id == agent_id).order_by(ContentOutput.created_at.desc())
    )
    return result.scalars().all()


@router.get("/marketplace")
async def get_marketplace_content(
    content_type: str | None = None,
    sort: str = "trending",
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db_session),
):
    query = select(ContentOutput).where(ContentOutput.content_nft_token_id.is_not(None))
    if content_type:
        query = query.where(ContentOutput.content_type == content_type)
    if sort == "trending":
        query = query.order_by(ContentOutput.popularity_score.desc())
    elif sort == "newest":
        query = query.order_by(ContentOutput.created_at.desc())
    elif sort == "price_asc":
        query = query.order_by(ContentOutput.price_forge.asc())
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()
