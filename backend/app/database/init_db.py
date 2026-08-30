import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import (
    User, Station, SensorHealth, FaultFingerprint, WeatherReading,
    DataQualityResult, TrustScore, Anomaly, AuditLog
)
from app.ml.fingerprints import FaultFingerprintEngine

logger = logging.getLogger(__name__)

def init_database():
    """Initializes database schema and populates baseline seeds."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Seed Users
        admin_user = db.query(User).filter(User.email == "admin@skyguard.gov.in").first()
        if not admin_user:
            users = [
                User(
                    email="admin@skyguard.gov.in",
                    hashed_password=get_password_hash("Admin@123456"),
                    full_name="Chief Meteorological Officer (Admin)",
                    role="ADMIN"
                ),
                User(
                    email="operator@imd.gov.in",
                    hashed_password=get_password_hash("Operator@123456"),
                    full_name="IMD AWS Network Operator",
                    role="OPERATOR"
                ),
                User(
                    email="researcher@moes.gov.in",
                    hashed_password=get_password_hash("Research@123456"),
                    full_name="Atmospheric Science Researcher",
                    role="RESEARCHER"
                ),
                User(
                    email="disaster@ndma.gov.in",
                    hashed_password=get_password_hash("Disaster@123456"),
                    full_name="Disaster Management Officer",
                    role="OPERATOR"
                ),
                User(
                    email="public@skyguard.ai",
                    hashed_password=get_password_hash("Public@123456"),
                    full_name="General Public Viewer",
                    role="VIEWER"
                )
            ]
            db.add_all(users)
            db.commit()
            logger.info("Default RBAC users created.")

        # 2. Seed Fault Fingerprints Library
        existing_fp = db.query(FaultFingerprint).first()
        if not existing_fp:
            for seed in FaultFingerprintEngine.SEED_FINGERPRINTS:
                fp = FaultFingerprint(
                    fingerprint_code=seed["code"],
                    fault_type=seed["type"],
                    description=seed["description"],
                    duration_readings=seed["duration"],
                    magnitude=seed["magnitude"],
                    sensor_type=seed["sensor"],
                    feature_signature={"vector": seed["vector"]},
                    match_count=5
                )
                db.add(fp)
            db.commit()
            logger.info("Fault fingerprint library seeded.")

        # 3. Seed Automatic Weather Stations (AWS)
        existing_station = db.query(Station).first()
        if not existing_station:
            stations = [
                Station(
                    station_code="AWS-DEL-01",
                    station_name="New Delhi (Safdarjung Observatory)",
                    state="Delhi",
                    country="India",
                    latitude=28.584,
                    longitude=77.205,
                    elevation=216.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-MUM-02",
                    station_name="Mumbai (Santacruz Regional Center)",
                    state="Maharashtra",
                    country="India",
                    latitude=19.117,
                    longitude=72.863,
                    elevation=14.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-BLR-03",
                    station_name="Bengaluru (HAL Airport Weather Station)",
                    state="Karnataka",
                    country="India",
                    latitude=12.950,
                    longitude=77.668,
                    elevation=888.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-CHE-04",
                    station_name="Chennai (Meenambakkam Coastal Station)",
                    state="Tamil Nadu",
                    country="India",
                    latitude=12.994,
                    longitude=80.180,
                    elevation=16.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-KOL-05",
                    station_name="Kolkata (Alipore Weather Office)",
                    state="West Bengal",
                    country="India",
                    latitude=22.533,
                    longitude=88.333,
                    elevation=6.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-SHM-06",
                    station_name="Shimla (High-Altitude Himalayan AWS)",
                    state="Himachal Pradesh",
                    country="India",
                    latitude=31.104,
                    longitude=77.173,
                    elevation=2205.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-JDH-07",
                    station_name="Jodhpur (Thar Desert Meteorological Station)",
                    state="Rajasthan",
                    country="India",
                    latitude=26.238,
                    longitude=73.024,
                    elevation=231.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-CHN-08",
                    station_name="Chhindwara (Satpura Agro-Climatic Station)",
                    state="Madhya Pradesh",
                    country="India",
                    latitude=22.057,
                    longitude=78.938,
                    elevation=675.0,
                    station_type="LIVE_LOCATION",
                    provider="open_meteo",
                    status="HEALTHY"
                ),
                Station(
                    station_code="AWS-SIM-LAB",
                    station_name="Simulation Lab (Virtual Testing AWS Node)",
                    state="Madhya Pradesh",
                    country="India",
                    latitude=20.593,
                    longitude=78.962,
                    elevation=310.0,
                    station_type="SIMULATED_AWS",
                    provider="SIMULATED AWS DATA",
                    status="HEALTHY"
                )
            ]
            db.add_all(stations)
            db.commit()
            logger.info("Automatic Weather Stations seeded.")

            # Create SensorHealth records for each station
            all_stations = db.query(Station).all()
            for stn in all_stations:
                for stype in ["TEMPERATURE", "PRESSURE", "HUMIDITY"]:
                    sh = SensorHealth(
                        station_id=stn.id,
                        sensor_type=stype,
                        health_score=96.0 if stn.station_code != "AWS-CHN-08" else 78.0,
                        degradation_rate=0.2,
                        failure_risk="LOW" if stn.station_code != "AWS-CHN-08" else "MEDIUM"
                    )
                    db.add(sh)
            db.commit()

            # Seed realistic historical observations for each station across past 24 hours
            now = datetime.now(timezone.utc)
            for stn in all_stations:
                base_temp = 32.0 if "JDH" in stn.station_code else (18.0 if "SHM" in stn.station_code else 28.5)
                base_pres = 1008.0 if stn.elevation < 500 else 790.0
                base_hum = 35.0 if "JDH" in stn.station_code else 72.0

                for i in range(12, 0, -1):
                    reading_time = now - timedelta(minutes=i * 10)
                    t_val = round(base_temp + (i % 3) * 0.4, 1)
                    p_val = round(base_pres + (i % 2) * 0.3, 1)
                    h_val = round(base_hum - (i % 4) * 0.8, 1)

                    wr = WeatherReading(
                        station_id=stn.id,
                        timestamp=reading_time,
                        retrieval_timestamp=reading_time,
                        temperature=t_val,
                        pressure=p_val,
                        humidity=h_val,
                        provider="Open-Meteo" if stn.station_type != "SIMULATED_AWS" else "SIMULATED AWS DATA",
                        is_stale=False,
                        is_simulated=stn.station_type == "SIMULATED_AWS"
                    )
                    db.add(wr)
                    db.flush()

                    qc = DataQualityResult(
                        reading_id=wr.id,
                        station_id=stn.id,
                        is_valid=True,
                        qc_flags=[],
                        missing_check=True,
                        range_check=True,
                        jump_check=True,
                        flatline_check=True,
                        details="All data quality checks passed."
                    )
                    db.add(qc)

                    ts = TrustScore(
                        reading_id=wr.id,
                        station_id=stn.id,
                        timestamp=reading_time,
                        overall_score=96.5,
                        category="TRUSTED",
                        data_quality_score=100.0,
                        temporal_score=97.0,
                        multivariate_score=95.0,
                        historical_score=96.0,
                        freshness_score=100.0,
                        sensor_health_score=95.0,
                        details={"data_quality": 100, "temporal": 97, "multivariate": 95, "historical": 96, "freshness": 100, "sensor_health": 95}
                    )
                    db.add(ts)

                    anom = Anomaly(
                        reading_id=wr.id,
                        station_id=stn.id,
                        timestamp=reading_time,
                        composite_score=8.5,
                        severity="NORMAL",
                        status="NORMAL",
                        probable_cause="Nominal Operation",
                        confidence=98.0,
                        rule_score=0.0,
                        statistical_score=5.0,
                        isolation_forest_score=10.0,
                        temporal_score=8.0,
                        multivariate_score=6.0,
                        evidence_summary="All parameters within normal operational baseline."
                    )
                    db.add(anom)

            db.commit()
            logger.info("Initial historical baseline readings and trust scores seeded.")

    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
