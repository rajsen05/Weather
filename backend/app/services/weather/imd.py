import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import httpx
from app.core.config import settings
from app.services.weather.base import WeatherProvider, WeatherObservation

logger = logging.getLogger(__name__)

class IMDProvider(WeatherProvider):
    """
    Official India Meteorological Department (IMD) AWS Data Ingestion Provider Interface.
    Enabled when IMD_API_KEY and IMD_ENDPOINT are configured.
    """
    def __init__(self):
        self.api_key = settings.IMD_API_KEY
        self.endpoint = settings.IMD_ENDPOINT

    async def get_current_weather(self, latitude: float, longitude: float) -> WeatherObservation:
        if not self.api_key or not self.endpoint:
            raise ValueError(
                "Official IMD Data Access requires IMD_API_KEY and IMD_ENDPOINT. "
                "Contact the India Meteorological Department (MoES) AWS data portal for research API credentials."
            )
        
        headers = {"X-API-KEY": self.api_key}
        params = {"lat": latitude, "lon": longitude}
        retrieval_time = datetime.now(timezone.utc)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{self.endpoint}/aws/observation", params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            return WeatherObservation(
                temperature=data.get("temperature"),
                pressure=data.get("station_level_pressure") or data.get("mslp"),
                humidity=data.get("relative_humidity"),
                wind_speed=data.get("wind_speed"),
                precipitation=data.get("rainfall_24h"),
                timestamp=datetime.fromisoformat(data.get("observation_time")) if data.get("observation_time") else retrieval_time,
                retrieval_timestamp=retrieval_time,
                provider="IMD Official AWS",
                latitude=latitude,
                longitude=longitude,
                raw_data=data
            )

    async def search_locations(self, query: str) -> List[Dict[str, Any]]:
        # IMD AWS registry search fallback
        return []

    async def get_historical_baseline(self, latitude: float, longitude: float, days: int = 3) -> List[WeatherObservation]:
        return []
