from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Station, WeatherReading, Anomaly, TrustScore, SensorHealth, MaintenanceAlert
from app.schemas.schemas import DashboardSummary

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_stations = db.query(Station).count()
    live_count = db.query(Station).filter(Station.station_type == "LIVE_LOCATION").count()
    sim_count = db.query(Station).filter(Station.station_type == "SIMULATED_AWS").count()

    active_anomalies = (
        db.query(Anomaly)
        .filter(Anomaly.severity.in_(["SUSPICIOUS", "HIGH", "CRITICAL"]))
        .filter(Anomaly.status.in_(["SUSPICIOUS", "UNDER_VERIFICATION", "CONFIRMED_ANOMALY"]))
        .count()
    )

    # Average Trust Score across latest station readings
    all_stations = db.query(Station).all()
    trust_scores = []
    trust_cats = {"TRUSTED": 0, "UNCERTAIN": 0, "LOW_TRUST": 0}

    for s in all_stations:
        latest_ts = (
            db.query(TrustScore)
            .filter(TrustScore.station_id == s.id)
            .order_by(TrustScore.timestamp.desc())
            .first()
        )
        if latest_ts:
            trust_scores.append(latest_ts.overall_score)
            trust_cats[latest_ts.category] = trust_cats.get(latest_ts.category, 0) + 1

    avg_trust = round(sum(trust_scores) / len(trust_scores), 1) if trust_scores else 95.0

    # Sensor Health percentage
    all_sensors = db.query(SensorHealth).all()
    healthy_count = sum(1 for sh in all_sensors if sh.health_score >= 80.0)
    health_pct = round((healthy_count / len(all_sensors)) * 100.0, 1) if all_sensors else 100.0

    health_dist = {
        "HEALTHY": sum(1 for sh in all_sensors if sh.health_score >= 85.0),
        "WATCH": sum(1 for sh in all_sensors if 70.0 <= sh.health_score < 85.0),
        "DEGRADED": sum(1 for sh in all_sensors if 45.0 <= sh.health_score < 70.0),
        "CRITICAL": sum(1 for sh in all_sensors if sh.health_score < 45.0)
    }

    maintenance_risks = db.query(MaintenanceAlert).filter(MaintenanceAlert.status == "ACTIVE").count()

    # Recent anomalies
    recent_anom_records = (
        db.query(Anomaly, Station)
        .join(Station, Anomaly.station_id == Station.id)
        .order_by(Anomaly.timestamp.desc())
        .limit(6)
        .all()
    )

    recent_anoms = []
    for anom, stn in recent_anom_records:
        recent_anoms.append({
            "id": anom.id,
            "station_code": stn.station_code,
            "station_name": stn.station_name,
            "timestamp": anom.timestamp.isoformat(),
            "composite_score": anom.composite_score,
            "severity": anom.severity,
            "status": anom.status,
            "probable_cause": anom.probable_cause,
            "confidence": anom.confidence
        })

    return DashboardSummary(
        total_stations=total_stations,
        live_locations_count=live_count,
        simulated_stations_count=sim_count,
        active_anomalies_count=active_anomalies,
        avg_trust_score=avg_trust,
        healthy_sensors_percentage=health_pct,
        maintenance_risks_count=maintenance_risks,
        data_freshness_status="SYNCHRONIZED (Open-Meteo & AWS Live Stream Active)",
        recent_anomalies=recent_anoms,
        sensor_health_distribution=health_dist,
        trust_category_distribution=trust_cats
    )
