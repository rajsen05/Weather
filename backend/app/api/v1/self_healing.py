from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import CorrectedReading, Station, WeatherReading
from app.schemas.schemas import CorrectedReadingOut

router = APIRouter()

@router.get("/records", response_model=List[CorrectedReadingOut])
def get_corrected_readings(
    station_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CorrectedReading)
    if station_id:
        query = query.filter(CorrectedReading.station_id == station_id)
    if status:
        query = query.filter(CorrectedReading.status == status)

    return query.order_by(CorrectedReading.created_at.desc()).limit(100).all()

@router.get("/consensus-overview")
def get_consensus_overview(db: Session = Depends(get_db)):
    total = db.query(CorrectedReading).count()
    safe = db.query(CorrectedReading).filter(CorrectedReading.status == "SAFE_ESTIMATE").count()
    human_required = db.query(CorrectedReading).filter(CorrectedReading.status == "HUMAN_VERIFICATION_REQUIRED").count()

    recent = (
        db.query(CorrectedReading, Station)
        .join(Station, CorrectedReading.station_id == Station.id)
        .order_by(CorrectedReading.created_at.desc())
        .limit(20)
        .all()
    )

    recent_list = []
    for c, s in recent:
        recent_list.append({
            "id": c.id,
            "station_code": s.station_code,
            "station_name": s.station_name,
            "parameter": c.parameter,
            "original_value": c.original_value,
            "corrected_value": c.corrected_value,
            "model_temporal": c.model_temporal_estimate,
            "model_historical": c.model_historical_estimate,
            "model_multivariate": c.model_multivariate_estimate,
            "agreement_percent": c.model_agreement_percent,
            "status": c.status,
            "confidence": c.confidence,
            "reason": c.reason,
            "created_at": c.created_at.isoformat()
        })

    return {
        "total_estimations": total,
        "safe_auto_estimates": safe,
        "human_review_required": human_required,
        "raw_data_preservation_guarantee": "100% IMMUTABLE RAW STORAGE",
        "recent_consensus_events": recent_list
    }
