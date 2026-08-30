from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

class WeatherObservation:
    def __init__(
        self,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        dew_point: Optional[float] = None,
        wind_speed: Optional[float] = None,
        precipitation: Optional[float] = None,
        timestamp: Optional[datetime] = None,
        retrieval_timestamp: Optional[datetime] = None,
        provider: str = "open_meteo",
        station_name: Optional[str] = None,
        latitude: float = 0.0,
        longitude: float = 0.0,
        raw_data: Optional[Dict[str, Any]] = None
    ):
        self.temperature = temperature
        self.pressure = pressure
        self.humidity = humidity
        self.dew_point = dew_point
        self.wind_speed = wind_speed
        self.precipitation = precipitation
        self.timestamp = timestamp or datetime.utcnow()
        self.retrieval_timestamp = retrieval_timestamp or datetime.utcnow()
        self.provider = provider
        self.station_name = station_name
        self.latitude = latitude
        self.longitude = longitude
        self.raw_data = raw_data or {}

class WeatherProvider(ABC):
    @abstractmethod
    async def get_current_weather(self, latitude: float, longitude: float) -> WeatherObservation:
        """Fetch current weather observation for specified coordinates."""
        pass

    @abstractmethod
    async def search_locations(self, query: str) -> List[Dict[str, Any]]:
        """Search locations by name/geocoding."""
        pass

    @abstractmethod
    async def get_historical_baseline(self, latitude: float, longitude: float, days: int = 7) -> List[WeatherObservation]:
        """Fetch historical observation records for baseline statistical calculations."""
        pass
