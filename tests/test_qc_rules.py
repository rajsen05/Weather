import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.qc.rules import DataQualityEngine

def test_valid_reading():
    result = DataQualityEngine.check_reading(
        temperature=28.5,
        pressure=1012.0,
        humidity=65.0,
        prev_readings=[{"temperature": 28.2, "pressure": 1012.2, "humidity": 66.0}]
    )
    assert result["is_valid"] is True
    assert result["rule_score"] == 100.0
    assert len(result["flags"]) == 0

def test_out_of_range_temperature():
    result = DataQualityEngine.check_reading(
        temperature=85.0, # Exceeds 60°C WMO limit
        pressure=1012.0,
        humidity=65.0
    )
    assert result["is_valid"] is False
    assert "RANGE_TEMPERATURE_VIOLATION" in result["flags"]
    assert result["range_check"] is False

def test_sudden_jump():
    result = DataQualityEngine.check_reading(
        temperature=45.0,
        pressure=1012.0,
        humidity=65.0,
        prev_readings=[{"temperature": 25.0, "pressure": 1012.0, "humidity": 65.0}] # Delta 20°C in one step
    )
    assert result["is_valid"] is False
    assert "SUDDEN_TEMPERATURE_JUMP" in result["flags"]
    assert result["jump_check"] is False

def test_frozen_sensor_flatline():
    history = [{"temperature": 31.2, "pressure": 1010.0, "humidity": 50.0}] * 4
    result = DataQualityEngine.check_reading(
        temperature=31.2,
        pressure=1010.0,
        humidity=50.0,
        prev_readings=history
    )
    assert result["is_valid"] is False
    assert "FROZEN_TEMPERATURE_SENSOR" in result["flags"]
    assert result["flatline_check"] is False
