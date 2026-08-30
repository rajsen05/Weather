from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Station, WeatherReading, TrustScore, Anomaly, SensorHealth
from app.schemas.schemas import StationOut, StationCreate
from app.core.security import require_role, TokenPayload

router = APIRouter()

@router.get("/", response_model=List[StationOut])
def get_stations(
    station_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Station)
    if station_type:
        query = query.filter(Station.station_type == station_type)
    
    stations = query.all()
    results = []

    for s in stations:
        latest_reading = (
            db.query(WeatherReading)
            .filter(WeatherReading.station_id == s.id)
            .order_by(WeatherReading.timestamp.desc())
            .first()
        )
        latest_trust = (
            db.query(TrustScore)
            .filter(TrustScore.station_id == s.id)
            .order_by(TrustScore.timestamp.desc())
            .first()
        )
        latest_anomaly = (
            db.query(Anomaly)
            .filter(Anomaly.station_id == s.id)
            .order_by(Anomaly.timestamp.desc())
            .first()
        )
        health_records = db.query(SensorHealth).filter(SensorHealth.station_id == s.id).all()
        health_summary = {h.sensor_type: h.health_score for h in health_records}

        stn_dict = {
            "id": s.id,
            "station_code": s.station_code,
            "station_name": s.station_name,
            "state": s.state,
            "country": s.country,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "elevation": s.elevation,
            "station_type": s.station_type,
            "provider": s.provider,
            "status": s.status,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
            "latest_reading": {
                "temperature": latest_reading.temperature,
                "pressure": latest_reading.pressure,
                "humidity": latest_reading.humidity,
                "timestamp": latest_reading.timestamp.isoformat()
            } if latest_reading else None,
            "latest_trust_score": latest_trust.overall_score if latest_trust else 100.0,
            "latest_anomaly_status": latest_anomaly.status if latest_anomaly else "NORMAL",
            "sensor_health_summary": health_summary
        }
        results.append(stn_dict)

    return results

@router.get("/{station_id}", response_model=StationOut)
def get_station_by_id(station_id: int, db: Session = Depends(get_db)):
    s = db.query(Station).filter(Station.id == station_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Station not found")

    latest_reading = (
        db.query(WeatherReading)
        .filter(WeatherReading.station_id == s.id)
        .order_by(WeatherReading.timestamp.desc())
        .first()
    )
    latest_trust = (
        db.query(TrustScore)
        .filter(TrustScore.station_id == s.id)
        .order_by(TrustScore.timestamp.desc())
        .first()
    )
    latest_anomaly = (
        db.query(Anomaly)
        .filter(Anomaly.station_id == s.id)
        .order_by(Anomaly.timestamp.desc())
        .first()
    )
    health_records = db.query(SensorHealth).filter(SensorHealth.station_id == s.id).all()
    health_summary = {h.sensor_type: h.health_score for h in health_records}

    return {
        "id": s.id,
        "station_code": s.station_code,
        "station_name": s.station_name,
        "state": s.state,
        "country": s.country,
        "latitude": s.latitude,
        "longitude": s.longitude,
        "elevation": s.elevation,
        "station_type": s.station_type,
        "provider": s.provider,
        "status": s.status,
        "created_at": s.created_at,
        "updated_at": s.updated_at,
        "latest_reading": {
            "temperature": latest_reading.temperature,
            "pressure": latest_reading.pressure,
            "humidity": latest_reading.humidity,
            "timestamp": latest_reading.timestamp.isoformat()
        } if latest_reading else None,
        "latest_trust_score": latest_trust.overall_score if latest_trust else 100.0,
        "latest_anomaly_status": latest_anomaly.status if latest_anomaly else "NORMAL",
        "sensor_health_summary": health_summary
    }

@router.post("/", response_model=StationOut)
def create_station(
    station_in: StationCreate,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_role(["ADMIN", "OPERATOR"]))
):
    existing = db.query(Station).filter(Station.station_code == station_in.station_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Station with this code already exists")
    
    stn = Station(
        station_code=station_in.station_code,
        station_name=station_in.station_name,
        state=station_in.state,
        country=station_in.country,
        latitude=station_in.latitude,
        longitude=station_in.longitude,
        elevation=station_in.elevation,
        station_type=station_in.station_type,
        provider=station_in.provider,
        status="HEALTHY"
    )
    db.add(stn)
    db.commit()
    db.refresh(stn)
    return stn
