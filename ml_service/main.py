"""
PolicyPilotAI ML Microservice v2 — Gig Worker Income Protection.

Endpoints:
  GET  /health                  — Health check
  GET  /models/info             — Model metadata & accuracy
  POST /predict/premium         — Gig worker weekly micro-premium (₹29–₹99)
  POST /predict/fraud           — Parametric claim fraud detection (zero-touch)
  POST /predict/batch           — Both models in one call
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models import pricing as pricing_model
from models import fraud as fraud_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
META_PATH     = ARTIFACTS_DIR / "model_metadata.json"

app = FastAPI(
    title="PolicyPilotAI ML Service v2",
    description="Gig Worker Income Protection — Weekly Micro-Premium & Parametric Fraud Detection",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Schemas ────────────────────────────────────────────────────────────

class PricingRequest(BaseModel):
    """22-feature input for Gig Worker Weekly Micro-Premium (₹29–₹99)."""
    # Worker demographics
    age: int                     = Field(28,   ge=18, le=45)
    platform_code: int           = Field(0,    ge=0,  le=2,   description="0=Zomato, 1=Swiggy, 2=Both")
    city_tier: int               = Field(1,    ge=1,  le=3,   description="1=Metro, 2=Tier-2, 3=Tier-3")
    # Earnings
    avg_weekly_earnings: float   = Field(3500, gt=0,  description="₹ per week")
    earnings_cv_4weeks: float    = Field(0.2,  ge=0,  le=1.0, description="Earnings coefficient of variation")
    # Work pattern
    active_days_per_week: int    = Field(6,    ge=1,  le=7)
    daily_active_hours: float    = Field(9.0,  ge=1,  le=16)
    avg_orders_per_day: float    = Field(25,   ge=1,  le=80)
    avg_delivery_distance_km: float = Field(4.5, ge=0.5, le=30)
    vehicle_type: int            = Field(1,    ge=0,  le=2,   description="0=cycle, 1=bike, 2=ebike")
    tenure_months_platform: int  = Field(12,   ge=0,  le=120)
    # Environmental risk
    zone_risk_score: float       = Field(0.3,  ge=0,  le=1.0)
    rain_disruption_days_30d: int = Field(3,   ge=0,  le=30)
    heat_disruption_days_30d: int = Field(2,   ge=0,  le=30)
    aqi_avg_30d: float           = Field(150,  ge=0,  le=500)
    flood_risk_zone: int         = Field(0,    ge=0,  le=2,   description="0=none, 1=moderate, 2=high")
    curfew_zone_risk: float      = Field(0.05, ge=0,  le=1.0)
    # Coverage selection
    coverage_tier: int           = Field(1,    ge=0,  le=2,   description="0=Basic(₹29), 1=Standard(₹59), 2=Premium(₹99)")
    income_multiplier: float     = Field(1.0,  ge=1.0, le=2.0, description="1=1x, 1.5=1.5x, 2=2x daily income")
    # Profile
    prior_claims_count: int      = Field(0,    ge=0,  le=20)
    has_alternate_income: int    = Field(0,    ge=0,  le=1)
    kyc_verified: int            = Field(1,    ge=0,  le=1,   description="Aadhaar+PAN verified")


class FraudRequest(BaseModel):
    """28-feature input for Parametric Claim Fraud Detection."""
    # Trigger context
    trigger_type: int                     = Field(0,    ge=0, le=4,    description="0=rain, 1=heat, 2=aqi, 3=curfew, 4=flood")
    weather_api_threshold_crossed: int    = Field(1,    ge=0, le=1,    description="1=verified by OpenWeather/AQI API")
    rainfall_mm_on_day: float             = Field(80,   ge=0, le=300)
    temperature_celsius: float            = Field(38,   ge=0, le=55)
    aqi_reading_trigger_day: float        = Field(250,  ge=0, le=500)
    event_duration_hours: float           = Field(5,    ge=0, le=24)
    multiple_workers_same_event: float    = Field(0.7,  ge=0, le=1.0,  description="Fraction of zone claiming")
    # GPS / Location
    gps_in_affected_zone: int             = Field(1,    ge=0, le=1)
    location_matches_home_zone: int       = Field(1,    ge=0, le=1)
    distance_from_trigger_km: float       = Field(0.5,  ge=0, le=100)
    # Platform signals
    platform_order_drop_pct: float        = Field(0.6,  ge=0, le=1.0,  description="% drop in zone orders")
    platform_activity_at_time: int        = Field(0,    ge=0, le=1,    description="Was worker active on app during event?")
    zone_order_volume_drop: float         = Field(0.7,  ge=0, le=1.0)
    # Worker profile
    account_age_days: int                 = Field(180,  ge=0)
    kyc_complete: int                     = Field(1,    ge=0, le=1)
    biometric_verified: int              = Field(1,    ge=0, le=1)
    prior_claims_count_90d: int          = Field(0,    ge=0)
    prior_fraud_flags: int               = Field(0,    ge=0, le=1)
    platform_rating: float               = Field(4.2,  ge=1.0, le=5.0)
    tenure_weeks: int                    = Field(50,   ge=0)
    # Claim behaviour
    claim_filed_within_hours: float      = Field(0.5,  ge=0, le=72,   description="0=auto-triggered")
    claim_amount_vs_weekly_avg: float    = Field(0.8,  ge=0,          description="Ratio: claim ÷ avg weekly earnings")
    upi_id_changed_7d: int              = Field(0,    ge=0, le=1)
    multiple_upi_ids: int               = Field(0,    ge=0, le=1)
    device_changes_7d: int              = Field(0,    ge=0)
    login_anomaly_score: float          = Field(0.05, ge=0, le=1.0)
    support_escalation_count_7d: int    = Field(0,    ge=0)
    claim_description_similarity: float = Field(0.05, ge=0, le=1.0)
    # Optional threshold override
    threshold: float                    = Field(0.5,  ge=0, le=1.0)


class BatchRequest(BaseModel):
    pricing: Optional[PricingRequest] = None
    fraud:   Optional[FraudRequest]   = None


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "PolicyPilotAI ML v2", "target": "Gig Worker Income Protection"}


@app.get("/models/info", tags=["System"])
def model_info():
    meta = {}
    if META_PATH.exists():
        with open(META_PATH) as f:
            meta = json.load(f)
    return {
        "version": "2.0",
        "models": {
            "weekly_micro_premium": {
                "algorithm"           : "XGBoost Gradient Boosting",
                "output"              : "Weekly premium ₹29–₹99",
                "feature_count"       : 22,
                "features"            : pricing_model.get_feature_names(),
                "training_records"    : 60_000,
                "retraining_schedule" : "Monthly",
            },
            "parametric_fraud_detection": {
                "algorithm"           : "Ensemble RF(60%) + NN(40%)",
                "output"              : "Fraud probability + payout decision",
                "feature_count"       : 28,
                "features"            : fraud_model.get_feature_names(),
                "training_records"    : 15_000,
                "fraud_prevalence"    : "12%",
                "retraining_schedule" : "Weekly",
            },
        },
        "metadata": meta,
    }


@app.post("/predict/premium", tags=["Predictions"])
def predict_premium(req: PricingRequest):
    """
    Predict weekly micro-premium for a gig worker.
    Output: ₹29–₹99/week — Basic / Standard / Premium tiers.
    """
    try:
        result = pricing_model.predict(req.model_dump())
        return {"success": True, "prediction": result}
    except Exception as exc:
        logger.exception("Pricing prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/fraud", tags=["Predictions"])
def predict_fraud(req: FraudRequest):
    """
    Detect fraud in a parametric income-loss claim.
    Returns payout_decision: AUTO_APPROVE / MANUAL_REVIEW / REJECTED
    """
    try:
        data = req.model_dump()
        threshold = data.pop("threshold", 0.5)
        result = fraud_model.predict(data, threshold=threshold)
        return {"success": True, "prediction": result}
    except Exception as exc:
        logger.exception("Fraud prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/batch", tags=["Predictions"])
def predict_batch(req: BatchRequest):
    """Run both models in a single call."""
    response: dict[str, Any] = {"success": True}
    try:
        if req.pricing:
            response["pricing"] = pricing_model.predict(req.pricing.model_dump())
        if req.fraud:
            data = req.fraud.model_dump()
            threshold = data.pop("threshold", 0.5)
            response["fraud"] = fraud_model.predict(data, threshold=threshold)
    except Exception as exc:
        logger.exception("Batch prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
