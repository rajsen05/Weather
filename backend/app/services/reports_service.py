import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.models import (
    Station, WeatherReading, Anomaly, TrustScore, SensorHealth,
    MaintenanceAlert, CorrectedReading, AuditLog
)

class ReportsService:
    @staticmethod
    def generate_anomalies_csv(db: Session) -> str:
        anomalies = (
            db.query(Anomaly, Station, WeatherReading)
            .join(Station, Anomaly.station_id == Station.id)
            .join(WeatherReading, Anomaly.reading_id == WeatherReading.id)
            .order_by(Anomaly.timestamp.desc())
            .limit(500)
            .all()
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Anomaly ID", "Timestamp (UTC)", "Station Code", "Station Name", "State",
            "Observed Temp (°C)", "Observed Pressure (hPa)", "Observed Humidity (%)",
            "Composite Anomaly Score", "Severity", "Lifecycle Status", "Probable Cause",
            "Confidence (%)", "Evidence Summary"
        ])

        for anom, station, reading in anomalies:
            writer.writerow([
                anom.id,
                anom.timestamp.isoformat(),
                station.station_code,
                station.station_name,
                station.state or "",
                reading.temperature,
                reading.pressure,
                reading.humidity,
                anom.composite_score,
                anom.severity,
                anom.status,
                anom.probable_cause,
                anom.confidence,
                anom.evidence_summary or ""
            ])

        return output.getvalue()

    @staticmethod
    def generate_trust_scores_csv(db: Session) -> str:
        scores = (
            db.query(TrustScore, Station, WeatherReading)
            .join(Station, TrustScore.station_id == Station.id)
            .join(WeatherReading, TrustScore.reading_id == WeatherReading.id)
            .order_by(TrustScore.timestamp.desc())
            .limit(500)
            .all()
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Trust ID", "Timestamp (UTC)", "Station Code", "Station Name",
            "Overall Trust Score (0-100)", "Trust Category", "Data Quality Score",
            "Temporal Score", "Multivariate Score", "Historical Score",
            "Freshness Score", "Sensor Health Score"
        ])

        for ts, station, reading in scores:
            writer.writerow([
                ts.id,
                ts.timestamp.isoformat(),
                station.station_code,
                station.station_name,
                ts.overall_score,
                ts.category,
                ts.data_quality_score,
                ts.temporal_score,
                ts.multivariate_score,
                ts.historical_score,
                ts.freshness_score,
                ts.sensor_health_score
            ])

        return output.getvalue()

    @staticmethod
    def generate_audit_ledger_csv(db: Session) -> str:
        logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(500).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Audit ID", "Timestamp (UTC)", "Entity Type", "Entity ID",
            "Action", "Pipeline Stage", "Details"
        ])

        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp.isoformat(),
                log.entity_type,
                log.entity_id,
                log.action,
                log.stage,
                log.details or ""
            ])

        return output.getvalue()

reports_service = ReportsService()
