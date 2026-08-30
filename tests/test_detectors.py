import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.detectors.statistical import StatisticalDetector
from app.ml.detectors.isolation_forest import isolation_forest_detector
from app.ml.detectors.temporal import TemporalDetector
from app.ml.detectors.multivariate import MultivariateConsistencyDetector
from app.ml.fusion import AnomalyFusionEngine

def test_statistical_detector_anomaly():
    history = [{"temperature": 30.0, "pressure": 1010.0, "humidity": 60.0} for _ in range(10)]
    result = StatisticalDetector.evaluate(
        temperature=65.0, # Extreme MAD outlier
        pressure=1010.0,
        humidity=60.0,
        history=history
    )
    assert result["is_statistical_outlier"] is True
    assert result["temp_mod_z"] > 3.0
    assert result["statistical_score"] > 60.0

def test_isolation_forest():
    res_normal = isolation_forest_detector.predict(temperature=28.0, pressure=1012.0, humidity=60.0)
    assert res_normal["if_score"] < 50.0

    res_anom = isolation_forest_detector.predict(temperature=75.0, pressure=1012.0, humidity=60.0, temp_roc=45.0)
    assert res_anom["if_score"] > 50.0

def test_multivariate_severe_weather_event():
    # Coherent front: Temp drops sharply, pressure surges, humidity spikes
    res = MultivariateConsistencyDetector.evaluate(
        temperature=22.0,
        pressure=1015.0,
        humidity=85.0,
        temp_roc=-4.5,
        pres_roc=3.0,
        hum_roc=20.0
    )
    assert res["is_probable_weather_event"] is True
    assert res["coherence_type"] == "COHERENT_FRONT"
