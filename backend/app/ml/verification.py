from typing import Dict, Any, List, Optional

class AdaptiveEvidenceVerificationEngine:
    """
    ⭐ Flagship USP 2: Adaptive Evidence Verification Engine
    Manages the anomaly lifecycle with multi-observation evidentiary accumulation:
    NORMAL -> SUSPICIOUS -> UNDER_VERIFICATION -> CONFIRMED_ANOMALY | CONFIRMED_GENUINE_WEATHER_EVENT
    """

    @classmethod
    def evaluate_lifecycle(
        cls,
        composite_score: float,
        current_status: str,
        verification_history: List[Dict[str, Any]],
        multivariate_coherence: bool = False
    ) -> Dict[str, Any]:
        """
        Determines the state transition and accumulated confidence.
        """
        evidence_list = []
        step_count = len(verification_history) + 1

        # Case 1: Brand new normal reading
        if composite_score < 40.0 and (current_status in ["NORMAL", "RESOLVED"] or not current_status):
            return {
                "status": "NORMAL",
                "confidence": 95.0,
                "is_under_verification": False,
                "note": "Observation consistent with baseline.",
                "evidence_step": None
            }

        # Case 2: New suspicious observation triggered
        if current_status in ["NORMAL", "RESOLVED"] or not current_status:
            if composite_score >= 40.0:
                return {
                    "status": "UNDER_VERIFICATION",
                    "confidence": 60.0,
                    "is_under_verification": True,
                    "note": f"Initial suspicious deviation detected (Score: {composite_score:.1f}). Awaiting subsequent verification cycles.",
                    "evidence_step": {
                        "step": 1,
                        "observation_divergence": composite_score,
                        "note": "Initial trigger under adaptive verification."
                    }
                }

        # Case 3: Ongoing verification window
        if current_status == "UNDER_VERIFICATION":
            # If we detect a coherent multi-parameter weather signature
            if multivariate_coherence:
                return {
                    "status": "CONFIRMED_GENUINE_WEATHER_EVENT",
                    "confidence": 88.0,
                    "is_under_verification": False,
                    "note": "Multi-parameter atmospheric coherence confirmed: Probable Genuine Weather Event.",
                    "evidence_step": {
                        "step": step_count,
                        "observation_divergence": composite_score,
                        "note": "Coherent multi-variable atmospheric front verified."
                    }
                }

            # If the spike reverted back to baseline immediately (classic single-step glitch)
            if composite_score < 30.0 and step_count >= 2:
                return {
                    "status": "CONFIRMED_ANOMALY",
                    "confidence": 96.0,
                    "is_under_verification": False,
                    "note": "Transient single-cycle spike confirmed as sensor glitch (reverted immediately).",
                    "evidence_step": {
                        "step": step_count,
                        "observation_divergence": composite_score,
                        "note": "Transient spike returned to baseline (confirmed sensor anomaly)."
                    }
                }

            # If anomaly persists with high score over 3+ steps
            if step_count >= 3:
                if composite_score >= 50.0:
                    return {
                        "status": "CONFIRMED_ANOMALY",
                        "confidence": 92.0,
                        "is_under_verification": False,
                        "note": "Sustained uncoupled parameter anomaly confirmed across 3 consecutive cycles.",
                        "evidence_step": {
                            "step": step_count,
                            "observation_divergence": composite_score,
                            "note": "Sustained sensor fault verified."
                        }
                    }
                else:
                    return {
                        "status": "RESOLVED",
                        "confidence": 90.0,
                        "is_under_verification": False,
                        "note": "Values normalized across verification window.",
                        "evidence_step": {
                            "step": step_count,
                            "observation_divergence": composite_score,
                            "note": "Observation normalized."
                        }
                    }

            # Continue gathering evidence
            return {
                "status": "UNDER_VERIFICATION",
                "confidence": min(85.0, 50.0 + (step_count * 15.0)),
                "is_under_verification": True,
                "note": f"Accumulating evidentiary telemetry (Cycle {step_count}/3).",
                "evidence_step": {
                    "step": step_count,
                    "observation_divergence": composite_score,
                    "note": f"Evidence accumulation cycle {step_count}."
                }
            }

        # Case 4: Already confirmed, evaluate if returned to normal
        if "CONFIRMED" in current_status:
            if composite_score < 30.0:
                return {
                    "status": "RESOLVED",
                    "confidence": 95.0,
                    "is_under_verification": False,
                    "note": "Sensor telemetry restored to nominal baseline.",
                    "evidence_step": {
                        "step": step_count,
                        "observation_divergence": composite_score,
                        "note": "Anomaly resolved."
                    }
                }
            return {
                "status": current_status,
                "confidence": 95.0,
                "is_under_verification": False,
                "note": "Active anomaly continuing.",
                "evidence_step": None
            }

        return {
            "status": "NORMAL",
            "confidence": 90.0,
            "is_under_verification": False,
            "note": "Operating nominal.",
            "evidence_step": None
        }
