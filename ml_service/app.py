import os
import pickle
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ── Load model artifacts ──────────────────────────────────────────────────────
# Artifacts are in the same directory as app.py
MODEL_PATH = os.path.join(os.path.dirname(__file__), "gigshield_model.pkl")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.json")

with open(MODEL_PATH, "rb") as f:
    artifact = pickle.load(f)

with open(SCHEMA_PATH) as f:
    schema = json.load(f)

model = artifact["model"]
label_encoders = artifact["label_encoders"]
FEATURE_NAMES = artifact["feature_names"]
CAT_COLS = artifact["cat_cols"]

# Decision thresholds (matching GigShield spec)
THRESHOLD_APPROVE = 0.30   # prob < 0.30 → auto-approve
THRESHOLD_REJECT  = 0.70   # prob > 0.70 → auto-reject


def make_decision(fraud_prob: float) -> dict:
    score = round(fraud_prob * 100, 1)
    if fraud_prob < THRESHOLD_APPROVE:
        return {"decision": "AUTO_APPROVE", "risk_score": score,
                "action": "Instant UPI payout triggered"}
    elif fraud_prob < THRESHOLD_REJECT:
        return {"decision": "MANUAL_REVIEW", "risk_score": score,
                "action": "Flagged for 24-hour investigation"}
    else:
        return {"decision": "AUTO_REJECT", "risk_score": score,
                "action": "Claim rejected; appeal option available"}


def encode_features(data: dict) -> np.ndarray:
    """Encode a single claim dict into the model's feature vector."""
    row = []
    for feat in FEATURE_NAMES:
        val = data.get(feat)
        if val is None:
            raise ValueError(f"Missing required field: '{feat}'")
        if feat in CAT_COLS:
            le = label_encoders[feat]
            if val not in le.classes_:
                raise ValueError(
                    f"Unknown value '{val}' for '{feat}'. "
                    f"Allowed: {list(le.classes_)}"
                )
            val = le.transform([val])[0]
        row.append(float(val))
    return pd.DataFrame([row], columns=FEATURE_NAMES)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "GigShield Fraud Detection API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "POST /predict": "Score a single claim",
            "POST /predict/batch": "Score up to 100 claims",
            "GET  /schema": "Field definitions and allowed values",
            "GET  /health": "Health check"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@app.route("/schema", methods=["GET"])
def get_schema():
    return jsonify({
        "feature_names": FEATURE_NAMES,
        "categorical_fields": CAT_COLS,
        "allowed_values": schema["le_classes"],
        "thresholds": {
            "auto_approve_below": THRESHOLD_APPROVE,
            "auto_reject_above": THRESHOLD_REJECT
        }
    })


@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(force=True, silent=True)
    if not body:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        X = encode_features(body)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422

    fraud_prob = float(model.predict_proba(X)[0][1])
    result = make_decision(fraud_prob)
    result["fraud_probability"] = round(fraud_prob, 4)
    result["timestamp"] = datetime.utcnow().isoformat()

    # Top feature contributions (approximate via feature importances)
    importances = model.feature_importances_
    top_idx = np.argsort(importances)[::-1][:5]
    result["top_signals"] = [
        {"feature": FEATURE_NAMES[i], "importance": round(float(importances[i]), 4)}
        for i in top_idx
    ]

    return jsonify(result)


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    body = request.get_json(force=True, silent=True)
    if not body or not isinstance(body, list):
        return jsonify({"error": "Request body must be a JSON array of claim objects"}), 400
    if len(body) > 100:
        return jsonify({"error": "Batch size limit is 100 claims per request"}), 400

    results = []
    for i, claim in enumerate(body):
        try:
            X = encode_features(claim)
            fraud_prob = float(model.predict_proba(X)[0][1])
            res = make_decision(fraud_prob)
            res["fraud_probability"] = round(fraud_prob, 4)
            res["index"] = i
        except ValueError as e:
            res = {"index": i, "error": str(e)}
        results.append(res)

    return jsonify({
        "count": len(results),
        "timestamp": datetime.utcnow().isoformat(),
        "results": results
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
