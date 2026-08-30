import logging
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.models import (
    Station, WeatherReading, DataQualityResult, FeatureVector,
    Anomaly, AnomalyEvidence, TrustScore, SensorHealth,
    FaultFingerprint, MaintenanceAlert, CorrectedReading, AuditLog
)
from app.ml.qc.rules import DataQualityEngine
from app.ml.detectors.statistical import StatisticalDetector
from app.ml.detectors.isolation_forest import isolation_forest_detector
from app.ml.detectors.temporal import TemporalDetector
from app.ml.detectors.multivariate import MultivariateConsistencyDetector
from app.ml.fusion import AnomalyFusionEngine
from app.ml.trust import WeatherTrustScoreEngine
from app.ml.verification import AdaptiveEvidenceVerificationEngine
from app.ml.diagnosis import RootCauseClassifier
from app.ml.fingerprints import FaultFingerprintEngine
from app.ml.health import SensorHealthEngine
from app.ml.healing import ConsensusSelfHealingEngine
from app.ml.xai import ExplainableAIEngine

logger = logging.getLogger(__name__)

class ObservationPipeline:
    """
    Complete End-to-End Meteorological Intelligence Pipeline for SkyGuard AI:
    Ingestion -> QC -> Feature Engineering -> Hybrid ML -> Fusion -> Verification ->
    Trust Score -> Diagnosis -> Fingerprints -> Sensor Health -> Self Healing -> Audit & DB
    """

    @classmethod
    def process_observation(
        cls,
        db: Session,
        station: Station,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        dew_point: Optional[float] = None,
        wind_speed: Optional[float] = None,
        precipitation: Optional[float] = None,
        obs_timestamp: Optional[datetime] = None,
        provider: str = "Open-Meteo",
        is_simulated: bool = False,
        raw_payload: Optional[str] = None
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        timestamp = obs_timestamp or now

        # 1. Fetch recent history for station
        recent_readings = (
            db.query(WeatherReading)
            .filter(WeatherReading.station_id == station.id)
            .order_by(WeatherReading.timestamp.desc())
            .limit(20)
            .all()
        )
        recent_dicts = [
            {
                "temperature": r.temperature,
                "pressure": r.pressure,
                "humidity": r.humidity,
                "timestamp": r.timestamp,
                "is_valid": True
            }
            for r in reversed(recent_readings)
        ]

        # 2. Stage 1: Data Quality QC
        qc_result = DataQualityEngine.check_reading(
            temperature=temperature,
            pressure=pressure,
            humidity=humidity,
            prev_readings=recent_dicts
        )

        # 3. Stage 2: Temporal Dynamics
        temporal_result = TemporalDetector.evaluate(
            temperature=temperature,
            pressure=pressure,
            humidity=humidity,
            history=recent_dicts
        )

        # 4. Stage 3: Statistical Detection (Modified Z, MAD, IQR)
        statistical_result = StatisticalDetector.evaluate(
            temperature=temperature,
            pressure=pressure,
            humidity=humidity,
            history=recent_dicts
        )

        # 5. Stage 4: Multivariate Consistency
        multivariate_result = MultivariateConsistencyDetector.evaluate(
            temperature=temperature,
            pressure=pressure,
            humidity=humidity,
            temp_roc=temporal_result["temp_roc"],
            pres_roc=temporal_result["pres_roc"],
            hum_roc=temporal_result["hum_roc"]
        )

        # 6. Stage 5: Isolation Forest Ensemble
        if_result = isolation_forest_detector.predict(
            temperature=temperature,
            pressure=pressure,
            humidity=humidity,
            temp_roc=temporal_result["temp_roc"],
            pres_roc=temporal_result["pres_roc"],
            hum_roc=temporal_result["hum_roc"]
        )

        # 7. Stage 6: Anomaly Fusion
        fusion_result = AnomalyFusionEngine.fuse(
            qc_result=qc_result,
            statistical_result=statistical_result,
            if_result=if_result,
            temporal_result=temporal_result,
            multivariate_result=multivariate_result
        )
        composite_score = fusion_result["composite_score"]
        severity = fusion_result["severity"]

        # 8. Stage 7: Root Cause Classification
        diagnosis_result = RootCauseClassifier.classify(
            qc_result=qc_result,
            temporal_result=temporal_result,
            multivariate_result=multivariate_result,
            statistical_result=statistical_result,
            composite_score=composite_score
        )

        # 9. Stage 8: Fault Fingerprint Matching
        is_isolated = "ISOLATED" in multivariate_result.get("coherence_type", "")
        bounds_violation = not qc_result.get("range_check", True)
        fingerprint_vector = FaultFingerprintEngine.extract_vector(
            temp_roc=temporal_result["temp_roc"],
            pres_roc=temporal_result["pres_roc"],
            hum_roc=temporal_result["hum_roc"],
            temp_z=statistical_result["temp_mod_z"],
            pres_z=statistical_result["pressure_mod_z"],
            hum_z=statistical_result["humidity_mod_z"],
            is_isolated=is_isolated,
            is_bounds_violation=bounds_violation
        )
        fingerprint_match = FaultFingerprintEngine.find_nearest_fingerprint(fingerprint_vector)

        # 10. Stage 9: Adaptive Evidence Verification
        # Check if there is an active ongoing anomaly on station
        last_anomaly = (
            db.query(Anomaly)
            .filter(Anomaly.station_id == station.id)
            .order_by(Anomaly.timestamp.desc())
            .first()
        )
        current_status = last_anomaly.status if last_anomaly else "NORMAL"
        verification_history = []
        if last_anomaly and last_anomaly.status == "UNDER_VERIFICATION":
            verification_history = db.query(AnomalyEvidence).filter(AnomalyEvidence.anomaly_id == last_anomaly.id).all()

        verification_result = AdaptiveEvidenceVerificationEngine.evaluate_lifecycle(
            composite_score=composite_score,
            current_status=current_status,
            verification_history=[{"step": e.verification_step} for e in verification_history],
            multivariate_coherence=multivariate_result.get("is_probable_weather_event", False)
        )

        # 11. Stage 10: Sensor Health & Maintenance Update
        sensor_health_records = db.query(SensorHealth).filter(SensorHealth.station_id == station.id).all()
        sensor_health_map = {sh.sensor_type: sh for sh in sensor_health_records}

        avg_health = 100.0
        if sensor_health_records:
            avg_health = float(sum(sh.health_score for sh in sensor_health_records) / len(sensor_health_records))

        for stype in ["TEMPERATURE", "PRESSURE", "HUMIDITY"]:
            sh_rec = sensor_health_map.get(stype)
            if not sh_rec:
                sh_rec = SensorHealth(
                    station_id=station.id,
                    sensor_type=stype,
                    health_score=100.0,
                    degradation_rate=0.0,
                    failure_risk="LOW"
                )
                db.add(sh_rec)
                db.flush()
                sensor_health_map[stype] = sh_rec

            is_sensor_anom = False
            if stype == "TEMPERATURE" and (abs(temporal_result["temp_roc"]) > 4.0 or statistical_result["temp_mod_z"] > 3.0):
                is_sensor_anom = True
            elif stype == "PRESSURE" and (abs(temporal_result["pres_roc"]) > 8.0 or statistical_result["pressure_mod_z"] > 3.0):
                is_sensor_anom = True
            elif stype == "HUMIDITY" and (abs(temporal_result["hum_roc"]) > 20.0 or statistical_result["humidity_mod_z"] > 3.0):
                is_sensor_anom = True

            updated_health = SensorHealthEngine.update_health(
                current_health=sh_rec.health_score,
                sensor_type=stype,
                anomaly_detected=is_sensor_anom,
                is_flatline=not qc_result["flatline_check"],
                is_missing=not qc_result["missing_check"],
                anomaly_severity=severity
            )
            sh_rec.health_score = updated_health["health_score"]
            sh_rec.degradation_rate = updated_health["degradation_rate"]
            sh_rec.failure_risk = updated_health["failure_risk"]
            sh_rec.last_evaluated_at = now

            # If failure risk is HIGH or CRITICAL, create Maintenance Alert
            if updated_health["failure_risk"] in ["HIGH", "CRITICAL"]:
                existing_alert = (
                    db.query(MaintenanceAlert)
                    .filter(
                        MaintenanceAlert.station_id == station.id,
                        MaintenanceAlert.sensor_type == stype,
                        MaintenanceAlert.status == "ACTIVE"
                    )
                    .first()
                )
                if not existing_alert:
                    new_alert = MaintenanceAlert(
                        station_id=station.id,
                        sensor_type=stype,
                        severity="CRITICAL" if updated_health["failure_risk"] == "CRITICAL" else "HIGH",
                        title=f"{stype.capitalize()} Sensor Degradation Alert",
                        recommendation=updated_health["recommendation"],
                        status="ACTIVE"
                    )
                    db.add(new_alert)

        # 12. Stage 11: Weather Trust Score
        data_age_seconds = max(0, int((now - timestamp).total_seconds())) if timestamp.tzinfo else 0
        trust_result = WeatherTrustScoreEngine.calculate(
            qc_result=qc_result,
            temporal_result=temporal_result,
            multivariate_result=multivariate_result,
            statistical_result=statistical_result,
            composite_anomaly_score=composite_score,
            data_age_seconds=data_age_seconds,
            avg_sensor_health=avg_health
        )

        # 13. Stage 12: Consensus-Based Self-Healing (if suspicious or confirmed anomaly)
        corrected_estimates = {}
        if composite_score >= 40.0 or not qc_result["is_valid"]:
            # Evaluate healing for anomalous parameter
            target_param = "temperature"
            val = temperature
            if abs(temporal_result["pres_roc"]) > abs(temporal_result["temp_roc"]) and abs(temporal_result["pres_roc"]) > 5.0:
                target_param = "pressure"
                val = pressure
            elif abs(temporal_result["hum_roc"]) > 20.0:
                target_param = "humidity"
                val = humidity

            healing_result = ConsensusSelfHealingEngine.estimate_parameter(
                parameter=target_param,
                original_value=val,
                history=recent_dicts,
                current_context={"temperature": temperature, "pressure": pressure, "humidity": humidity},
                hour_of_day=timestamp.hour
            )
            corrected_estimates[target_param] = healing_result

        # 14. Stage 13: Explainable AI
        xai_result = ExplainableAIEngine.explain(
            qc_result=qc_result,
            temporal_result=temporal_result,
            multivariate_result=multivariate_result,
            statistical_result=statistical_result,
            if_result=if_result,
            trust_result=trust_result,
            root_cause_result=diagnosis_result,
            fingerprint_result=fingerprint_match
        )

        # 15. PERSIST TO DATABASE (Zero raw overwrite guarantee)
        # Weather Reading
        db_reading = WeatherReading(
            station_id=station.id,
            timestamp=timestamp,
            retrieval_timestamp=now,
            temperature=temperature,
            pressure=pressure,
            humidity=humidity,
            dew_point=dew_point,
            wind_speed=wind_speed,
            precipitation=precipitation,
            provider=provider,
            is_stale=data_age_seconds > 300,
            is_simulated=is_simulated,
            raw_payload=raw_payload
        )
        db.add(db_reading)
        db.flush()

        # QC Result
        db_qc = DataQualityResult(
            reading_id=db_reading.id,
            station_id=station.id,
            is_valid=qc_result["is_valid"],
            qc_flags=qc_result["flags"],
            missing_check=qc_result["missing_check"],
            range_check=qc_result["range_check"],
            jump_check=qc_result["jump_check"],
            flatline_check=qc_result["flatline_check"],
            details=qc_result["details"]
        )
        db.add(db_qc)

        # Feature Vector
        db_features = FeatureVector(
            reading_id=db_reading.id,
            station_id=station.id,
            timestamp=timestamp,
            temp_lag_1=recent_dicts[-1]["temperature"] if recent_dicts else None,
            temp_roc=temporal_result["temp_roc"],
            pressure_roc=temporal_result["pres_roc"],
            humidity_roc=temporal_result["hum_roc"]
        )
        db.add(db_features)

        # Trust Score
        db_trust = TrustScore(
            reading_id=db_reading.id,
            station_id=station.id,
            timestamp=timestamp,
            overall_score=trust_result["overall_score"],
            category=trust_result["category"],
            data_quality_score=trust_result["data_quality_score"],
            temporal_score=trust_result["temporal_score"],
            multivariate_score=trust_result["multivariate_score"],
            historical_score=trust_result["historical_score"],
            freshness_score=trust_result["freshness_score"],
            sensor_health_score=trust_result["sensor_health_score"],
            details=trust_result["details"]
        )
        db.add(db_trust)

        # Anomaly Record
        final_status = verification_result["status"]
        db_anomaly = Anomaly(
            reading_id=db_reading.id,
            station_id=station.id,
            timestamp=timestamp,
            composite_score=composite_score,
            severity=severity,
            status=final_status,
            probable_cause=diagnosis_result["root_cause"],
            confidence=diagnosis_result["confidence"],
            rule_score=fusion_result["rule_score"],
            statistical_score=fusion_result["statistical_score"],
            isolation_forest_score=fusion_result["isolation_forest_score"],
            temporal_score=fusion_result["temporal_score"],
            multivariate_score=fusion_result["multivariate_score"],
            evidence_summary=fusion_result["evidence_summary"]
        )
        db.add(db_anomaly)
        db.flush()

        # Evidence step if recorded
        if verification_result.get("evidence_step"):
            ev = verification_result["evidence_step"]
            db_ev = AnomalyEvidence(
                anomaly_id=db_anomaly.id,
                verification_step=ev["step"],
                reading_id=db_reading.id,
                observation_value=temperature,
                expected_value=recent_dicts[-1]["temperature"] if recent_dicts else temperature,
                divergence=ev["observation_divergence"],
                parameter="temperature",
                note=ev["note"]
            )
            db.add(db_ev)

        # Corrected Reading record (Immutability guarantee: original value kept alongside estimate)
        for p_name, heal_info in corrected_estimates.items():
            db_corr = CorrectedReading(
                reading_id=db_reading.id,
                station_id=station.id,
                parameter=p_name,
                original_value=heal_info["original_value"],
                corrected_value=heal_info["corrected_value"],
                model_temporal_estimate=heal_info["model_temporal_estimate"],
                model_historical_estimate=heal_info["model_historical_estimate"],
                model_multivariate_estimate=heal_info["model_multivariate_estimate"],
                model_agreement_percent=heal_info["agreement_percent"],
                is_auto_corrected=heal_info["is_auto_corrected"],
                status=heal_info["status"],
                confidence=heal_info["confidence"],
                reason=heal_info["reason"]
            )
            db.add(db_corr)

        # Audit Log Entry
        db_audit = AuditLog(
            entity_type="WeatherReading",
            entity_id=db_reading.id,
            action="INGEST_AND_EVALUATE",
            stage="PROVENANCE_CHAIN_COMPLETE",
            before_state=None,
            after_state={
                "station_id": station.id,
                "raw_temperature": temperature,
                "raw_pressure": pressure,
                "raw_humidity": humidity,
                "trust_score": trust_result["overall_score"],
                "anomaly_severity": severity,
                "status": final_status,
                "consensus_healing": list(corrected_estimates.keys())
            },
            details=f"Observation processed through 13-stage AI intelligence pipeline. Raw data preserved. Trust score: {trust_result['overall_score']}/100."
        )
        db.add(db_audit)

        # Update station overall status
        if severity == "CRITICAL" or final_status == "CONFIRMED_ANOMALY":
            station.status = "CRITICAL"
        elif severity == "HIGH":
            station.status = "DEGRADED"
        elif severity in ["WATCH", "SUSPICIOUS"]:
            station.status = "WATCH"
        else:
            station.status = "HEALTHY"

        db.commit()

        return {
            "reading_id": db_reading.id,
            "station_id": station.id,
            "station_name": station.station_name,
            "timestamp": timestamp.isoformat(),
            "temperature": temperature,
            "pressure": pressure,
            "humidity": humidity,
            "dew_point": dew_point,
            "wind_speed": wind_speed,
            "precipitation": precipitation,
            "qc": qc_result,
            "composite_score": composite_score,
            "severity": severity,
            "anomaly_status": final_status,
            "root_cause": diagnosis_result["root_cause"],
            "diagnosis_confidence": diagnosis_result["confidence"],
            "trust_score": trust_result["overall_score"],
            "trust_category": trust_result["category"],
            "trust_details": trust_result["details"],
            "fingerprint": fingerprint_match,
            "self_healing": corrected_estimates,
            "xai": xai_result
        }
