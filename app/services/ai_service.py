import httpx
from datetime import datetime
from typing import Dict, Any, Tuple
from app.config import settings
from app.utils.logger import get_logger
from app.utils.errors import retry_with_backoff
from app.core.cache import redis_client

logger = get_logger(__name__)

class GroqProvider:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.timeout = httpx.Timeout(60.0, connect=5.0)

    def _build_prompt(self, event_type: str, data: str) -> str:
        if event_type == "space-weather":
            return (
                f"You are a space weather analyst. Given this raw space solar weather data: {data}\n"
                f"Write a 2-sentence plain-English summary for a general audience. Never use jargon without explaining it."
            )
        elif event_type == "neo":
            return (
                f"You are an orbital hazard analyst. Given this Near-Earth Object telemetry: {data}\n"
                f"Write a 2-sentence plain-English safety summary for the general public."
            )
        elif event_type == "launch":
            return (
                f"You are a space launch flight director. Given this upcoming rocket launch data: {data}\n"
                f"Write a 2-sentence plain-English pre-launch briefing."
            )
        else:
            return f"Analyze the following data: {data}"

    def _parse_response(self, raw: dict) -> str:
        return raw.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

    @retry_with_backoff(retries=3, initial_delay=1.0)
    async def explain(self, event_type: str, data: str) -> str:
        prompt = self._build_prompt(event_type, data)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            res = await client.post(self.base_url, headers=headers, json=payload)
            res.raise_for_status()
            raw_response = res.json()
            return self._parse_response(raw_response)

groq_provider = GroqProvider()

class AIService:
    @staticmethod
    async def get_explanation(event_type: str, data_id: str, data_summary: str) -> Tuple[str, bool]:
        cache_key = f"explanation:{event_type}:{data_id}"
        
        # 1. Try to fetch from Redis cache
        try:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"Redis cache hit for AI explanation: {cache_key}")
                return cached, True
        except Exception as e:
            logger.warning(f"Failed to query Redis cache for AI explanation: {e}")
            
        # 2. Generate new explanation using Groq LLM
        logger.info(f"Generating new explanation for {event_type} (ID: {data_id}) using Groq...")
        try:
            explanation = await groq_provider.explain(event_type, data_summary)
            logger.info(f"Successfully generated explanation: '{explanation}'")
        except Exception as e:
            logger.error(f"Groq generation failed: {e}")
            explanation = f"AI Explanation is currently unavailable. (Error: LLM service offline)"
            return explanation, False
            
        # 3. Cache the explanation in Redis for 1 hour
        try:
            redis_client.setex(cache_key, 3600, explanation)
            logger.info(f"Cached AI explanation in Redis: {cache_key}")
        except Exception as e:
            logger.warning(f"Failed to write AI explanation to Redis cache: {e}")
            
        return explanation, False

