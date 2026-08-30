from typing import Dict, Any, List, Optional, Tuple

class DataQualityEngine:
    # WMO & IMD Climatological physical bounds
    BOUNDS = {
        "temperature": {"min": -50.0, "max": 60.0, "max_jump_per_step": 6.0}, # °C
        "pressure": {"min": 500.0, "max": 1090.0, "max_jump_per_step": 15.0}, # hPa
        "humidity": {"min": 0.0, "max": 100.0, "max_jump_per_step": 25.0},    # %
        "wind_speed": {"min": 0.0, "max": 250.0, "max_jump_per_step": 60.0},  # km/h
    }

    @classmethod
    def check_reading(
        cls,
        temperature: Optional[float],
        pressure: Optional[float],
        humidity: Optional[float],
        prev_readings: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Performs rule-based QC checks:
        1. Null / Missing checks
        2. Physical Range checks
        3. Step / Sudden Jump checks
        4. Flatline / Frozen sensor checks
        """
        flags: List[str] = []
        missing_check = True
        range_check = True
        jump_check = True
        flatline_check = True
        details_list: List[str] = []

        # 1. Missing / Null checks
        if temperature is None:
            missing_check = False
            flags.append("MISSING_TEMPERATURE")
            details_list.append("Temperature reading is null/missing.")
        if pressure is None:
            missing_check = False
            flags.append("MISSING_PRESSURE")
            details_list.append("Pressure reading is null/missing.")
        if humidity is None:
            missing_check = False
            flags.append("MISSING_HUMIDITY")
            details_list.append("Humidity reading is null/missing.")

        # 2. Physical Range checks
        if temperature is not None:
            b = cls.BOUNDS["temperature"]
            if temperature < b["min"] or temperature > b["max"]:
                range_check = False
                flags.append("RANGE_TEMPERATURE_VIOLATION")
                details_list.append(f"Temperature {temperature}°C exceeds physical limit ({b['min']} to {b['max']}°C).")
        
        if pressure is not None:
            b = cls.BOUNDS["pressure"]
            if pressure < b["min"] or pressure > b["max"]:
                range_check = False
                flags.append("RANGE_PRESSURE_VIOLATION")
                details_list.append(f"Pressure {pressure} hPa exceeds physical limit ({b['min']} to {b['max']} hPa).")

        if humidity is not None:
            b = cls.BOUNDS["humidity"]
            if humidity < b["min"] or humidity > b["max"]:
                range_check = False
                flags.append("RANGE_HUMIDITY_VIOLATION")
                details_list.append(f"Humidity {humidity}% exceeds physical limit ({b['min']} to {b['max']}%).")

        # 3. Sudden Jump checks & 4. Flatline checks with recent history
        if prev_readings and len(prev_readings) > 0:
            last_reading = prev_readings[-1]
            # Jump checks
            if temperature is not None and last_reading.get("temperature") is not None:
                delta_t = abs(temperature - last_reading["temperature"])
                if delta_t > cls.BOUNDS["temperature"]["max_jump_per_step"]:
                    jump_check = False
                    flags.append("SUDDEN_TEMPERATURE_JUMP")
                    details_list.append(f"Temperature jumped by {delta_t:.1f}°C in one step.")

            if pressure is not None and last_reading.get("pressure") is not None:
                delta_p = abs(pressure - last_reading["pressure"])
                if delta_p > cls.BOUNDS["pressure"]["max_jump_per_step"]:
                    jump_check = False
                    flags.append("SUDDEN_PRESSURE_JUMP")
                    details_list.append(f"Pressure jumped by {delta_p:.1f} hPa in one step.")

            if humidity is not None and last_reading.get("humidity") is not None:
                delta_h = abs(humidity - last_reading["humidity"])
                if delta_h > cls.BOUNDS["humidity"]["max_jump_per_step"]:
                    jump_check = False
                    flags.append("SUDDEN_HUMIDITY_JUMP")
                    details_list.append(f"Humidity jumped by {delta_h:.1f}% in one step.")

            # Flatline check (e.g. 5+ consecutive identical readings)
            if len(prev_readings) >= 4:
                recent_temps = [r.get("temperature") for r in prev_readings[-4:]] + ([temperature] if temperature is not None else [])
                if len(recent_temps) >= 5 and all(t == recent_temps[0] and t is not None for t in recent_temps):
                    flatline_check = False
                    flags.append("FROZEN_TEMPERATURE_SENSOR")
                    details_list.append("Temperature sensor flatlined: identical value across 5 consecutive cycles.")

                recent_humidities = [r.get("humidity") for r in prev_readings[-4:]] + ([humidity] if humidity is not None else [])
                if len(recent_humidities) >= 5 and all(h == recent_humidities[0] and h is not None for h in recent_humidities):
                    flatline_check = False
                    flags.append("FROZEN_HUMIDITY_SENSOR")
                    details_list.append("Humidity sensor flatlined: identical value across 5 consecutive cycles.")

        is_valid = missing_check and range_check and jump_check and flatline_check
        
        # Rule score out of 100 (100 = completely clean, 0 = severe rule failure)
        rule_score = 100.0
        if not missing_check:
            rule_score -= 50.0
        if not range_check:
            rule_score -= 40.0
        if not jump_check:
            rule_score -= 30.0
        if not flatline_check:
            rule_score -= 25.0
        rule_score = max(0.0, rule_score)

        return {
            "is_valid": is_valid,
            "rule_score": rule_score,
            "flags": flags,
            "missing_check": missing_check,
            "range_check": range_check,
            "jump_check": jump_check,
            "flatline_check": flatline_check,
            "details": "; ".join(details_list) if details_list else "All data quality checks passed."
        }
