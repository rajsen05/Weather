from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database.base import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="VIEWER", nullable=False) # ADMIN, OPERATOR, MAINTENANCE, RESEARCHER, VIEWER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(50), unique=True, index=True, nullable=False)
    station_name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, default=0.0)
    station_type = Column(String(50), default="LIVE_LOCATION") # LIVE_LOCATION, SIMULATED_AWS, OFFICIAL_IMD
    provider = Column(String(50), default="open_meteo")
    status = Column(String(50), default="HEALTHY") # HEALTHY, WATCH, DEGRADED, CRITICAL
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    readings = relationship("WeatherReading", back_populates="station", cascade="all, delete-orphan")
    sensor_health_records = relationship("SensorHealth", back_populates="station", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="station", cascade="all, delete-orphan")
    maintenance_alerts = relationship("MaintenanceAlert", back_populates="station", cascade="all, delete-orphan")

class WeatherReading(Base):
    __tablename__ = "weather_readings"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    retrieval_timestamp = Column(DateTime, default=utc_now)
    
    temperature = Column(Float, nullable=True) # °C
    pressure = Column(Float, nullable=True)    # hPa
    humidity = Column(Float, nullable=True)    # %
    dew_point = Column(Float, nullable=True)   # °C
    wind_speed = Column(Float, nullable=True)  # km/h
    precipitation = Column(Float, nullable=True) # mm
    
    provider = Column(String(50), default="open_meteo")
    is_stale = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=False)
    raw_payload = Column(Text, nullable=True)

    station = relationship("Station", back_populates="readings")
    quality_result = relationship("DataQualityResult", back_populates="reading", uselist=False, cascade="all, delete-orphan")
    trust_score = relationship("TrustScore", back_populates="reading", uselist=False, cascade="all, delete-orphan")
    anomaly = relationship("Anomaly", back_populates="reading", uselist=False, cascade="all, delete-orphan")
    corrected_readings = relationship("CorrectedReading", back_populates="reading", cascade="all, delete-orphan")

