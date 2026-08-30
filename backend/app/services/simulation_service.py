import logging
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import Station, WeatherReading, SimulationEvent
from app.services.pipeline import ObservationPipeline
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

class SimulationService:
    """
    Interactive Simulation Lab Engine for SkyGuard AI:
    Injects realistic fault scenarios and extreme meteorological phenomena for live demonstration.
    """

    @classmethod
    async def inject_scenario(
        cls,
        db: Session,
        station_id: int,
        scenario_type: str,
        parameter: str = "temperature",
        magnitude: Optional[float] = None,
        duration_steps: int = 5
    ) -> Dict[str, Any]:
        station = db.query(Station).filter(Station.id == station_id).first()
        if not station:
            raise ValueError(f"Station ID {station_id} not found.")

        # Get latest reading as baseline
        latest_reading = (
            db.query(WeatherReading)
            .filter(WeatherReading.station_id == station.id)
            .order_by(WeatherReading.timestamp.desc())
            .first()
        )
        base_t = latest_reading.temperature if latest_reading and latest_reading.temperature else 30.5
        base_p = latest_reading.pressure if latest_reading and latest_reading.pressure else 1008.5
        base_h = latest_reading.humidity if latest_reading and latest_reading.humidity else 62.0

        t, p, h = base_t, base_p, base_h
        injected_mag = magnitude or 0.0

        if scenario_type == "TEMP_SPIKE":
            t = base_t + (magnitude if magnitude is not None else 45.0) # e.g. 75.5°C
        elif scenario_type == "PRESSURE_SPIKE":
            p = base_p + (magnitude if magnitude is not None else 65.0) # e.g. 1073 hPa
        elif scenario_type == "HUMIDITY_SPIKE":
            h = base_h + (magnitude if magnitude is not None else 35.0) # e.g. 97%
        elif scenario_type == "FROZEN_SENSOR":
            t = base_t
            p = base_p
            h = base_h
        elif scenario_type == "SENSOR_DRIFT":
            t = base_t + (magnitude if magnitude is not None else 6.0)
        elif scenario_type == "MISSING_DATA":
            t = None
        elif scenario_type == "COMM_GAP":
            t = None
            p = None
            h = None
        elif scenario_type == "MULTI_STORM":
            # Coherent severe weather squall front
            t = base_t - 5.5
            p = base_p + 2.8
            h = min(98.0, base_h + 26.0)

        # Log simulation event
        sim_event = SimulationEvent(
            scenario_type=scenario_type,
            target_station_id=station.id,
            parameter=parameter,
            injected_value=t if parameter == "temperature" else (p if parameter == "pressure" else h),
            duration_steps=duration_steps,
            current_step=1,
            status="ACTIVE"
        )
        db.add(sim_event)
        db.commit()

        # Run through Master Pipeline with is_simulated=True
        pipeline_output = ObservationPipeline.process_observation(
            db=db,
            station=station,
            temperature=t,
            pressure=p,
            humidity=h,
            dew_point=None,
            wind_speed=45.0 if scenario_type == "MULTI_STORM" else 8.0,
            precipitation=15.0 if scenario_type == "MULTI_STORM" else 0.0,
            obs_timestamp=datetime.now(timezone.utc),
            provider="SIMULATED AWS DATA",
            is_simulated=True,
            raw_payload=json.dumps({"simulation_scenario": scenario_type, "step": 1})
        )

        # Broadcast via WebSocket
        ws_payload = {
            "type": "SIMULATION_INJECTED",
            "scenario": scenario_type,
            "station_id": station.id,
            "data": pipeline_output
        }
        await ws_manager.broadcast(ws_payload)

        return pipeline_output

simulation_service = SimulationService()
