import numpy as np
from typing import Dict, Any, List, Optional, Tuple

class FaultFingerprintEngine:
    """
    ⭐ Flagship USP 4: Fault Fingerprint Memory Engine
    Extracts high-dimensional feature signatures of confirmed faults,
    persists them in the fingerprint library, and matches active anomalies using Cosine Similarity.
    """

    # Baseline seed library of known AWS failure patterns
    SEED_FINGERPRINTS = [
        {
            "code": "FP-TEMP-SPIKE-01",
            "type": "Temperature Sensor Spike",
            "description": "Transient electrical impulse or ADC surge on PT100/RTD temperature probe.",
            "sensor": "TEMPERATURE",
            "duration": 1,
            "magnitude": 25.0,
            # [temp_roc_norm, pres_roc_norm, hum_roc_norm, temp_z_norm, pres_z_norm, hum_z_norm, isolated_idx, bounds_idx]
            "vector": [1.0, 0.0, 0.05, 0.95, 0.05, 0.05, 1.0, 0.0]
        },
        {
            "code": "FP-TEMP-DRIFT-02",
            "type": "Temperature Calibration Drift",
            "description": "Gradual uncalibrated thermal offset due to solar radiation shield degradation.",
            "sensor": "TEMPERATURE",
            "duration": 10,
            "magnitude": 6.5,
            "vector": [0.25, 0.02, 0.1, 0.8, 0.1, 0.2, 0.8, 0.0]
        },
        {
            "code": "FP-FROZEN-03",
            "type": "Frozen Sensor / Firmware Lockup",
            "description": "I2C/RS485 bus lockup causing stuck repeated float value across polling cycles.",
            "sensor": "MULTI",
            "duration": 8,
            "magnitude": 0.0,
            "vector": [0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.0, 0.0]
        },
        {
            "code": "FP-PRESSURE-SURGE-04",
            "type": "Barometric Transducer Jolt",
            "description": "Capacitive barometric diaphragm glitch or enclosure pressure surge.",
            "sensor": "PRESSURE",
            "duration": 1,
            "magnitude": 30.0,
            "vector": [0.02, 1.0, 0.02, 0.05, 0.98, 0.05, 1.0, 0.0]
        },
        {
            "code": "FP-HUMIDITY-SAT-05",
            "type": "Hygrometer Condensation Saturation",
            "description": "Capacitive polymer hygrometer waterlogging causing pinned 100% reading after fog/rain.",
            "sensor": "HUMIDITY",
            "duration": 15,
            "magnitude": 40.0,
            "vector": [0.05, 0.02, 0.9, 0.1, 0.05, 0.95, 0.9, 0.1]
        },
        {
            "code": "FP-COMM-GAP-06",
            "type": "GPRS/Satellite Transmission Packet Drop",
            "description": "Null/corrupt frame received due to intermittent telemetry transmission dropout.",
            "sensor": "ALL",
            "duration": 3,
            "magnitude": 0.0,
            "vector": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
        }
    ]

    @classmethod
    def extract_vector(
        cls,
        temp_roc: float,
        pres_roc: float,
        hum_roc: float,
        temp_z: float,
        pres_z: float,
        hum_z: float,
        is_isolated: bool,
        is_bounds_violation: bool
    ) -> List[float]:
        """Normalize into unit-scaled 8-dimensional vector."""
        vec = [
            float(np.clip(abs(temp_roc) / 10.0, 0.0, 1.0)),
            float(np.clip(abs(pres_roc) / 15.0, 0.0, 1.0)),
            float(np.clip(abs(hum_roc) / 30.0, 0.0, 1.0)),
            float(np.clip(temp_z / 5.0, 0.0, 1.0)),
            float(np.clip(pres_z / 5.0, 0.0, 1.0)),
            float(np.clip(hum_z / 5.0, 0.0, 1.0)),
            1.0 if is_isolated else 0.2,
            1.0 if is_bounds_violation else 0.0
        ]
        return vec

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        a = np.array(v1, dtype=float)
        b = np.array(v2, dtype=float)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        dot = np.dot(a, b)
        return float(np.clip(dot / (norm_a * norm_b), 0.0, 1.0))

    @classmethod
    def find_nearest_fingerprint(
        cls,
        vector: List[float],
        custom_library: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        all_fps = list(cls.SEED_FINGERPRINTS)
        if custom_library:
            all_fps.extend(custom_library)

        best_match = None
        highest_sim = 0.0

        for fp in all_fps:
            fp_vec = fp.get("vector") or fp.get("feature_signature", {}).get("vector")
            if not fp_vec:
                continue
            sim = cls.cosine_similarity(vector, fp_vec)
            if sim > highest_sim:
                highest_sim = sim
                best_match = fp

        sim_percentage = round(highest_sim * 100.0, 1)
        
        if best_match and highest_sim >= 0.70:
            return {
                "matched": True,
                "fingerprint_code": best_match.get("code") or best_match.get("fingerprint_code"),
                "fault_type": best_match["type"] if "type" in best_match else best_match.get("fault_type"),
                "similarity_score": sim_percentage,
                "description": best_match.get("description", "Historical sensor fault pattern matched."),
                "recommendation": f"Historical fault match ({sim_percentage}% similarity). Inspect {best_match.get('sensor', 'sensor')} transducer."
            }

        return {
            "matched": False,
            "fingerprint_code": "FP-NEW-UNCLASSIFIED",
            "fault_type": "Novel / Uncatalogued Pattern",
            "similarity_score": sim_percentage,
            "description": "Anomaly signature does not closely match prior library fingerprints.",
            "recommendation": "Perform manual diagnostic audit and register signature in fingerprint ledger if verified."
        }
