import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.services.weather.base import WeatherProvider, WeatherObservation

logger = logging.getLogger(__name__)

class OpenMeteoProvider(WeatherProvider):
    def __init__(self):
        self.base_url = settings.OPENMETEO_BASE_URL
        self.geocoding_url = settings.OPENMETEO_GEOCODING_URL

    async def get_current_weather(self, latitude: float, longitude: float) -> WeatherObservation:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,surface_pressure,dew_point_2m,wind_speed_10m,precipitation",
            "timezone": "auto"
        }
        retrieval_time = datetime.now(timezone.utc)
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                current = data.get("current", {})
                time_str = current.get("time")
                obs_time = datetime.fromisoformat(time_str) if time_str else retrieval_time

                return WeatherObservation(
                    temperature=current.get("temperature_2m"),
                    pressure=current.get("surface_pressure"),
                    humidity=current.get("relative_humidity_2m"),
                    dew_point=current.get("dew_point_2m"),
                    wind_speed=current.get("wind_speed_10m"),
                    precipitation=current.get("precipitation"),
                    timestamp=obs_time,
                    retrieval_timestamp=retrieval_time,
                    provider="Open-Meteo",
                    latitude=latitude,
                    longitude=longitude,
                    raw_data=data
                )
        except Exception as e:
            logger.error(f"Error fetching Open-Meteo weather for ({latitude}, {longitude}): {e}")
            raise

    async def search_locations(self, query: str) -> List[Dict[str, Any]]:
        params = {
            "name": query,
            "count": 10,
            "language": "en",
            "format": "json"
        }
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(self.geocoding_url, params=params)
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                
                return [
                    {
                        "name": item.get("name"),
                        "latitude": item.get("latitude"),
                        "longitude": item.get("longitude"),
                        "country": item.get("country"),
                        "admin1": item.get("admin1"),
                        "timezone": item.get("timezone")
                    }
                    for item in results
                ]
        except Exception as e:
            logger.error(f"Geocoding search failed for query '{query}': {e}")
            return []

    async def get_historical_baseline(self, latitude: float, longitude: float, days: int = 3) -> List[WeatherObservation]:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": "temperature_2m,relative_humidity_2m,surface_pressure",
            "past_days": days,
            "forecast_days": 1,
            "timezone": "auto"
        }
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                temps = hourly.get("temperature_2m", [])
                pressures = hourly.get("surface_pressure", [])
                humidities = hourly.get("relative_humidity_2m", [])
                
                observations = []
                for i in range(len(times)):
                    try:
                        obs_time = datetime.fromisoformat(times[i])
                        observations.append(
                            WeatherObservation(
                                temperature=temps[i] if i < len(temps) else None,
                                pressure=pressures[i] if i < len(pressures) else None,
                                humidity=humidities[i] if i < len(humidities) else None,
                                timestamp=obs_time,
                                provider="Open-Meteo",
                                latitude=latitude,
                                longitude=longitude
                            )
                        )
                    except Exception:
                        continue
                return observations
        except Exception as e:
            logger.warning(f"Failed to fetch historical baseline from Open-Meteo: {e}")
            return []
