import numpy as np
from typing import Dict, Any, List, Optional

class StatisticalDetector:
    """
    Robust statistical anomaly detection utilizing:
    - Modified Z-Score using Median Absolute Deviation (MAD)
    - Interquartile Range (IQR) fence violations
    - Rolling window statistical divergence
    """

    @staticmethod
    def modified_z_score(value: float, series: List[float]) -> float:
        if not series or len(series) < 3:
            return 0.0
        
        arr = np.array(series, dtype=float)
        median = np.median(arr)
        mad = np.median(np.abs(arr - median))
        
        if mad == 0:
            # Fallback to standard deviation if MAD is zero
            std = np.std(arr)
            if std == 0:
                return 0.0 if abs(value - median) < 1e-4 else 5.0
            return float(abs(value - median) / std)
        
        # 0.6745 is the consistency constant for normal distribution
        mod_z = 0.6745 * abs(value - median) / mad
        return float(mod_z)

    @staticmethod
    def iqr_score(value: float, series: List[float]) -> float:
        if not series or len(series) < 5:
            return 0.0
        
        arr = np.array(series, dtype=float)
        q75, q25 = np.percentile(arr, [75, 25])
        iqr = q75 - q25
        
        if iqr == 0:
            return 0.0
        
        lower_bound = q25 - (1.5 * iqr)
        upper_bound = q75 + (1.5 * iqr)
        
        if value < lower_bound:
            return float(abs(value - lower_bound) / iqr)
        elif value > upper_bound:
            return float(abs(value - upper_bound) / iqr)
        return 0.0

    @classmethod
    def evaluate(
        cls,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not history or len(history) < 3:
            return {
                "statistical_score": 0.0, # 0 = clean, 100 = severe statistical anomaly
                "temp_mod_z": 0.0,
                "pressure_mod_z": 0.0,
                "humidity_mod_z": 0.0,
                "is_statistical_outlier": False,
                "reason": "Insufficient historical observations for statistical modeling."
            }

        temp_series = [h["temperature"] for h in history if h.get("temperature") is not None]
        pres_series = [h["pressure"] for h in history if h.get("pressure") is not None]
        hum_series = [h["humidity"] for h in history if h.get("humidity") is not None]

        z_temp = cls.modified_z_score(temperature, temp_series) if temperature is not None else 0.0
        z_pres = cls.modified_z_score(pressure, pres_series) if pressure is not None else 0.0
        z_hum = cls.modified_z_score(humidity, hum_series) if humidity is not None else 0.0

        iqr_temp = cls.iqr_score(temperature, temp_series) if temperature is not None else 0.0
        iqr_pres = cls.iqr_score(pressure, pres_series) if pressure is not None else 0.0
        iqr_hum = cls.iqr_score(humidity, hum_series) if humidity is not None else 0.0

        max_z = max(z_temp, z_pres, z_hum)
        max_iqr = max(iqr_temp, iqr_pres, iqr_hum)

        # Scale to 0-100 anomaly intensity
        # Z-score > 3.5 is considered an extreme statistical outlier
        score = min(100.0, (max_z / 4.0) * 80.0 + (max_iqr / 3.0) * 20.0)
        
        is_outlier = max_z > 3.0 or max_iqr > 1.5
        reasons = []
        if z_temp > 3.0:
            reasons.append(f"Temperature modified Z-score={z_temp:.2f} (MAD outlier)")
        if z_pres > 3.0:
            reasons.append(f"Pressure modified Z-score={z_pres:.2f} (MAD outlier)")
        if z_hum > 3.0:
            reasons.append(f"Humidity modified Z-score={z_hum:.2f} (MAD outlier)")

        return {
            "statistical_score": float(round(score, 2)),
            "temp_mod_z": float(round(z_temp, 2)),
            "pressure_mod_z": float(round(z_pres, 2)),
            "humidity_mod_z": float(round(z_hum, 2)),
            "is_statistical_outlier": is_outlier,
            "reason": "; ".join(reasons) if reasons else "Statistical distributions within normal variance."
        }
