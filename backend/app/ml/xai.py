from typing import Dict, Any, List, Optional

class ExplainableAIEngine:
    """
    Explainable AI (XAI) & Progressive Disclosure Engine
    Translates complex ensemble ML outputs into clear, human-understandable narratives:
    - Tier 1: General User / Disaster Officer (Simple, clear, non-technical)
    - Tier 2: AWS Operator (Actionable diagnostic findings)
    - Tier 3: Meteorological Researcher (Full SHAP feature attribution & statistical telemetry)
    """

    @classmethod
    def explain(
        cls,
        qc_result: Dict[str, Any],
        temporal_result: Dict[str, Any],
        multivariate_result: Dict[str, Any],
        statistical_result: Dict[str, Any],
        if_result: Dict[str, Any],
        trust_result: Dict[str, Any],
        root_cause_result: Dict[str, Any],
        fingerprint_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # Calculate SHAP-style feature attribution contributions
        # Components: Temperature Delta, Statistical Z, Multivariate Decoupling, AI Ensemble, Sensor Health
        raw_temp_contrib = abs(temporal_result.get("temp_roc", 0.0)) * 15.0
        raw_pres_contrib = abs(temporal_result.get("pres_roc", 0.0)) * 8.0
        raw_hum_contrib = abs(temporal_result.get("hum_roc", 0.0)) * 4.0
        raw_stat_contrib = statistical_result.get("statistical_score", 0.0) * 0.8
        raw_ai_contrib = if_result.get("if_score", 0.0) * 0.7
        raw_multi_contrib = multivariate_result.get("multivariate_score", 0.0) * 0.9

        total_attribution = max(1.0, (
            raw_temp_contrib + raw_pres_contrib + raw_hum_contrib + 
            raw_stat_contrib + raw_ai_contrib + raw_multi_contrib
        ))

        feature_importance = [
            {
                "feature": "Temperature Dynamic Shift",
                "importance_percent": round((raw_temp_contrib / total_attribution) * 100, 1),
                "impact": "POSITIVE" if raw_temp_contrib > 10 else "NEUTRAL"
            },
            {
                "feature": "Historical Climatological Deviation",
                "importance_percent": round((raw_stat_contrib / total_attribution) * 100, 1),
                "impact": "POSITIVE" if raw_stat_contrib > 15 else "NEUTRAL"
            },
            {
                "feature": "Multivariate Thermodynamic Coupling",
                "importance_percent": round((raw_multi_contrib / total_attribution) * 100, 1),
                "impact": "POSITIVE" if raw_multi_contrib > 15 else "NEUTRAL"
            },
            {
                "feature": "AI Isolation Forest Outlier Density",
                "importance_percent": round((raw_ai_contrib / total_attribution) * 100, 1),
                "impact": "POSITIVE" if raw_ai_contrib > 15 else "NEUTRAL"
            },
            {
                "feature": "Barometric / Hygrometric Dynamics",
                "importance_percent": round(((raw_pres_contrib + raw_hum_contrib) / total_attribution) * 100, 1),
                "impact": "POSITIVE" if (raw_pres_contrib + raw_hum_contrib) > 10 else "NEUTRAL"
            }
        ]

        # Sort descending by importance
        feature_importance.sort(key=lambda x: x["importance_percent"], reverse=True)

        cause = root_cause_result.get("root_cause", "Nominal")
        confidence = root_cause_result.get("confidence", 95.0)

        # Tier 1: Simple General Public Explanation
        if "Nominal" in cause:
            simple_text = "✓ Weather readings are normal and fully consistent with current regional patterns."
        elif "Probable Genuine Weather" in cause:
            simple_text = f"🌧️ A sudden atmospheric change (such as a rain squall or cold front) is underway. Temperature, humidity, and pressure all shifted together naturally ({confidence}% confidence)."
        elif "Spike" in cause:
            simple_text = f"⚠️ This reading is suspicious because the sensor recorded a sudden jump, while other weather conditions remained steady ({confidence}% confidence of sensor spike)."
        elif "Frozen" in cause:
            simple_text = f"⚠️ The sensor appears stuck, outputting the exact same value repeatedly without natural weather fluctuations."
        elif "Missing" in cause:
            simple_text = "⚠️ Telemetry data was missing from this broadcast frame."
        else:
            simple_text = f"⚠️ AI pattern analysis flagged this reading as unusual compared with historical and regional baselines."

        # Tier 2: AWS Operator Technical Summary
        operator_items = [
            f"Diagnosed Cause: {cause} (Confidence: {confidence}%)",
            f"Evidence: {root_cause_result.get('evidence', '')}"
        ]
        if fingerprint_result and fingerprint_result.get("matched"):
            operator_items.append(f"Fingerprint Match: {fingerprint_result['fault_type']} ({fingerprint_result['similarity_score']}% similarity)")
        operator_text = " | ".join(operator_items)

        # Tier 3: Researcher Full Telemetry
        researcher_dict = {
            "qc_flags": qc_result.get("flags", []),
            "modified_z_scores": {
                "temperature": statistical_result.get("temp_mod_z", 0.0),
                "pressure": statistical_result.get("pressure_mod_z", 0.0),
                "humidity": statistical_result.get("humidity_mod_z", 0.0)
            },
            "rate_of_change": {
                "temperature_roc": temporal_result.get("temp_roc", 0.0),
                "pressure_roc": temporal_result.get("pres_roc", 0.0),
                "humidity_roc": temporal_result.get("hum_roc", 0.0)
            },
            "isolation_forest_decision_score": if_result.get("raw_decision_score", 0.0),
            "multivariate_coherence": multivariate_result.get("coherence_type", "PHYSICALLY_BALANCED"),
            "trust_breakdown": trust_result.get("details", {})
        }

        return {
            "simple_explanation": simple_text,
            "operator_summary": operator_text,
            "researcher_telemetry": researcher_dict,
            "feature_attribution": feature_importance
        }
