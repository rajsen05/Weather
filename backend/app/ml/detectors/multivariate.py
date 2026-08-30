import math
from typing import Dict, Any, List, Optional

class MultivariateConsistencyDetector:
    """
    Evaluates physical atmospheric multivariate coupling:
    - Thermodynamic inverse coupling (Temperature vs Relative Humidity)
    - Frontal coherence index (Coupled multi-variable response vs isolated single-sensor spike)
    - Dew point sanity (Dew point cannot exceed ambient temperature)
    """

    @staticmethod
    def calculate_approx_dew_point(temp: float, rh: float) -> float:
        """Magnus-Tetens approximation for dew point temperature."""
        a = 17.27
        b = 237.7
        alpha = ((a * temp) / (b + temp)) + math.log(max(1.0, rh) / 100.0)
        return (b * alpha) / (a - alpha)

    @classmethod
    def evaluate(
        cls,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        temp_roc: float = 0.0,
        pres_roc: float = 0.0,
        hum_roc: float = 0.0
    ) -> Dict[str, Any]:
        if temperature is None or pressure is None or humidity is None:
            return {
                "multivariate_score": 50.0,
                "is_multivariate_inconsistent": True,
                "is_probable_weather_event": False,
                "coherence_type": "INCOMPLETE_PARAMETERS",
                "reason": "Missing one or more meteorological variables for multivariate coupling."
            }

        inconsistencies = []
        multivariate_score = 0.0

        # 1. Dew point physical sanity check
        try:
            approx_dp = cls.calculate_approx_dew_point(temperature, humidity)
            if approx_dp > temperature + 0.5: # 0.5°C margin
                multivariate_score += 40.0
                inconsistencies.append("Calculated dew point exceeds ambient temperature (thermodynamic impossibility).")
        except Exception:
            pass

        # 2. Isolated Extreme Disconnect Check
        # Example: Temp jumps by +25°C, but Pressure changed 0.0 hPa and Humidity changed 0.0%
        abs_t = abs(temp_roc)
        abs_p = abs(pres_roc)
        abs_h = abs(hum_roc)

        is_isolated_temp_spike = abs_t > 4.0 and abs_p < 0.5 and abs_h < 3.0
        is_isolated_pres_spike = abs_p > 8.0 and abs_t < 0.5 and abs_h < 3.0
        is_isolated_hum_spike = abs_h > 20.0 and abs_t < 0.5 and abs_p < 0.5

        if is_isolated_temp_spike:
            multivariate_score += 65.0
            inconsistencies.append("Severe isolated temperature surge with zero barometric/hygrometric coupling.")
        elif is_isolated_pres_spike:
            multivariate_score += 65.0
            inconsistencies.append("Severe isolated pressure jump with zero thermal/moisture coupling.")
        elif is_isolated_hum_spike:
            multivariate_score += 65.0
            inconsistencies.append("Severe isolated humidity jump with zero thermal/pressure coupling.")

        # 3. Genuine Atmospheric Front / Squall Coherence Detection
        # When a true thunderstorm / cold front arrives: Temp drops sharply, Pressure spikes (gust front), Humidity surges
        is_coherent_frontal_passage = (
            temp_roc <= -2.5 and pres_roc >= 1.5 and hum_roc >= 8.0
        ) or (
            temp_roc <= -3.0 and hum_roc >= 12.0
        )

        is_probable_weather_event = is_coherent_frontal_passage

        multivariate_score = min(100.0, multivariate_score)
        is_inconsistent = multivariate_score > 40.0

        return {
            "multivariate_score": float(round(multivariate_score, 2)),
            "is_multivariate_inconsistent": is_inconsistent,
            "is_probable_weather_event": is_probable_weather_event,
            "coherence_type": "COHERENT_FRONT" if is_coherent_frontal_passage else ("ISOLATED_DISCONNECT" if is_inconsistent else "PHYSICALLY_BALANCED"),
            "reason": "; ".join(inconsistencies) if inconsistencies else ("Coherent multi-variable atmospheric event detected." if is_probable_weather_event else "Multivariate thermodynamics consistent.")
        }
