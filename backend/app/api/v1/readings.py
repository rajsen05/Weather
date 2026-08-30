from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import WeatherReading, DataQualityResult, TrustScore
from app.schemas.schemas import WeatherReadingOut

router = APIRouter()

@router.get("/", response_model=List[WeatherReadingOut])
def get_readings(
    station_id: Optional[int] = None,
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(WeatherReading)
    if station_id:
        query = query.filter(WeatherReading.station_id == station_id)
    
    readings = query.order_by(WeatherReading.timestamp.desc()).limit(limit).all()
    return readings

@router.get("/station/{station_id}/series")
def get_station_series(
    station_id: int,
    limit: int = Query(30, le=100),
    db: Session = Depends(get_db)
):
    readings = (
        db.query(WeatherReading)
        .filter(WeatherReading.station_id == station_id)
        .order_by(WeatherReading.timestamp.desc())
        .limit(limit)
        .all()
    )

    series = []
    for r in reversed(readings):
        trust = db.query(TrustScore).filter(TrustScore.reading_id == r.id).first()
        series.append({
            "timestamp": r.timestamp.strftime("%H:%M"),
            "temperature": r.temperature,
            "pressure": r.pressure,
            "humidity": r.humidity,
            "trust_score": trust.overall_score if trust else 100.0,
            "is_simulated": r.is_simulated
        })

    return series
