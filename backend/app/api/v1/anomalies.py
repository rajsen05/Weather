from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Anomaly, AnomalyEvidence, Station, WeatherReading, CorrectedReading
from app.schemas.schemas import AnomalyOut
from app.core.security import require_role, TokenPayload

router = APIRouter()

@router.get("/", response_model=List[AnomalyOut])
def get_anomalies(
    station_id: Optional[int] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)
    if station_id:
        query = query.filter(Anomaly.station_id == station_id)
    if severity:
        query = query.filter(Anomaly.severity == severity)
    if status:
        query = query.filter(Anomaly.status == status)

    anomalies = query.order_by(Anomaly.timestamp.desc()).limit(limit).all()
    return anomalies

@router.get("/{anomaly_id}")
def get_anomaly_deep_dive(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    station = db.query(Station).filter(Station.id == anomaly.station_id).first()
    reading = db.query(WeatherReading).filter(WeatherReading.id == anomaly.reading_id).first()
    evidences = db.query(AnomalyEvidence).filter(AnomalyEvidence.anomaly_id == anomaly.id).order_by(AnomalyEvidence.verification_step.asc()).all()
    corrections = db.query(CorrectedReading).filter(CorrectedReading.reading_id == anomaly.reading_id).all()

    return {
        "anomaly": {
            "id": anomaly.id,
            "timestamp": anomaly.timestamp.isoformat(),
            "composite_score": anomaly.composite_score,
            "severity": anomaly.severity,
            "status": anomaly.status,
            "probable_cause": anomaly.probable_cause,
            "confidence": anomaly.confidence,
            "rule_score": anomaly.rule_score,
            "statistical_score": anomaly.statistical_score,
            "isolation_forest_score": anomaly.isolation_forest_score,
            "temporal_score": anomaly.temporal_score,
            "multivariate_score": anomaly.multivariate_score,
            "evidence_summary": anomaly.evidence_summary
        },
        "station": {
            "id": station.id,
            "code": station.station_code,
            "name": station.station_name,
            "state": station.state,
            "latitude": station.latitude,
            "longitude": station.longitude
        } if station else None,
        "observation": {
            "temperature": reading.temperature if reading else None,
            "pressure": reading.pressure if reading else None,
            "humidity": reading.humidity if reading else None,
            "provider": reading.provider if reading else "Unknown"
        } if reading else None,
        "verification_timeline": [
            {
                "step": e.verification_step,
                "divergence": e.divergence,
                "note": e.note,
                "created_at": e.created_at.isoformat()
            }
            for e in evidences
        ],
        "self_healing": [
            {
                "parameter": c.parameter,
                "original_value": c.original_value,
                "corrected_value": c.corrected_value,
                "model_temporal": c.model_temporal_estimate,
                "model_historical": c.model_historical_estimate,
                "model_multivariate": c.model_multivariate_estimate,
                "agreement_percent": c.model_agreement_percent,
                "status": c.status,
                "reason": c.reason
            }
            for c in corrections
        ]
    }

@router.post("/{anomaly_id}/resolve")
def resolve_anomaly(
    anomaly_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_role(["ADMIN", "OPERATOR", "MAINTENANCE"]))
):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    anomaly.status = "RESOLVED"
    db.commit()
    return {"message": "Anomaly status updated to RESOLVED", "anomaly_id": anomaly_id}
