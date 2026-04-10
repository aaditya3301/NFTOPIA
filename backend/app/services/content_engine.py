import uuid

import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.content import ContentOutput

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


class ContentEngine:
    async def generate(self, agent, request, db: AsyncSession):
        content_id = str(uuid.uuid4())

        generated_text = None
        if settings.GEMINI_API_KEY:
            model_name = agent.gemini_model or "gemini-2.0-flash"
            model = genai.GenerativeModel(model_name)
            prompt = f"{agent.personality_prompt}\n\nUser prompt: {request.prompt}"
            response = model.generate_content(prompt)
            generated_text = getattr(response, "text", None)

        content_url = f"{settings.IPFS_GATEWAY}{content_id}"
        if generated_text:
            content_url = f"{content_url}?preview=true"

        row = ContentOutput(
            content_id=content_id,
            agent_token_id=request.agent_id,
            creator_address=agent.owner_address,
            content_type=request.content_type,
            prompt=request.prompt,
            content_url=content_url,
        )
        db.add(row)
        await db.commit()

        return {
            "content_id": content_id,
            "agent_token_id": request.agent_id,
            "content_type": request.content_type,
            "content_url": content_url,
            "prompt": request.prompt,
        }
