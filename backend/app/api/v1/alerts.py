from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import MaintenanceAlert, Anomaly, Station
from app.core.security import require_role, TokenPayload

router = APIRouter()

@router.get("/")
def get_all_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = (
        db.query(MaintenanceAlert, Station)
        .join(Station, MaintenanceAlert.station_id == Station.id)
    )
    if status:
        query = query.filter(MaintenanceAlert.status == status)
    if severity:
        query = query.filter(MaintenanceAlert.severity == severity)

    alerts = query.order_by(MaintenanceAlert.created_at.desc()).limit(limit).all()

    results = []
    for a, s in alerts:
        results.append({
            "id": a.id,
            "station_id": s.id,
            "station_code": s.station_code,
            "station_name": s.station_name,
            "sensor_type": a.sensor_type,
            "severity": a.severity,
            "title": a.title,
            "recommendation": a.recommendation,
            "status": a.status,
            "created_at": a.created_at.isoformat(),
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None
        })

    return results

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_role(["ADMIN", "OPERATOR", "MAINTENANCE"]))
):
    alert = db.query(MaintenanceAlert).filter(MaintenanceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "ACKNOWLEDGED"
    db.commit()
    return {"message": "Alert marked as ACKNOWLEDGED", "alert_id": alert_id}

@router.post("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_role(["ADMIN", "OPERATOR", "MAINTENANCE"]))
):
    alert = db.query(MaintenanceAlert).filter(MaintenanceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "RESOLVED"
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Alert marked as RESOLVED", "alert_id": alert_id}
