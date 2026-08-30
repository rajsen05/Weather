import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List, Optional
from app.core.config import settings

class IsolationForestDetector:
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42,
            bootstrap=False
        )
        self.is_fitted = False
        self._seed_default_model()

    def _seed_default_model(self):
        """Seed initial model with typical atmospheric multivariate correlations."""
        # Generate realistic baseline: Temp (15 to 45), Pressure (990 to 1020), Humidity (20 to 95)
        np.random.seed(42)
        n_samples = 200
        temps = np.random.uniform(15.0, 42.0, n_samples)
        # Pressure tends to be slightly lower when hot, but centered ~1010
        pressures = 1013.25 - 0.15 * (temps - 25.0) + np.random.normal(0, 4, n_samples)
        # Humidity tends to be lower when hot during dry daytime
        humidities = np.clip(100 - (temps * 1.5) + np.random.normal(0, 10, n_samples), 15, 98)
        # Rates of change around 0
        temp_roc = np.random.normal(0, 0.5, n_samples)
        pres_roc = np.random.normal(0, 0.3, n_samples)
        hum_roc = np.random.normal(0, 1.2, n_samples)

        X_seed = np.column_stack([temps, pressures, humidities, temp_roc, pres_roc, hum_roc])
        self.model.fit(X_seed)
        self.is_fitted = True

    def fit(self, X: np.ndarray):
        if len(X) >= 20:
            self.model.fit(X)
            self.is_fitted = True

    def predict(
        self,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        temp_roc: float = 0.0,
        pres_roc: float = 0.0,
        hum_roc: float = 0.0
    ) -> Dict[str, Any]:
        if temperature is None or pressure is None or humidity is None:
            return {
                "if_score": 100.0,
                "raw_decision_score": -1.0,
                "is_if_anomaly": True,
                "reason": "Missing multi-parameter data for Isolation Forest."
            }

        features = np.array([[temperature, pressure, humidity, temp_roc, pres_roc, hum_roc]])
        
        # decision_function gives negative values for anomalies, positive for normal
        decision_score = float(self.model.decision_function(features)[0])
        prediction = int(self.model.predict(features)[0]) # -1 = anomaly, 1 = normal

        # Convert decision function to 0-100 anomaly score:
        # Typical decision range: +0.2 (very normal) to -0.3 (extreme anomaly)
        # Mapping: score <= -0.15 -> ~90-100; score >= 0.15 -> 0-10
        normalized_score = np.clip((0.15 - decision_score) / 0.30 * 100.0, 0.0, 100.0)

        is_anomaly = prediction == -1 or decision_score < 0.0

        return {
            "if_score": float(round(normalized_score, 2)),
            "raw_decision_score": float(round(decision_score, 4)),
            "is_if_anomaly": is_anomaly,
            "reason": f"Isolation Forest decision function: {decision_score:.3f} (multivariate outlier)" if is_anomaly else "Isolation Forest confirmed inlier."
        }

isolation_forest_detector = IsolationForestDetector(contamination=settings.ISOLATION_FOREST_CONTAMINATION)
