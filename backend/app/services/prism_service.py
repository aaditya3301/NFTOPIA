import httpx

from app.config import settings


class PrismService:
    async def market_snapshot(self, asset: str) -> dict:
        headers = {"Authorization": f"Bearer {settings.PRISM_API_KEY}"} if settings.PRISM_API_KEY else {}
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(f"{settings.PRISM_BASE_URL}/market/{asset}", headers=headers)
            if response.status_code >= 400:
                return {"asset": asset, "error": f"prism_status_{response.status_code}"}
            return response.json()
