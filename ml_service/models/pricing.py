"""
Gig Worker Weekly Micro-Premium Prediction Pipeline v2.

XGBoost model — outputs weekly premium in ₹29–₹99 range.
22 features focused on Indian food-delivery gig worker risk profile.
"""
from __future__ import annotations
from pathlib import Path
from typing import Any

import numpy as np
import joblib

BASE_DIR     = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

_model   = None
_scaler  = None
_features: list[str] | None = None


def _load():
    global _model, _scaler, _features
    if _model is None:
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Loading pricing model artifacts...")
        _model    = joblib.load(ARTIFACTS_DIR / "pricing_model.joblib")
        _scaler   = joblib.load(ARTIFACTS_DIR / "pricing_scaler.joblib")
        _features = joblib.load(ARTIFACTS_DIR / "pricing_features.joblib")
        logger.info(f"Pricing model loaded successfully! Features: {len(_features)}")


def get_feature_names() -> list[str]:
    _load()
    return list(_features)  # type: ignore[arg-type]


def predict(data: dict[str, Any]) -> dict[str, Any]:
    """
    Predict weekly micro-premium for a gig worker.

    Returns:
        weekly_premium   : ₹ per week
        monthly_estimate : weekly × 4.33
        annual_estimate  : weekly × 52
        tier_label       : Basic / Standard / Premium
        confidence_band  : ±6%
    """
    _load()

    fv     = np.array([[data.get(f, 0) for f in _features]], dtype=np.float32)  # type: ignore
    scaled = _scaler.transform(fv)  # type: ignore
    weekly = float(_model.predict(scaled)[0])  # type: ignore
    weekly = round(min(max(weekly, 29), 99), 2)

    band = 0.06
    tier = "Basic" if weekly < 50 else "Standard" if weekly < 75 else "Premium"

    return {
        "weekly_premium"   : weekly,
        "monthly_estimate" : round(weekly * 4.33, 2),
        "annual_estimate"  : round(weekly * 52, 2),
        "tier_label"       : tier,
        "confidence_band_low"  : round(weekly * (1 - band), 2),
        "confidence_band_high" : round(weekly * (1 + band), 2),
        "model"            : "XGBoost Gradient Boosting v2",
        "feature_count"    : len(_features),   # type: ignore[arg-type]
        "coverage_note"    : "Income loss only — rain, heat, AQI, curfew, floods",
    }
