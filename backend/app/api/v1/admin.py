from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.config import settings
from app.models.models import User, Station, WeatherReading, Anomaly, AuditLog
from app.core.security import require_role, TokenPayload

router = APIRouter()

@router.get("/system-status")
def get_system_status(
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_role(["ADMIN"]))
):
    user_count = db.query(User).count()
    station_count = db.query(Station).count()
    reading_count = db.query(WeatherReading).count()
    anomaly_count = db.query(Anomaly).count()
    audit_count = db.query(AuditLog).count()

    return {
        "status": "ONLINE",
        "primary_weather_provider": settings.PRIMARY_PROVIDER,
        "database": "Operational (SQLAlchemy Engine Active)",
        "scheduler_refresh_interval_sec": settings.WEATHER_REFRESH_SECONDS,
        "isolation_forest_contamination": settings.ISOLATION_FOREST_CONTAMINATION,
        "consensus_threshold": f"{int(settings.CONSENSUS_AGREEMENT_THRESHOLD * 100)}%",
        "database_metrics": {
            "total_users": user_count,
            "total_stations": station_count,
            "total_observations_recorded": reading_count,
            "total_anomalies_evaluated": anomaly_count,
            "audit_ledger_records": audit_count
        },
        "providers_config": {
            "open_meteo": {"enabled": True, "status": "ACTIVE (Primary Global)"},
            "open_weather": {"enabled": bool(settings.OPENWEATHER_API_KEY), "status": "Configured" if settings.OPENWEATHER_API_KEY else "Requires API Key"},
            "imd": {"enabled": bool(settings.IMD_API_KEY), "status": "Configured" if settings.IMD_API_KEY else "Official MoES / IMD API Credentials Required"}
        }
    }
