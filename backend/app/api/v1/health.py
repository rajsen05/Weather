from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import SensorHealth, MaintenanceAlert, Station
from app.schemas.schemas import SensorHealthOut, MaintenanceAlertOut

router = APIRouter()

@router.get("/sensors", response_model=List[SensorHealthOut])
def get_all_sensor_health(station_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(SensorHealth)
    if station_id:
        query = query.filter(SensorHealth.station_id == station_id)
    return query.all()

@router.get("/matrix")
def get_health_matrix(db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    matrix = []

    for s in stations:
        records = db.query(SensorHealth).filter(SensorHealth.station_id == s.id).all()
        health_by_sensor = {r.sensor_type: {"score": r.health_score, "risk": r.failure_risk, "degradation": r.degradation_rate} for r in records}
        matrix.append({
            "station_id": s.id,
            "station_code": s.station_code,
            "station_name": s.station_name,
            "state": s.state,
            "overall_status": s.status,
            "sensors": health_by_sensor
        })

    return matrix

@router.get("/maintenance-alerts", response_model=List[MaintenanceAlertOut])
def get_maintenance_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MaintenanceAlert)
    if status:
        query = query.filter(MaintenanceAlert.status == status)
    return query.order_by(MaintenanceAlert.created_at.desc()).all()
