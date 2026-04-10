from pydantic import BaseModel


class GenerationRequest(BaseModel):
    agent_id: int
    prompt: str
    content_type: str = "image"


class GenerationResponse(BaseModel):
    content_id: str
    agent_token_id: int
    content_type: str
    content_url: str
    prompt: str
