from typing import Dict, Any

class AnomalyFusionEngine:
    """
    Fuses outputs from hybrid detection subsystems:
    1. Rule-Based Quality Check (QC)
    2. Statistical Detector (Modified Z-Score / MAD / IQR)
    3. Isolation Forest ML Model
    4. Temporal Sequence Dynamics
    5. Multivariate Thermodynamic Coupling
    """

    # Configurable weights
    WEIGHTS = {
        "qc_rule": 0.25,
        "statistical": 0.20,
        "isolation_forest": 0.20,
        "temporal": 0.20,
        "multivariate": 0.15
    }

    @classmethod
    def fuse(
        cls,
        qc_result: Dict[str, Any],
        statistical_result: Dict[str, Any],
        if_result: Dict[str, Any],
        temporal_result: Dict[str, Any],
        multivariate_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        # QC penalty: rule_score is 100 for clean, so inverted penalty = 100 - rule_score
        qc_penalty = 100.0 - qc_result.get("rule_score", 100.0)
        stat_score = statistical_result.get("statistical_score", 0.0)
        if_score = if_result.get("if_score", 0.0)
        temp_score = temporal_result.get("temporal_score", 0.0)
        multi_score = multivariate_result.get("multivariate_score", 0.0)

        # Composite score
        composite_score = (
            cls.WEIGHTS["qc_rule"] * qc_penalty +
            cls.WEIGHTS["statistical"] * stat_score +
            cls.WEIGHTS["isolation_forest"] * if_score +
            cls.WEIGHTS["temporal"] * temp_score +
            cls.WEIGHTS["multivariate"] * multi_score
        )

        composite_score = min(100.0, max(0.0, composite_score))

        # Severity Classification
        if composite_score <= 30.0:
            severity = "NORMAL"
        elif composite_score <= 50.0:
            severity = "WATCH"
        elif composite_score <= 70.0:
            severity = "SUSPICIOUS"
        elif composite_score <= 85.0:
            severity = "HIGH"
        else:
            severity = "CRITICAL"

        evidence_items = []
        if qc_result.get("flags"):
            evidence_items.append(f"QC: {', '.join(qc_result['flags'])}")
        if statistical_result.get("is_statistical_outlier"):
            evidence_items.append(f"Stat: {statistical_result['reason']}")
        if if_result.get("is_if_anomaly"):
            evidence_items.append(f"AI: {if_result['reason']}")
        if temporal_result.get("is_temporal_anomaly"):
            evidence_items.append(f"Temporal: {temporal_result['reason']}")
        if multivariate_result.get("is_multivariate_inconsistent"):
            evidence_items.append(f"Multivariate: {multivariate_result['reason']}")

        return {
            "composite_score": float(round(composite_score, 2)),
            "severity": severity,
            "rule_score": float(round(qc_penalty, 2)),
            "statistical_score": float(round(stat_score, 2)),
            "isolation_forest_score": float(round(if_score, 2)),
            "temporal_score": float(round(temp_score, 2)),
            "multivariate_score": float(round(multi_score, 2)),
            "evidence_summary": " | ".join(evidence_items) if evidence_items else "All parameters within normal operational baseline."
        }
