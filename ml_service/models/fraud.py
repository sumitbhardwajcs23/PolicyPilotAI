"""
Parametric Trigger + Fraud Detection Ensemble v2.

Detects fraudulent claims in zero-touch parametric insurance for gig workers.
Ensemble: Random Forest (60%) + Neural Network (40%), 28 features.

Key signals verified against:
  - Weather APIs   (rainfall mm, temperature, AQI)
  - GPS logs       (worker location in affected zone)
  - Platform APIs  (Zomato/Swiggy order-volume drop in zone)
  - Worker profile (KYC, tenure, prior claims, biometric)
"""
from __future__ import annotations
from pathlib import Path
from typing import Any

import numpy as np
import joblib
# Heavy imports moved inside _load() for lazy loading to save RAM on Render
# import tensorflow as tf (Moved)

BASE_DIR      = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

_rf_model = None
_nn_model = None
_scaler   = None
_features: list[str] | None = None

_RF_WEIGHT = 0.60
_NN_WEIGHT = 0.40
DEFAULT_THRESHOLD = 0.50


def _load():
    global _rf_model, _nn_model, _scaler, _features
    if _rf_model is None:
        import tensorflow as tf
        # Prevent TF from attempting to find GPUs (saves minor memory/startup time)
        tf.config.set_visible_devices([], 'GPU')
        
        _rf_model = joblib.load(ARTIFACTS_DIR / "fraud_rf_model.joblib")
        _nn_model = tf.keras.models.load_model(str(ARTIFACTS_DIR / "fraud_nn_model.keras"))
        _scaler   = joblib.load(ARTIFACTS_DIR / "fraud_scaler.joblib")
        _features = joblib.load(ARTIFACTS_DIR / "fraud_features.joblib")


def get_feature_names() -> list[str]:
    _load()
    return list(_features)  # type: ignore[arg-type]


def _risk_label(score: float) -> str:
    if score < 0.20: return "LOW"
    if score < 0.45: return "MEDIUM"
    if score < 0.70: return "HIGH"
    return "CRITICAL"


def _payout_decision(prob: float, threshold: float, api_verified: bool) -> dict[str, Any]:
    """
    Determine zero-touch payout decision.
    Claims below fraud threshold AND API-verified → auto-approve for instant UPI payout.
    """
    is_fraud = prob >= threshold
    if not is_fraud and api_verified:
        action = "AUTO_APPROVE"
        payout_eta = "< 2 minutes via UPI"
    elif not is_fraud and not api_verified:
        action = "MANUAL_REVIEW"
        payout_eta = "2–4 hours"
    elif is_fraud:
        action = "REJECTED"
        payout_eta = None
    else:
        action = "MANUAL_REVIEW"
        payout_eta = "2–4 hours"
    return {"action": action, "payout_eta": payout_eta}


def predict(data: dict[str, Any], threshold: float = DEFAULT_THRESHOLD) -> dict[str, Any]:
    """
    Run parametric claim fraud detection.

    Args:
        data       : 28-feature dict
        threshold  : classification threshold (default 0.5)

    Returns:
        is_fraud, fraud_probability, risk_level, payout_decision, top_risk_factors
    """
    _load()

    fv     = np.array([[data.get(f, 0) for f in _features]], dtype=np.float32)  # type: ignore
    scaled = _scaler.transform(fv).astype(np.float32)  # type: ignore

    rf_prob  = float(_rf_model.predict_proba(scaled)[0, 1])        # type: ignore
    nn_prob  = float(_nn_model.predict(scaled, verbose=0).flatten()[0])  # type: ignore
    ens_prob = _RF_WEIGHT * rf_prob + _NN_WEIGHT * nn_prob

    # Explainability — top RF feature importances
    imp      = _rf_model.feature_importances_        # type: ignore
    top_idx  = np.argsort(imp)[::-1][:5]
    top_feat = [_features[i] for i in top_idx]       # type: ignore[index]

    api_verified = bool(data.get("weather_api_threshold_crossed", 0))
    payout = _payout_decision(ens_prob, threshold, api_verified)

    return {
        "is_fraud"            : bool(ens_prob >= threshold),
        "fraud_probability"   : round(ens_prob, 4),
        "risk_level"          : _risk_label(ens_prob),
        "rf_probability"      : round(rf_prob, 4),
        "nn_probability"      : round(nn_prob, 4),
        "payout_decision"     : payout["action"],
        "payout_eta"          : payout["payout_eta"],
        "top_risk_features"   : top_feat,
        "threshold_used"      : threshold,
        "model"               : "Ensemble RF(60%) + NN(40%) v2",
        "feature_count"       : len(_features),  # type: ignore[arg-type]
        "api_verified"        : api_verified,
    }
