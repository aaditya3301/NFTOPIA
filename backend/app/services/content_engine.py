import base64
import logging
import uuid
from typing import Any

import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.content import ContentOutput
from app.models.memory import AgentMemory

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

logger = logging.getLogger(__name__)


class ContentEngine:
    def __init__(self) -> None:
        self.text_model_name = "gemini-2.0-flash"
        self.image_model_name = "gemini-2.0-flash"

    async def generate(self, agent, request, db: AsyncSession):
        content_id = str(uuid.uuid4())[:12]

        if request.content_type == "text":
            result = await self._generate_text(agent, request.prompt)
        elif request.content_type == "image":
            result = await self._generate_image(agent, request.prompt)
        elif request.content_type == "video":
            result = await self._generate_video(agent, request.prompt)
        else:
            raise ValueError(f"Unknown content type: {request.content_type}")

        content_url = result["content_url"]
        metadata_uri = result.get("metadata_uri")

        row = ContentOutput(
            content_id=content_id,
            agent_token_id=request.agent_id,
            creator_address=agent.owner_address,
            content_type=request.content_type,
            prompt=request.prompt,
            content_url=content_url,
            metadata_uri=metadata_uri,
            price_forge=0.0,
        )
        db.add(row)
        db.add(
            AgentMemory(
                token_id=agent.token_id,
                event_type="job_completed",
                event_data={
                    "content_id": content_id,
                    "content_type": request.content_type,
                    "prompt": request.prompt[:200],
                },
            )
        )
        await db.commit()

        return {
            "content_id": content_id,
            "agent_token_id": request.agent_id,
            "content_type": request.content_type,
            "content_url": content_url,
            "prompt": request.prompt,
            "metadata_uri": metadata_uri,
            "content_nft_token_id": None,
            "tx_hash": "",
        }

    async def _generate_text(self, agent, prompt: str) -> dict[str, Any]:
        system_prompt = self._build_personality_prompt(agent)
        request_payload = [system_prompt, f"User request: {prompt}"]

        text_output = await self._gemini_text(request_payload, model_name=agent.gemini_model or self.text_model_name)
        if not text_output:
            text_output = f"{agent.specialization.title()} content draft: {prompt}"

        return {
            "content_url": f"data:text/plain;base64,{self._encode_text(text_output)}",
            "metadata_uri": f"{settings.IPFS_GATEWAY}meta/{uuid.uuid4().hex[:12]}",
        }

    async def _generate_image(self, agent, prompt: str) -> dict[str, Any]:
        enhanced_prompt = (
            f"{prompt}. Style: {agent.specialization}. "
            f"Artistic direction: {(agent.personality_prompt or '')[:200]}"
        )

        mime_data = await self._gemini_image(enhanced_prompt)
        if mime_data:
            return {
                "content_url": f"data:{mime_data['mime']};base64,{mime_data['data']}",
                "metadata_uri": f"{settings.IPFS_GATEWAY}meta/{uuid.uuid4().hex[:12]}",
            }

        fallback_text = await self._gemini_text(
            [f"Describe in vivid detail an image of: {enhanced_prompt}"],
            model_name=agent.gemini_model or self.text_model_name,
        )
        fallback = fallback_text or f"Image concept for {agent.specialization}: {prompt}"
        return {
            "content_url": f"text_fallback:{fallback[:800]}",
            "metadata_uri": f"{settings.IPFS_GATEWAY}meta/{uuid.uuid4().hex[:12]}",
        }

    async def _generate_video(self, agent, prompt: str) -> dict[str, Any]:
        storyboard_prompt = (
            "Create a detailed video storyboard/script for:\n"
            f"{prompt}\n"
            f"Style: {agent.specialization}\n"
            f"Director vision: {(agent.personality_prompt or '')[:200]}\n"
            "Include scene descriptions, camera movement, transitions, and duration."
        )
        storyboard = await self._gemini_text([storyboard_prompt], model_name=agent.gemini_model or self.text_model_name)
        if not storyboard:
            storyboard = f"Storyboard draft for {agent.specialization}: {prompt}"

        return {
            "content_url": f"data:text/plain;base64,{self._encode_text(storyboard)}",
            "metadata_uri": f"{settings.IPFS_GATEWAY}meta/{uuid.uuid4().hex[:12]}",
        }

    async def _gemini_text(self, payload: list[str], model_name: str) -> str | None:
        if not settings.GEMINI_API_KEY:
            return None

        try:
            model = genai.GenerativeModel(model_name)
            response = await self._to_thread(model.generate_content, payload)
            return getattr(response, "text", None)
        except Exception as exc:
            logger.warning("Gemini text generation failed: %s", exc)
            return None

    async def _gemini_image(self, prompt: str) -> dict[str, str] | None:
        if not settings.GEMINI_API_KEY:
            return None

        try:
            model = genai.GenerativeModel(self.image_model_name)
            response = await self._to_thread(
                model.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="image/png"),
            )
            return self._extract_image_part(response)
        except Exception as exc:
            logger.warning("Gemini image generation failed: %s", exc)
            return None

    def _extract_image_part(self, response: Any) -> dict[str, str] | None:
        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) or []
            for part in parts:
                inline_data = getattr(part, "inline_data", None)
                if not inline_data:
                    continue
                raw_data = getattr(inline_data, "data", None)
                mime = getattr(inline_data, "mime_type", None) or "image/png"
                if isinstance(raw_data, bytes):
                    encoded = base64.b64encode(raw_data).decode("ascii")
                    return {"mime": mime, "data": encoded}
                if isinstance(raw_data, str):
                    return {"mime": mime, "data": raw_data}
        return None

    def _build_personality_prompt(self, agent) -> str:
        return (
            "You are an AI content creator with this personality:\n"
            f"{agent.personality_prompt}\n\n"
            f"Specialization: {agent.specialization}\n"
            f"Style parameters: {agent.style_parameters}\n"
            "Generate content aligned with this persona and remain in character."
        )

    def _encode_text(self, text: str) -> str:
        return base64.b64encode(text.encode("utf-8")).decode("ascii")

    async def _to_thread(self, func, *args, **kwargs):
        import asyncio

        return await asyncio.to_thread(func, *args, **kwargs)
