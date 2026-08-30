import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings
from app.services.weather.base import WeatherProvider, WeatherObservation
from app.services.weather.open_meteo import OpenMeteoProvider
from app.services.weather.open_weather import OpenWeatherProvider
from app.services.weather.imd import IMDProvider

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.providers: Dict[str, WeatherProvider] = {
            "open_meteo": OpenMeteoProvider(),
            "open_weather": OpenWeatherProvider(),
            "imd": IMDProvider(),
        }
        # In-memory coordinate cache: (round(lat, 3), round(lon, 3)) -> (WeatherObservation, cached_at)
        self._cache: Dict[Tuple[float, float], Tuple[WeatherObservation, datetime]] = {}
        self._cache_ttl_seconds = 45 # Short cache to prevent hammering APIs

    def get_provider(self, provider_name: Optional[str] = None) -> WeatherProvider:
        name = (provider_name or settings.PRIMARY_PROVIDER).lower()
        if name in self.providers:
            return self.providers[name]
        logger.warning(f"Provider '{name}' not found, falling back to open_meteo")
        return self.providers["open_meteo"]

    def _get_cache_key(self, lat: float, lon: float) -> Tuple[float, float]:
        return (round(lat, 3), round(lon, 3))

    async def get_current_weather(
        self, latitude: float, longitude: float, provider_name: Optional[str] = None, force_refresh: bool = False
    ) -> WeatherObservation:
        cache_key = self._get_cache_key(latitude, longitude)
        now = datetime.now(timezone.utc)

        if not force_refresh and cache_key in self._cache:
            obs, cached_at = self._cache[cache_key]
            if (now - cached_at).total_seconds() < self._cache_ttl_seconds:
                return obs

        provider = self.get_provider(provider_name)
        try:
            obs = await provider.get_current_weather(latitude, longitude)
            self._cache[cache_key] = (obs, now)
            return obs
        except Exception as e:
            logger.error(f"Weather retrieval failed for ({latitude}, {longitude}) using {provider_name}: {e}")
            # If we have an existing cached item (even if expired), return with is_stale warning
            if cache_key in self._cache:
                logger.info("Serving stale cached weather data due to API error")
                stale_obs, _ = self._cache[cache_key]
                return stale_obs
            # Fallback to Open-Meteo if primary was different
            if provider_name and provider_name != "open_meteo":
                logger.info("Attempting fallback to Open-Meteo provider")
                fallback_obs = await self.providers["open_meteo"].get_current_weather(latitude, longitude)
                self._cache[cache_key] = (fallback_obs, now)
                return fallback_obs
            raise

    async def search_locations(self, query: str) -> List[Dict[str, Any]]:
        # Always use Open-Meteo geocoding as it's free, accurate, and global
        provider = self.providers["open_meteo"]
        return await provider.search_locations(query)

    async def get_historical_baseline(self, latitude: float, longitude: float, days: int = 3) -> List[WeatherObservation]:
        provider = self.get_provider()
        return await provider.get_historical_baseline(latitude, longitude, days=days)

    @staticmethod
    def calculate_freshness(observation_time: datetime, retrieval_time: Optional[datetime] = None) -> Tuple[int, bool]:
        now = datetime.now(timezone.utc)
        if observation_time.tzinfo is None:
            obs_tz = observation_time.replace(tzinfo=timezone.utc)
        else:
            obs_tz = observation_time

        age_seconds = max(0, int((now - obs_tz).total_seconds()))
        is_stale = age_seconds > settings.DATA_STALE_THRESHOLD_SECONDS
        return age_seconds, is_stale

weather_service = WeatherService()