class DataQualityResult(Base):
    __tablename__ = "data_quality_results"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("weather_readings.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    is_valid = Column(Boolean, default=True)
    qc_flags = Column(JSON, default=list)
    missing_check = Column(Boolean, default=True)
    range_check = Column(Boolean, default=True)
    jump_check = Column(Boolean, default=True)
    flatline_check = Column(Boolean, default=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("WeatherReading", back_populates="quality_result")

class FeatureVector(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("weather_readings.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    
    temp_lag_1 = Column(Float, nullable=True)
    temp_lag_2 = Column(Float, nullable=True)
    temp_roc = Column(Float, nullable=True) # Rate of change
    temp_rolling_mean_5m = Column(Float, nullable=True)
    temp_rolling_std_5m = Column(Float, nullable=True)
    
    pressure_roc = Column(Float, nullable=True)
    pressure_rolling_mean_5m = Column(Float, nullable=True)
    
    humidity_roc = Column(Float, nullable=True)
    humidity_rolling_mean_5m = Column(Float, nullable=True)
    
    hour_sin = Column(Float, nullable=True)
    hour_cos = Column(Float, nullable=True)
    dew_point_spread = Column(Float, nullable=True) # Temp - Dew Point
    barometric_tendency = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("weather_readings.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False)
    
    composite_score = Column(Float, default=0.0) # 0 to 100
    severity = Column(String(50), default="NORMAL") # NORMAL, WATCH, SUSPICIOUS, HIGH, CRITICAL
    status = Column(String(50), default="NORMAL") # NORMAL, SUSPICIOUS, UNDER_VERIFICATION, CONFIRMED_ANOMALY, CONFIRMED_GENUINE_WEATHER_EVENT, RESOLVED
    
    probable_cause = Column(String(100), default="None")
    confidence = Column(Float, default=0.0) # 0 to 100%
    
    rule_score = Column(Float, default=0.0)
    statistical_score = Column(Float, default=0.0)
    isolation_forest_score = Column(Float, default=0.0)
    temporal_score = Column(Float, default=0.0)
    multivariate_score = Column(Float, default=0.0)
    
    evidence_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    station = relationship("Station", back_populates="anomalies")
    reading = relationship("WeatherReading", back_populates="anomaly")
    evidences = relationship("AnomalyEvidence", back_populates="anomaly", cascade="all, delete-orphan")

class AnomalyEvidence(Base):
    __tablename__ = "anomaly_evidence"

    id = Column(Integer, primary_key=True, index=True)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id"), nullable=False, index=True)
    verification_step = Column(Integer, default=1)
    reading_id = Column(Integer, nullable=True)
    observation_value = Column(Float, nullable=True)
    expected_value = Column(Float, nullable=True)
    divergence = Column(Float, nullable=True)
    parameter = Column(String(50), default="temperature")
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    anomaly = relationship("Anomaly", back_populates="evidences")

class TrustScore(Base):
    __tablename__ = "trust_scores"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("weather_readings.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False)
    
    overall_score = Column(Float, default=100.0) # 0 to 100
    category = Column(String(50), default="TRUSTED") # TRUSTED (80-100), UNCERTAIN (50-79), LOW_TRUST (0-49)
    
    data_quality_score = Column(Float, default=100.0)
    temporal_score = Column(Float, default=100.0)
    multivariate_score = Column(Float, default=100.0)
    historical_score = Column(Float, default=100.0)
    freshness_score = Column(Float, default=100.0)
    sensor_health_score = Column(Float, default=100.0)
    
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("WeatherReading", back_populates="trust_score")

class SensorHealth(Base):
    __tablename__ = "sensor_health"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    sensor_type = Column(String(50), nullable=False) # TEMPERATURE, PRESSURE, HUMIDITY
    
    health_score = Column(Float, default=100.0) # 0 to 100
    degradation_rate = Column(Float, default=0.0) # points per day
    failure_risk = Column(String(50), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    
    total_anomalies_24h = Column(Integer, default=0)
    total_flatlines_24h = Column(Integer, default=0)
    last_evaluated_at = Column(DateTime, default=utc_now)

    station = relationship("Station", back_populates="sensor_health_records")

class FaultFingerprint(Base):
    __tablename__ = "fault_fingerprints"

    id = Column(Integer, primary_key=True, index=True)
    fingerprint_code = Column(String(50), unique=True, index=True, nullable=False)
    fault_type = Column(String(100), nullable=False) # Temperature Spike, Frozen Sensor, Gradual Drift, Communication Gap, etc.
    description = Column(Text, nullable=True)
    duration_readings = Column(Integer, default=1)
    magnitude = Column(Float, default=0.0)
    sensor_type = Column(String(50), default="TEMPERATURE")
    feature_signature = Column(JSON, nullable=False) # Normalized vector
    match_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=utc_now)

class MaintenanceAlert(Base):
    __tablename__ = "maintenance_alerts"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    sensor_type = Column(String(50), nullable=False)
    severity = Column(String(50), default="WARNING") # INFO, WARNING, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    recommendation = Column(Text, nullable=False)
    status = Column(String(50), default="ACTIVE") # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)

    station = relationship("Station", back_populates="maintenance_alerts")

class CorrectedReading(Base):
    __tablename__ = "corrected_readings"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("weather_readings.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    parameter = Column(String(50), nullable=False) # temperature, pressure, humidity
    
    original_value = Column(Float, nullable=True) # IMMUTABLE RAW PRESERVED
    corrected_value = Column(Float, nullable=True)
    
    model_temporal_estimate = Column(Float, nullable=True)
    model_historical_estimate = Column(Float, nullable=True)
    model_multivariate_estimate = Column(Float, nullable=True)
    model_agreement_percent = Column(Float, default=0.0)
    
    is_auto_corrected = Column(Boolean, default=False)
    status = Column(String(50), default="SAFE_ESTIMATE") # SAFE_ESTIMATE, HUMAN_VERIFICATION_REQUIRED
    confidence = Column(Float, default=0.0)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("WeatherReading", back_populates="corrected_readings")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    stage = Column(String(100), nullable=False) # INGESTION, QC, FEATURE_ENG, ML_ANOMALY, TRUST_SCORE, EVIDENCE, SELF_HEALING, OVERWRITE_PRESERVED
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    user_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)

class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id = Column(Integer, primary_key=True, index=True)
    scenario_type = Column(String(100), nullable=False) # TEMP_SPIKE, SENSOR_DRIFT, FROZEN_SENSOR, MISSING_DATA, COMM_GAP, MULTI_STORM
    target_station_id = Column(Integer, nullable=False)
    parameter = Column(String(50), default="temperature")
    injected_value = Column(Float, nullable=True)
    duration_steps = Column(Integer, default=5)
    current_step = Column(Integer, default=0)
    status = Column(String(50), default="ACTIVE") # ACTIVE, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=utc_now)
