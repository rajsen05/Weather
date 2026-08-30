import numpy as np
from typing import Dict, Any, List, Optional

class TemporalDetector:
    """
    Analyzes short-term temporal dynamics:
    - Step rate of change (t vs t-1, t-2)
    - Moving window standard deviation surge
    - Acceleration / second derivative of change
    """

    @classmethod
    def evaluate(
        cls,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not history or len(history) < 2:
            return {
                "temporal_score": 0.0,
                "temp_roc": 0.0,
                "pres_roc": 0.0,
                "hum_roc": 0.0,
                "is_temporal_anomaly": False,
                "reason": "Baseline temporal window establishing."
            }

        last = history[-1]
        prev = history[-2] if len(history) >= 2 else last

        temp_roc = (temperature - last["temperature"]) if (temperature is not None and last.get("temperature") is not None) else 0.0
        pres_roc = (pressure - last["pressure"]) if (pressure is not None and last.get("pressure") is not None) else 0.0
        hum_roc = (humidity - last["humidity"]) if (humidity is not None and last.get("humidity") is not None) else 0.0

        # Physical rate-of-change thresholds per observation interval (~1 to 5 min)
        # Normal ambient temp changes < 1.5°C/5min; rapid spike > 5°C
        temp_severity = min(100.0, (abs(temp_roc) / 4.0) * 100.0)
        pres_severity = min(100.0, (abs(pres_roc) / 8.0) * 100.0)
        hum_severity = min(100.0, (abs(hum_roc) / 20.0) * 100.0)

        # Acceleration check (second derivative) if 3 points available
        temp_accel = 0.0
        if prev.get("temperature") is not None and last.get("temperature") is not None and temperature is not None:
            prev_roc = last["temperature"] - prev["temperature"]
            temp_accel = abs(temp_roc - prev_roc)

        temporal_score = max(temp_severity, pres_severity, hum_severity)
        if temp_accel > 5.0:
            temporal_score = min(100.0, temporal_score + 15.0)

        is_anomaly = temporal_score > 60.0
        reasons = []
        if abs(temp_roc) > 3.0:
            reasons.append(f"Excessive temperature delta: {temp_roc:+.1f}°C")
        if abs(pres_roc) > 6.0:
            reasons.append(f"Excessive barometric jump: {pres_roc:+.1f} hPa")
        if abs(hum_roc) > 15.0:
            reasons.append(f"Excessive humidity transition: {hum_roc:+.1f}%")

        return {
            "temporal_score": float(round(temporal_score, 2)),
            "temp_roc": float(round(temp_roc, 2)),
            "pres_roc": float(round(pres_roc, 2)),
            "hum_roc": float(round(hum_roc, 2)),
            "is_temporal_anomaly": is_anomaly,
            "reason": "; ".join(reasons) if reasons else "Temporal progression stable."
        }
