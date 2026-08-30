import logging
import asyncio
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import SessionLocal
from app.models.models import Station
from app.services.weather.weather_service import weather_service
from app.services.pipeline import ObservationPipeline
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

class WeatherScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False

    async def poll_station_weather(self):
        """Fetches live meteorological observations for registered stations."""
        logger.info("Executing periodic weather observation ingestion cycle...")
        db: Session = SessionLocal()
        try:
            stations = db.query(Station).filter(Station.station_type != "SIMULATED_AWS").all()
            for station in stations:
                try:
                    # Fetch from Open-Meteo or configured provider
                    obs = await weather_service.get_current_weather(
                        latitude=station.latitude,
                        longitude=station.longitude,
                        provider_name=station.provider
                    )

                    # Process through SkyGuard AI Pipeline
                    result = ObservationPipeline.process_observation(
                        db=db,
                        station=station,
                        temperature=obs.temperature,
                        pressure=obs.pressure,
                        humidity=obs.humidity,
                        dew_point=obs.dew_point,
                        wind_speed=obs.wind_speed,
                        precipitation=obs.precipitation,
                        obs_timestamp=obs.timestamp,
                        provider=obs.provider,
                        is_simulated=False,
                        raw_payload=str(obs.raw_data)
                    )

                    # Broadcast real-time update
                    await ws_manager.broadcast({
                        "type": "LIVE_OBSERVATION",
                        "station_id": station.id,
                        "data": result
                    })

                except Exception as e:
                    logger.warning(f"Error during weather polling for station {station.station_code}: {e}")
                    continue

        except Exception as e:
            logger.error(f"Global scheduler error: {e}")
        finally:
            db.close()

    def start(self):
        if not self.is_running:
            self.scheduler.add_job(
                self.poll_station_weather,
                "interval",
                seconds=settings.WEATHER_REFRESH_SECONDS,
                id="weather_ingestion_job",
                replace_existing=True
            )
            self.scheduler.start()
            self.is_running = True
            logger.info(f"Weather scheduler started with interval {settings.WEATHER_REFRESH_SECONDS}s")

    def stop(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Weather scheduler stopped")

weather_scheduler = WeatherScheduler()
