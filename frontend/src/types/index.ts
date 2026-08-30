export type UserRole = "ADMIN" | "OPERATOR" | "MAINTENANCE" | "RESEARCHER" | "VIEWER";

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LocationSearchResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole;
}

export interface Station {
  id: number;
  station_code: string;
  station_name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
  station_type: "LIVE_LOCATION" | "SIMULATED_AWS" | "OFFICIAL_IMD";
  provider: string;
  status: "HEALTHY" | "WATCH" | "DEGRADED" | "CRITICAL";
  created_at: string;
  updated_at: string;
  latest_reading?: {
    temperature: number | null;
    pressure: number | null;
    humidity: number | null;
    timestamp: string;
  };
  latest_trust_score?: number;
  latest_anomaly_status?: string;
  sensor_health_summary?: Record<string, number>;
}

export interface LiveWeatherCardData {
  station_id: number;
  station_name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  station_type: string;
  provider: string;
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
  temp_change_1h?: number;
  pressure_change_1h?: number;
  humidity_change_1h?: number;
  observation_time: string;
  retrieval_time: string;
  data_age_seconds: number;
  is_stale: boolean;
  trust_score: number;
  trust_category: "TRUSTED" | "UNCERTAIN" | "LOW_TRUST";
  anomaly_status: string;
  anomaly_severity: "NORMAL" | "WATCH" | "SUSPICIOUS" | "HIGH" | "CRITICAL";
  active_root_cause?: string;
}

export interface AnomalyRecord {
  id: number;
  reading_id: number;
  station_id: number;
  timestamp: string;
  composite_score: number;
  severity: "NORMAL" | "WATCH" | "SUSPICIOUS" | "HIGH" | "CRITICAL";
  status: "NORMAL" | "SUSPICIOUS" | "UNDER_VERIFICATION" | "CONFIRMED_ANOMALY" | "CONFIRMED_GENUINE_WEATHER_EVENT" | "RESOLVED";
  probable_cause: string;
  confidence: number;
  rule_score: number;
  statistical_score: number;
  isolation_forest_score: number;
  temporal_score: number;
  multivariate_score: number;
  evidence_summary?: string;
  station_code?: string;
  station_name?: string;
}

export interface SensorHealthRecord {
  id: number;
  station_id: number;
  sensor_type: "TEMPERATURE" | "PRESSURE" | "HUMIDITY";
  health_score: number;
  degradation_rate: number;
  failure_risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  total_anomalies_24h: number;
  total_flatlines_24h: number;
  last_evaluated_at: string;
}

export interface MaintenanceAlertRecord {
  id: number;
  station_id: number;
  station_code?: string;
  station_name?: string;
  sensor_type: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  title: string;
  recommendation: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  created_at: string;
  resolved_at?: string;
}

export interface CorrectedReadingRecord {
  id: number;
  reading_id: number;
  station_id: number;
  parameter: string;
  original_value: number | null;
  corrected_value: number | null;
  model_temporal_estimate?: number;
  model_historical_estimate?: number;
  model_multivariate_estimate?: number;
  model_agreement_percent: number;
  is_auto_corrected: boolean;
  status: "SAFE_ESTIMATE" | "HUMAN_VERIFICATION_REQUIRED";
  confidence: number;
  reason: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: number;
  entity_type: string;
  entity_id?: number;
  action: string;
  stage: string;
  before_state?: any;
  after_state?: any;
  details?: string;
  timestamp: string;
}

export interface DashboardSummaryData {
  total_stations: number;
  live_locations_count: number;
  simulated_stations_count: number;
  active_anomalies_count: number;
  avg_trust_score: number;
  healthy_sensors_percentage: number;
  maintenance_risks_count: number;
  data_freshness_status: string;
  recent_anomalies: any[];
  sensor_health_distribution: Record<string, number>;
  trust_category_distribution: Record<string, number>;
}
