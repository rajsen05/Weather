import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.trust import WeatherTrustScoreEngine

def test_trust_score_clean():
    qc_res = {"rule_score": 100.0, "is_valid": True}
    temp_res = {"temporal_score": 5.0}
    multi_res = {"multivariate_score": 0.0}
    stat_res = {"statistical_score": 4.0}
    
    score = WeatherTrustScoreEngine.calculate(
        qc_result=qc_res,
        temporal_result=temp_res,
        multivariate_result=multi_res,
        statistical_result=stat_res,
        composite_anomaly_score=5.0,
        data_age_seconds=20,
        avg_sensor_health=98.0
    )
    assert score["overall_score"] >= 85.0
    assert score["category"] == "TRUSTED"

def test_trust_score_severe_anomaly():
    qc_res = {"rule_score": 40.0, "is_valid": False}
    temp_res = {"temporal_score": 90.0}
    multi_res = {"multivariate_score": 85.0}
    stat_res = {"statistical_score": 95.0}
    
    score = WeatherTrustScoreEngine.calculate(
        qc_result=qc_res,
        temporal_result=temp_res,
        multivariate_result=multi_res,
        statistical_result=stat_res,
        composite_anomaly_score=92.0,
        data_age_seconds=20,
        avg_sensor_health=50.0
    )
    assert score["overall_score"] < 40.0
    assert score["category"] == "LOW_TRUST"
