from typing import Dict, Any, List, Optional

class RootCauseClassifier:
    """
    Classifies root cause of detected anomaly with diagnostic confidence and evidence rationale.
    """

    @classmethod
    def classify(
        cls,
        qc_result: Dict[str, Any],
        temporal_result: Dict[str, Any],
        multivariate_result: Dict[str, Any],
        statistical_result: Dict[str, Any],
        composite_score: float
    ) -> Dict[str, Any]:
        if composite_score < 30.0:
            return {
                "root_cause": "Nominal Operation",
                "confidence": 98.0,
                "evidence": "All atmospheric parameters and data quality checks within standard bounds."
            }

        qc_flags = qc_result.get("flags", [])
        temp_roc = temporal_result.get("temp_roc", 0.0)
        pres_roc = temporal_result.get("pres_roc", 0.0)
        hum_roc = temporal_result.get("hum_roc", 0.0)

        # 1. Genuine Atmospheric Front / Squall
        if multivariate_result.get("is_probable_weather_event"):
            return {
                "root_cause": "Probable Genuine Weather Event",
                "confidence": 88.0,
                "evidence": "Coupled thermodynamic shift observed across temperature, barometric pressure, and relative humidity."
            }

        # 2. Frozen / Flatlined Sensor
        if "FROZEN_TEMPERATURE_SENSOR" in qc_flags:
            return {
                "root_cause": "Frozen Temperature Sensor",
                "confidence": 96.0,
                "evidence": "Temperature sensor outputting identical zero-variance signal across multiple consecutive cycles."
            }
        if "FROZEN_HUMIDITY_SENSOR" in qc_flags:
            return {
                "root_cause": "Frozen Humidity Sensor",
                "confidence": 96.0,
                "evidence": "Hygrometer outputting identical zero-variance signal across multiple consecutive cycles."
            }

        # 3. Missing Data / Communication Packet Drop
        if "MISSING_TEMPERATURE" in qc_flags or "MISSING_PRESSURE" in qc_flags or "MISSING_HUMIDITY" in qc_flags:
            return {
                "root_cause": "Missing Data / Packet Drop",
                "confidence": 99.0,
                "evidence": "Telemetry frame received with null/missing sensor field payload."
            }

        # 4. Out of Physical Range / Data Corruption
        if any("RANGE_" in f for f in qc_flags):
            return {
                "root_cause": "Data Corruption / ADC Overflow",
                "confidence": 97.0,
                "evidence": "Sensor signal generated non-physical climatological reading violating WMO limit."
            }

        # 5. Single-Sensor Spikes
        if abs(temp_roc) > 4.0 and abs(pres_roc) < 1.0 and abs(hum_roc) < 5.0:
            return {
                "root_cause": "Temperature Sensor Spike",
                "confidence": 95.0,
                "evidence": f"Abrupt step delta ({temp_roc:+.1f}°C) isolated strictly to thermal transducer."
            }
        if abs(pres_roc) > 8.0 and abs(temp_roc) < 1.0 and abs(hum_roc) < 5.0:
            return {
                "root_cause": "Pressure Sensor Spike",
                "confidence": 94.0,
                "evidence": f"Abrupt barometric delta ({pres_roc:+.1f} hPa) isolated strictly to barometer."
            }
        if abs(hum_roc) > 20.0 and abs(temp_roc) < 1.0 and abs(pres_roc) < 1.0:
            return {
                "root_cause": "Humidity Sensor Spike",
                "confidence": 94.0,
                "evidence": f"Abrupt moisture delta ({hum_roc:+.1f}%) isolated strictly to hygrometer."
            }

        # 6. Multivariate Inconsistency
        if multivariate_result.get("is_multivariate_inconsistent"):
            return {
                "root_cause": "Multivariate Thermodynamic Inconsistency",
                "confidence": 85.0,
                "evidence": multivariate_result.get("reason", "Parameters exhibit physically decoupled behavior.")
            }

        # 7. Statistical Sensor Drift
        if statistical_result.get("is_statistical_outlier"):
            return {
                "root_cause": "Sensor Calibration Drift",
                "confidence": 80.0,
                "evidence": "Gradual systematic divergence from regional and historical diurnal expectation."
            }

        return {
            "root_cause": "Unclassified Telemetry Anomaly",
            "confidence": 65.0,
            "evidence": "Combined anomaly score indicates non-nominal state."
        }
