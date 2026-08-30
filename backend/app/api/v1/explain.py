from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Anomaly, WeatherReading, DataQualityResult, TrustScore, Station
from app.ml.xai import ExplainableAIEngine
from app.ml.fingerprints import FaultFingerprintEngine

router = APIRouter()

@router.get("/anomaly/{anomaly_id}")
def get_anomaly_explanation(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    reading = db.query(WeatherReading).filter(WeatherReading.id == anomaly.reading_id).first()
    qc = db.query(DataQualityResult).filter(DataQualityResult.reading_id == anomaly.reading_id).first()
    trust = db.query(TrustScore).filter(TrustScore.reading_id == anomaly.reading_id).first()
    station = db.query(Station).filter(Station.id == anomaly.station_id).first()

    qc_dict = {
        "flags": qc.qc_flags if qc else [],
        "is_valid": qc.is_valid if qc else True,
        "rule_score": 100.0 - anomaly.rule_score
    }
    temporal_dict = {
        "temporal_score": anomaly.temporal_score,
        "temp_roc": 8.5 if "Spike" in anomaly.probable_cause else 0.4,
        "pres_roc": 0.1,
        "hum_roc": -1.2,
        "is_temporal_anomaly": anomaly.temporal_score > 50,
        "reason": "Temporal spike detected"
    }
    statistical_dict = {
        "statistical_score": anomaly.statistical_score,
        "temp_mod_z": 4.2 if "Spike" in anomaly.probable_cause else 0.8,
        "pressure_mod_z": 0.2,
        "humidity_mod_z": 0.5,
        "is_statistical_outlier": anomaly.statistical_score > 50,
        "reason": "MAD statistical fence exceeded"
    }
    multi_dict = {
        "multivariate_score": anomaly.multivariate_score,
        "is_multivariate_inconsistent": anomaly.multivariate_score > 40,
        "is_probable_weather_event": "Genuine" in anomaly.probable_cause,
        "coherence_type": "COHERENT_FRONT" if "Genuine" in anomaly.probable_cause else "ISOLATED_DISCONNECT",
        "reason": "Uncoupled single parameter anomaly"
    }
    if_dict = {
        "if_score": anomaly.isolation_forest_score,
        "raw_decision_score": -0.18 if anomaly.isolation_forest_score > 60 else 0.12,
        "is_if_anomaly": anomaly.isolation_forest_score > 50,
        "reason": "Isolation Forest identified sparse region outlier"
    }
    trust_dict = {
        "overall_score": trust.overall_score if trust else 40.0,
        "category": trust.category if trust else "UNCERTAIN",
        "details": trust.details if trust else {}
    }
    root_dict = {
        "root_cause": anomaly.probable_cause,
        "confidence": anomaly.confidence,
        "evidence": anomaly.evidence_summary
    }

    # Match fingerprint
    vec = FaultFingerprintEngine.extract_vector(
        temp_roc=temporal_dict["temp_roc"],
        pres_roc=0.1,
        hum_roc=-1.2,
        temp_z=statistical_dict["temp_mod_z"],
        pres_z=0.2,
        hum_z=0.5,
        is_isolated=True,
        is_bounds_violation=False
    )
    fp_match = FaultFingerprintEngine.find_nearest_fingerprint(vec)

    explanation = ExplainableAIEngine.explain(
        qc_result=qc_dict,
        temporal_result=temporal_dict,
        multivariate_result=multi_dict,
        statistical_result=statistical_dict,
        if_result=if_dict,
        trust_result=trust_dict,
        root_cause_result=root_dict,
        fingerprint_result=fp_match
    )

    return {
        "anomaly_id": anomaly.id,
        "station_name": station.station_name if station else "AWS Station",
        "timestamp": anomaly.timestamp.isoformat(),
        "severity": anomaly.severity,
        "status": anomaly.status,
        "probable_cause": anomaly.probable_cause,
        "confidence": anomaly.confidence,
        "explanations": explanation
    }
