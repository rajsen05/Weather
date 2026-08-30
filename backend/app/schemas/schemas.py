from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    email: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "VIEWER"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Station Schemas
class StationBase(BaseModel):
    station_code: str
    station_name: str
    state: Optional[str] = None
    country: str = "India"
    latitude: float
    longitude: float
    elevation: float = 0.0
    station_type: str = "LIVE_LOCATION" # LIVE_LOCATION, SIMULATED_AWS, OFFICIAL_IMD
    provider: str = "open_meteo"

class StationCreate(StationBase):
    pass

class StationOut(StationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    latest_reading: Optional[Dict[str, Any]] = None
    latest_trust_score: Optional[float] = None
    latest_anomaly_status: Optional[str] = None
    sensor_health_summary: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Weather & Reading Schemas
class WeatherReadingOut(BaseModel):
    id: int
    station_id: int
    timestamp: datetime
    retrieval_timestamp: datetime
    temperature: Optional[float] = None
    pressure: Optional[float] = None
    humidity: Optional[float] = None
    dew_point: Optional[float] = None
    wind_speed: Optional[float] = None
    precipitation: Optional[float] = None
    provider: str
    is_stale: bool
    is_simulated: bool

    class Config:
        from_attributes = True

class LiveWeatherCard(BaseModel):
    station_id: int
    station_name: str
    state: Optional[str]
    country: str
    latitude: float
    longitude: float
    station_type: str
    provider: str
    temperature: Optional[float]
    pressure: Optional[float]
    humidity: Optional[float]
    temp_change_1h: Optional[float] = 0.0
    pressure_change_1h: Optional[float] = 0.0
    humidity_change_1h: Optional[float] = 0.0
    observation_time: datetime
    retrieval_time: datetime
    data_age_seconds: int
    is_stale: bool
    trust_score: float
    trust_category: str
    anomaly_status: str
    anomaly_severity: str
    active_root_cause: Optional[str] = None

# Anomaly & Evidence Schemas
class AnomalyEvidenceOut(BaseModel):
    id: int
    verification_step: int
    observation_value: Optional[float]
    expected_value: Optional[float]
    divergence: Optional[float]
    parameter: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AnomalyOut(BaseModel):
    id: int
    reading_id: int
    station_id: int
    timestamp: datetime
    composite_score: float
    severity: str
    status: str
    probable_cause: str
    confidence: float
    rule_score: float
    statistical_score: float
    isolation_forest_score: float
    temporal_score: float
    multivariate_score: float
    evidence_summary: Optional[str]
    created_at: datetime
    evidences: List[AnomalyEvidenceOut] = []

    class Config:
        from_attributes = True

# Trust Score Breakdown
class TrustScoreOut(BaseModel):
    id: int
    reading_id: int
    station_id: int
    timestamp: datetime
    overall_score: float
    category: str
    data_quality_score: float
    temporal_score: float
    multivariate_score: float
    historical_score: float
    freshness_score: float
    sensor_health_score: float
    details: Dict[str, Any] = {}

    class Config:
        from_attributes = True

# Sensor Health & Maintenance
class SensorHealthOut(BaseModel):
    id: int
    station_id: int
    sensor_type: str
    health_score: float
    degradation_rate: float
    failure_risk: str
    total_anomalies_24h: int
    total_flatlines_24h: int
    last_evaluated_at: datetime

    class Config:
        from_attributes = True

class MaintenanceAlertOut(BaseModel):
    id: int
    station_id: int
    sensor_type: str
    severity: str
    title: str
    recommendation: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Corrected Reading / Self-Healing
class CorrectedReadingOut(BaseModel):
    id: int
    reading_id: int
    station_id: int
    parameter: str
    original_value: Optional[float]
    corrected_value: Optional[float]
    model_temporal_estimate: Optional[float]
    model_historical_estimate: Optional[float]
    model_multivariate_estimate: Optional[float]
    model_agreement_percent: float
    is_auto_corrected: bool
    status: str
    confidence: float
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True

# Fault Fingerprint
class FaultFingerprintOut(BaseModel):
    id: int
    fingerprint_code: str
    fault_type: str
    description: Optional[str]
    duration_readings: int
    magnitude: float
    sensor_type: str
    feature_signature: Dict[str, Any]
    match_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log
class AuditLogOut(BaseModel):
    id: int
    entity_type: str
    entity_id: Optional[int]
    action: str
    stage: str
    before_state: Optional[Dict[str, Any]]
    after_state: Optional[Dict[str, Any]]
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

# Simulation Inject Request
class SimulationInjectRequest(BaseModel):
    station_id: int
    scenario_type: str # TEMP_SPIKE, SENSOR_DRIFT, FROZEN_SENSOR, MISSING_DATA, COMM_GAP, MULTI_STORM
    parameter: str = "temperature"
    magnitude: Optional[float] = None
    duration_steps: int = 5

# Geocoding search
class LocationSearchResult(BaseModel):
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    admin1: Optional[str] = None
    timezone: Optional[str] = None

# Executive Dashboard Summary
class DashboardSummary(BaseModel):
    total_stations: int
    live_locations_count: int
    simulated_stations_count: int
    active_anomalies_count: int
    avg_trust_score: float
    healthy_sensors_percentage: float
    maintenance_risks_count: int
    data_freshness_status: str
    recent_anomalies: List[Dict[str, Any]]
    sensor_health_distribution: Dict[str, int]
    trust_category_distribution: Dict[str, int]
