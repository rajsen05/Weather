from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class SensorHealthEngine:
    """
    Monitors transducer degradation, health scoring (0-100), and predictive maintenance risk.
    """

    @classmethod
    def update_health(
        cls,
        current_health: float,
        sensor_type: str,
        anomaly_detected: bool,
        is_flatline: bool,
        is_missing: bool,
        anomaly_severity: str = "NORMAL"
    ) -> Dict[str, Any]:
        """
        Updates sensor health dynamically based on telemetry events.
        """
        new_health = current_health

        # Penalties
        if is_missing:
            new_health -= 6.0
        elif is_flatline:
            new_health -= 8.0
        elif anomaly_detected:
            if anomaly_severity == "CRITICAL":
                new_health -= 12.0
            elif anomaly_severity == "HIGH":
                new_health -= 8.0
            elif anomaly_severity == "SUSPICIOUS":
                new_health -= 4.0
            elif anomaly_severity == "WATCH":
                new_health -= 1.5
        else:
            # Gradual passive recovery when observations are consistently clean (sensor healing recovery)
            new_health = min(100.0, new_health + 0.5)

        new_health = float(round(max(0.0, min(100.0, new_health)), 1))

        # Degradation rate calculation
        degradation_rate = round(max(0.0, (100.0 - new_health) / 7.0), 2) # estimated points/week

        # Failure Risk classification
        if new_health >= 85.0:
            risk = "LOW"
            recommendation = f"{sensor_type.capitalize()} sensor operating nominally within manufacturer calibration envelope."
        elif new_health >= 70.0:
            risk = "MEDIUM"
            recommendation = f"Minor degradation observed in {sensor_type.capitalize()} telemetry. Schedule routine sensor cleaning."
        elif new_health >= 45.0:
            risk = "HIGH"
            recommendation = f"High error frequency on {sensor_type.capitalize()} channel. Priority on-site inspection/recalibration recommended."
        else:
            risk = "CRITICAL"
            recommendation = f"CRITICAL: {sensor_type.capitalize()} sensor failure risk imminent. Immediate sensor replacement required."

        return {
            "health_score": new_health,
            "degradation_rate": degradation_rate,
            "failure_risk": risk,
            "recommendation": recommendation
        }
