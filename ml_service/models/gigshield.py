"""
GigShield Fraud Detection Model v1 — Random Forest (35 features).

Wraps the trained gigshield_model.pkl (scikit-learn RandomForestClassifier)
for use inside the PolicyPilotAI FastAPI ML service.

Feature set covers: worker demographics, GPS signals, weather API match,
behavioral patterns, platform activity, and loyalty data.

Decision thresholds:
  fraud_probability < 0.30  → AUTO_APPROVE  (instant UPI payout)
  fraud_probability 0.30–0.70 → MANUAL_REVIEW (24-hour investigation)
  fraud_probability > 0.70  → AUTO_REJECT   (rejected; appeal available)
"""
from __future__ import annotations

import json
import pickle
import logging
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

BASE_DIR      = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

# Lazy-loaded globals
_model         = None
_label_encoders: dict | None = None
_feature_names: list[str] | None = None
_cat_cols: list[str] | None = None

THRESHOLD_APPROVE = 0.30
THRESHOLD_REJECT  = 0.70


def _load() -> None:
    """Lazy-load gigshield_model.pkl and gigshield_schema.json on first call."""
    global _model, _label_encoders, _feature_names, _cat_cols
    if _model is not None:
        return

    model_path  = ARTIFACTS_DIR / "gigshield_model.pkl"
    schema_path = ARTIFACTS_DIR / "gigshield_schema.json"

    logger.info("Loading GigShield Random Forest model...")

    with open(model_path, "rb") as f:
        artifact = pickle.load(f)

    _model          = artifact["model"]
    _label_encoders = artifact["label_encoders"]
    _feature_names  = artifact["feature_names"]   # list[str], 35 features
    _cat_cols       = artifact["cat_cols"]         # list[str], 5 categorical cols

    # Validate schema file is consistent
    with open(schema_path) as f:
        schema = json.load(f)
    assert schema["feature_names"] == _feature_names, (
        "gigshield_schema.json feature_names does not match model artifact!"
    )

    logger.info(
        f"GigShield model loaded — {len(_feature_names)} features, "
        f"{len(_cat_cols)} categorical cols."
    )


def get_feature_names() -> list[str]:
    """Return the 35 feature names used by the GigShield model."""
    _load()
    return list(_feature_names)  # type: ignore[arg-type]


def _encode_features(data: dict[str, Any]) -> pd.DataFrame:
    """Encode a single claim dict into the model's 35-feature vector."""
    row: list[float] = []
    for feat in _feature_names:  # type: ignore[union-attr]
        val = data.get(feat)
        if val is None:
            raise ValueError(f"Missing required field: '{feat}'")
        if feat in _cat_cols:  # type: ignore[operator]
            le = _label_encoders[feat]  # type: ignore[index]
            if val not in le.classes_:
                raise ValueError(
                    f"Invalid value '{val}' for '{feat}'. "
                    f"Allowed: {list(le.classes_)}"
                )
            val = int(le.transform([val])[0])
        row.append(float(val))
    return pd.DataFrame([row], columns=_feature_names)


def _make_decision(fraud_prob: float) -> dict[str, Any]:
    """Map fraud probability to a GigShield payout decision."""
    risk_score = round(fraud_prob * 100, 1)
    if fraud_prob < THRESHOLD_APPROVE:
        return {
            "decision": "AUTO_APPROVE",
            "risk_score": risk_score,
            "action": "Instant UPI payout triggered",
            "payout_eta": "< 2 minutes via UPI",
        }
    elif fraud_prob < THRESHOLD_REJECT:
        return {
            "decision": "MANUAL_REVIEW",
            "risk_score": risk_score,
            "action": "Flagged for 24-hour investigation",
            "payout_eta": "2–4 hours",
        }
    else:
        return {
            "decision": "AUTO_REJECT",
            "risk_score": risk_score,
            "action": "Claim rejected; appeal option available",
            "payout_eta": None,
        }


def predict(data: dict[str, Any]) -> dict[str, Any]:
    """
    Run GigShield fraud detection on a single claim.

    Args:
        data: dict with all 35 required feature fields (see schema).

    Returns:
        Prediction dict with decision, risk_score, fraud_probability,
        top_signals, and model metadata.

    Raises:
        ValueError: if a required field is missing or a categorical value
                    is not in the allowed set.
    """
    _load()

    X = _encode_features(data)

    fraud_prob = float(_model.predict_proba(X)[0][1])  # type: ignore[union-attr]

    result = _make_decision(fraud_prob)
    result["fraud_probability"] = round(fraud_prob, 4)

    # Top 5 feature importances (explainability)
    importances = _model.feature_importances_          # type: ignore[union-attr]
    top_idx = np.argsort(importances)[::-1][:5]
    result["top_signals"] = [
        {
            "feature": _feature_names[i],              # type: ignore[index]
            "importance": round(float(importances[i]), 4),
        }
        for i in top_idx
    ]

    result["model"]         = "GigShield Random Forest v1"
    result["feature_count"] = len(_feature_names)      # type: ignore[arg-type]
    result["threshold_approve"] = THRESHOLD_APPROVE
    result["threshold_reject"]  = THRESHOLD_REJECT

    return result


def predict_batch(claims: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Score up to 100 claims in one call.

    Args:
        claims: list of claim dicts (max 100)

    Returns:
        List of per-claim prediction dicts (with index and optional error).
    """
    if len(claims) > 100:
        raise ValueError("Batch size limit is 100 claims per request.")
    _load()

    results: list[dict[str, Any]] = []
    for i, claim in enumerate(claims):
        try:
            res = predict(claim)
            res["index"] = i
        except ValueError as exc:
            res = {"index": i, "error": str(exc)}
        results.append(res)
    return results
