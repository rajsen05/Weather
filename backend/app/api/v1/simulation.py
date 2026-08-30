from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.schemas import SimulationInjectRequest
from app.services.simulation_service import simulation_service

router = APIRouter()

@router.post("/inject")
async def inject_simulation_fault(
    payload: SimulationInjectRequest,
    db: Session = Depends(get_db)
):
    """
    Injects a live simulation anomaly scenario (Spike, Drift, Frozen, Packet Drop, Extreme Weather)
    into the designated station pipeline and broadcasts real-time updates.
    """
    try:
        result = await simulation_service.inject_scenario(
            db=db,
            station_id=payload.station_id,
            scenario_type=payload.scenario_type,
            parameter=payload.parameter,
            magnitude=payload.magnitude,
            duration_steps=payload.duration_steps
        )
        return {
            "message": f"Simulation scenario '{payload.scenario_type}' injected successfully.",
            "pipeline_output": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation injection failed: {str(e)}")

@router.get("/scenarios")
def get_available_scenarios():
    return [
        {
            "id": "TEMP_SPIKE",
            "name": "Temperature Sensor Spike (+45°C jump)",
            "parameter": "temperature",
            "description": "Transient electrical impulse or ADC surge causing 30°C -> 75°C isolated spike.",
            "expected_outcome": "Trigger UNDER_VERIFICATION, low trust score (~20), match FP-TEMP-SPIKE-01, tri-model consensus auto-recovery."
        },
        {
            "id": "SENSOR_DRIFT",
            "name": "Progressive Temperature Calibration Drift",
            "parameter": "temperature",
            "description": "Gradual uncalibrated thermal offset due to solar radiation shield degradation.",
            "expected_outcome": "Statistical Modified-Z divergence, gradual trust decline, maintenance alert generation."
        },
        {
            "id": "FROZEN_SENSOR",
            "name": "Frozen Sensor / Firmware Bus Lockup",
            "parameter": "temperature",
            "description": "I2C/RS485 lockup causing exact zero-variance output across cycles.",
            "expected_outcome": "QC flatline check trip, sensor health drop, maintenance recommendation."
        },
        {
            "id": "MISSING_DATA",
            "name": "Missing Sensor Telemetry / Packet Drop",
            "parameter": "temperature",
            "description": "Null/missing field received in telemetry frame.",
            "expected_outcome": "QC missing check failure, consensus estimation for data continuity."
        },
        {
            "id": "COMM_GAP",
            "name": "Communication Transmission Dropout",
            "parameter": "all",
            "description": "All parameters null due to satellite/GPRS communication disruption.",
            "expected_outcome": "Packet drop diagnosis, data age staleness warning."
        },
        {
            "id": "MULTI_STORM",
            "name": "Genuine Severe Weather Event (Gust Front / Squall)",
            "parameter": "multi",
            "description": "Coherent atmospheric shift: Temp -5.5°C, Pressure +2.8 hPa, Humidity +26%, Wind 45 km/h.",
            "expected_outcome": "Identified as Probable Genuine Weather Event (NOT sensor fault), Trust remains high."
        }
    ]
