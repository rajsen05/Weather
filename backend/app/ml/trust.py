from typing import Dict, Any, Optional
from datetime import datetime, timezone

class WeatherTrustScoreEngine:
    """
    ⭐ Flagship USP 1: Weather Trust Score Engine (0-100)
    Calculates multi-dimensional credibility index for each weather observation:
    - Data Quality Integrity (25%)
    - Temporal Consistency (20%)
    - Multivariate Physical Consistency (20%)
    - Historical Baseline Consistency (15%)
    - Observation Freshness (10%)
    - Station Sensor Health (10%)
    """

    @classmethod
    def calculate(
        cls,
        qc_result: Dict[str, Any],
        temporal_result: Dict[str, Any],
        multivariate_result: Dict[str, Any],
        statistical_result: Dict[str, Any],
        composite_anomaly_score: float,
        data_age_seconds: int = 0,
        avg_sensor_health: float = 100.0
    ) -> Dict[str, Any]:
        # Sub-scores (0 to 100 where 100 is pristine)
        data_quality_score = float(qc_result.get("rule_score", 100.0))
        
        temporal_score = max(0.0, 100.0 - float(temporal_result.get("temporal_score", 0.0)))
        
        multivariate_score = max(0.0, 100.0 - float(multivariate_result.get("multivariate_score", 0.0)))
        
        stat_score = float(statistical_result.get("statistical_score", 0.0))
        historical_score = max(0.0, 100.0 - stat_score)
        
        # Freshness score: 100 if <= 60s; degrades by 1 point per 5s over 60s
        if data_age_seconds <= 60:
            freshness_score = 100.0
        else:
            freshness_score = max(0.0, 100.0 - ((data_age_seconds - 60) / 5.0))
            
        sensor_health_score = max(0.0, min(100.0, avg_sensor_health))

        # If data is completely missing or impossible, cap trust score hard
        if not qc_result.get("is_valid", True):
            data_quality_score = min(data_quality_score, 40.0)

        # Weighted calculation
        overall_score = (
            0.25 * data_quality_score +
            0.20 * temporal_score +
            0.20 * multivariate_score +
            0.15 * historical_score +
            0.10 * freshness_score +
            0.10 * sensor_health_score
        )

        # Cap trust score based on severe anomalies
        if composite_anomaly_score > 75.0:
            overall_score = min(overall_score, 100.0 - (composite_anomaly_score * 0.7))

        overall_score = float(round(max(0.0, min(100.0, overall_score)), 1))

        # Categorization
        if overall_score >= 80.0:
            category = "TRUSTED"
        elif overall_score >= 50.0:
            category = "UNCERTAIN"
        else:
            category = "LOW_TRUST"

        breakdown = {
            "data_quality": round(data_quality_score, 1),
            "temporal": round(temporal_score, 1),
            "multivariate": round(multivariate_score, 1),
            "historical": round(historical_score, 1),
            "freshness": round(freshness_score, 1),
            "sensor_health": round(sensor_health_score, 1)
        }

        return {
            "overall_score": overall_score,
            "category": category,
            "data_quality_score": round(data_quality_score, 1),
            "temporal_score": round(temporal_score, 1),
            "multivariate_score": round(multivariate_score, 1),
            "historical_score": round(historical_score, 1),
            "freshness_score": round(freshness_score, 1),
            "sensor_health_score": round(sensor_health_score, 1),
            "details": breakdown
        }
