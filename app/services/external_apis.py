import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from app.config import settings
from app.utils.logger import get_logger
from app.utils.errors import ExternalAPIException, retry_with_backoff
from app.core.cache import redis_client

logger = get_logger(__name__)

class SpaceExternalAPIClient:
    def __init__(self):
        self.nasa_key = settings.NASA_API_KEY
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    def _parse_rate_limits(self, headers: httpx.Headers):
        limit = headers.get("X-RateLimit-Limit")
        remaining = headers.get("X-RateLimit-Remaining")
        if limit is not None and remaining is not None:
            logger.info(f"Rate limit headers parsed -> Limit: {limit}, Remaining: {remaining}")
            try:
                redis_client.set("spaceops:ratelimit:nasa:limit", limit)
                redis_client.set("spaceops:ratelimit:nasa:remaining", remaining)
            except Exception as e:
                logger.warning(f"Failed to cache rate limits in Redis: {e}")

    @retry_with_backoff(retries=3, initial_delay=1.0)
    async def _get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Any:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                self._parse_rate_limits(response.headers)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error calling {url}: {e.response.status_code} - {e.response.text}")
            raise ExternalAPIException(f"External API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Unexpected error calling {url}: {e}")
            raise ExternalAPIException(f"Connection to external API failed: {str(e)}")

    async def get_iss_position(self) -> Dict[str, Any]:
        """Fetch real-time ISS telemetry."""
        url = "http://api.open-notify.org/iss-now.json"
        return await self._get(url)

    async def get_neo_hazards(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Fetch Near-Earth Objects from NASA NeoWs API."""
        url = "https://api.nasa.gov/neo/rest/v1/feed"
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "api_key": self.nasa_key
        }
        return await self._get(url, params=params)

    async def get_upcoming_launches(self) -> Dict[str, Any]:
        """Fetch upcoming rocket launches."""
        url = "https://lldev.thespacedevs.com/2.2.0/launch/upcoming/"
        return await self._get(url)

    async def get_solar_flares(self, start_date: str) -> list:
        """Fetch NASA Space Weather Solar Flare data."""
        url = "https://api.nasa.gov/DONKI/FLR"
        params = {
            "startDate": start_date,
            "api_key": self.nasa_key
        }
        try:
            return await self._get(url, params=params)
        except Exception as e:
            logger.error(f"Error fetching space weather solar flares: {e}")
            return []

nasa_api_client = SpaceExternalAPIClient()

