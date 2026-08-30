import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import httpx
from app.core.config import settings
from app.services.weather.base import WeatherProvider, WeatherObservation

logger = logging.getLogger(__name__)

class OpenWeatherProvider(WeatherProvider):
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_BASE_URL

    async def get_current_weather(self, latitude: float, longitude: float) -> WeatherObservation:
        if not self.api_key:
            raise ValueError("OpenWeather API key is not configured. Set OPENWEATHER_API_KEY in environment.")
        
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": self.api_key,
            "units": "metric"
        }
        retrieval_time = datetime.now(timezone.utc)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{self.base_url}/weather", params=params)
            response.raise_for_status()
            data = response.json()
            
            main = data.get("main", {})
            wind = data.get("wind", {})
            dt = data.get("dt")
            obs_time = datetime.fromtimestamp(dt, tz=timezone.utc) if dt else retrieval_time

            return WeatherObservation(
                temperature=main.get("temp"),
                pressure=main.get("pressure"),
                humidity=main.get("humidity"),
                wind_speed=wind.get("speed") * 3.6 if wind.get("speed") else None,
                timestamp=obs_time,
                retrieval_timestamp=retrieval_time,
                provider="OpenWeather",
                latitude=latitude,
                longitude=longitude,
                raw_data=data
            )

    async def search_locations(self, query: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            return []
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(
                    "http://api.openweathermap.org/geo/1.0/direct",
                    params={"q": query, "limit": 5, "appid": self.api_key}
                )
                response.raise_for_status()
                data = response.json()
                return [
                    {
                        "name": item.get("name"),
                        "latitude": item.get("lat"),
                        "longitude": item.get("lon"),
                        "country": item.get("country"),
                        "admin1": item.get("state"),
                        "timezone": "auto"
                    }
                    for item in data
                ]
        except Exception as e:
            logger.error(f"OpenWeather geocoding failed: {e}")
            return []

    async def get_historical_baseline(self, latitude: float, longitude: float, days: int = 3) -> List[WeatherObservation]:
        return []
