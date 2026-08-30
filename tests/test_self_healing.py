import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.healing import ConsensusSelfHealingEngine

def test_consensus_agreement_safe():
    history = [
        {"temperature": 30.0, "pressure": 1010.0, "humidity": 60.0, "is_valid": True},
        {"temperature": 30.2, "pressure": 1010.0, "humidity": 60.0, "is_valid": True},
        {"temperature": 30.4, "pressure": 1009.8, "humidity": 59.5, "is_valid": True}
    ]
    # Original spike = 75°C
    result = ConsensusSelfHealingEngine.estimate_parameter(
        parameter="temperature",
        original_value=75.0,
        history=history,
        current_context={"temperature": 75.0, "pressure": 1009.8, "humidity": 59.5},
        hour_of_day=14
    )
    assert result["original_value"] == 75.0
    assert result["status"] == "SAFE_ESTIMATE"
    assert result["agreement_percent"] >= 80.0
    assert result["corrected_value"] is not None
    assert 28.0 <= result["corrected_value"] <= 35.0
