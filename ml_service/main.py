"""
PolicyPilotAI ML Microservice v3 — Gig Worker Income Protection.

Models:
  1. Weekly Micro-Premium  — XGBoost, 22 features (₹29–₹99/week)
  2. GigShield Fraud Detection — Random Forest, 35 features
     GPS · Weather · Behavioural · Loyalty signals

Endpoints:
  GET  /health                   — Health check
  GET  /models/info              — Model metadata & accuracy
  POST /predict/premium          — Gig worker weekly micro-premium
  POST /predict/fraud            — Fraud detection (GigShield RF v1)
  POST /predict/fraud/batch      — Batch fraud scoring (up to 100 claims)
  POST /predict/batch            — Run any combination in one call
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
from models import gigshield as fraud_model   # GigShield RF is now THE fraud model

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
META_PATH     = ARTIFACTS_DIR / "model_metadata.json"

import os

app = FastAPI(
    title="PolicyPilotAI ML Service v3",
    description="Gig Worker Income Protection — Weekly Micro-Premium & GigShield Fraud Detection",
    version="3.0.0",
)

ALLOWED_ORIGINS = [
    "*",
    "https://main.d1tw90tt4alsd5.amplifyapp.com",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    port = os.getenv("PORT", "8001")
    logger.info(f"PolicyPilotAI ML Service v3 starting on port {port}...")


# ── Request Schemas ─────────────────────────────────────────────────────────────

class PricingRequest(BaseModel):
    """22-feature input for Gig Worker Weekly Micro-Premium (₹29–₹99)."""
    # Worker demographics
    age: int                         = Field(28,    ge=18,  le=45)
    platform_code: int               = Field(0,     ge=0,   le=2,    description="0=Zomato, 1=Swiggy, 2=Both")
    city_tier: int                   = Field(1,     ge=1,   le=3,    description="1=Metro, 2=Tier-2, 3=Tier-3")
    # Earnings
    avg_weekly_earnings: float       = Field(3500,  gt=0,            description="₹ per week")
    earnings_cv_4weeks: float        = Field(0.2,   ge=0,   le=1.0,  description="Earnings coefficient of variation")
    # Work pattern
    active_days_per_week: int        = Field(6,     ge=1,   le=7)
    daily_active_hours: float        = Field(9.0,   ge=1,   le=16)
    avg_orders_per_day: float        = Field(25,    ge=1,   le=80)
    avg_delivery_distance_km: float  = Field(4.5,   ge=0.5, le=30)
    vehicle_type: int                = Field(1,     ge=0,   le=2,    description="0=cycle, 1=bike, 2=ebike")
    tenure_months_platform: int      = Field(12,    ge=0,   le=120)
    # Environmental risk
    zone_risk_score: float           = Field(0.3,   ge=0,   le=1.0)
    rain_disruption_days_30d: int    = Field(3,     ge=0,   le=30)
    heat_disruption_days_30d: int    = Field(2,     ge=0,   le=30)
    aqi_avg_30d: float               = Field(150,   ge=0,   le=500)
    flood_risk_zone: int             = Field(0,     ge=0,   le=2,    description="0=none, 1=moderate, 2=high")
    curfew_zone_risk: float          = Field(0.05,  ge=0,   le=1.0)
    # Coverage selection
    coverage_tier: int               = Field(1,     ge=0,   le=2,    description="0=Basic(₹29), 1=Standard(₹59), 2=Premium(₹99)")
    income_multiplier: float         = Field(1.0,   ge=1.0, le=2.0,  description="1=1x, 1.5=1.5x, 2=2x daily income")
    # Profile
    prior_claims_count: int          = Field(0,     ge=0,   le=20)
    has_alternate_income: int        = Field(0,     ge=0,   le=1)
    kyc_verified: int                = Field(1,     ge=0,   le=1,    description="Aadhaar+PAN verified")


class FraudRequest(BaseModel):
    """
    35-feature input for GigShield Fraud Detection (Random Forest v1).

    Covers: worker demographics · GPS signals · weather API match ·
            behavioural patterns · platform activity · loyalty data.

    Decision thresholds:
      fraud_probability < 0.30  → AUTO_APPROVE  (instant UPI payout)
      0.30 – 0.70               → MANUAL_REVIEW (24-hour investigation)
      > 0.70                    → AUTO_REJECT   (appeal available)
    """
    # Worker demographics
    worker_age: int                  = Field(28,    ge=18, le=70)
    worker_zone: str                 = Field("Gurgaon",     description="Connaught Place, Dwarka, East Delhi, Faridabad, Gurgaon, Lajpat Nagar, Noida, North Delhi, Rohini, Saket, South Delhi, West Delhi")
    platform: str                    = Field("Swiggy",      description="BigBasket, Blinkit, Instamart, Swiggy, Zepto, Zomato")
    vehicle_type: str                = Field("Bike",        description="Bicycle, Bike, EV Scooter")
    months_active: int               = Field(12,   ge=0,  le=120)
    avg_weekly_earnings_inr: float   = Field(3500, gt=0,            description="Average weekly earnings in INR")
    work_hours_daily: float          = Field(9.0,  ge=1,  le=16)
    multiplatform: int               = Field(0,    ge=0,  le=1,    description="1=works on multiple platforms")
    # Trigger context
    season: str                      = Field("Monsoon",    description="Monsoon, Post-Monsoon, Summer, Winter")
    trigger_type: str                = Field("Heavy Rainfall", description="Extreme Heat, Flooding, Heavy Rainfall, Severe Pollution, Social Disruption")
    # Risk signals
    geo_risk: float                  = Field(0.3,  ge=0,  le=1.0)
    temporal_risk: float             = Field(0.2,  ge=0,  le=1.0)
    combined_risk: float             = Field(0.5,  ge=0,  le=1.0)
    # GPS signals
    gps_zone_match: float            = Field(0.9,  ge=0,  le=1.0,  description="GPS zone match score")
    gps_network_delta_m: float       = Field(80,   ge=0,            description="Delta between GPS and network location (m)")
    accel_variance: float            = Field(0.45, ge=0,            description="Accelerometer variance")
    mock_location_flag: int          = Field(0,    ge=0,  le=1,    description="1=mock GPS detected")
    speed_anomaly: int               = Field(0,    ge=0,  le=1)
    gps_trust_score: float           = Field(0.82, ge=0,  le=1.0)
    claim_latitude: float            = Field(28.45,                  description="Latitude of claim location")
    claim_longitude: float           = Field(77.02,                  description="Longitude of claim location")
    # Weather data
    weather_api_match: float         = Field(0.85, ge=0,  le=1.0,  description="Weather API verification score")
    rainfall_mm_hr: float            = Field(62,   ge=0,            description="Rainfall mm/hr at claim time")
    heat_index_celsius: float        = Field(34,   ge=0,  le=60)
    aqi: float                       = Field(95,   ge=0,  le=500,  description="Air Quality Index")
    # Behavioural
    claims_this_month: int           = Field(1,    ge=0)
    earnings_deviation: float        = Field(0.18, ge=0,  le=5.0,  description="Deviation from peer earnings")
    peer_claim_ratio: float          = Field(0.65, ge=0,  le=1.0,  description="Fraction of zone peers also claiming")
    platform_login_active: int       = Field(1,    ge=0,  le=1,    description="Was worker logged in during event?")
    order_availability: int          = Field(1,    ge=0,  le=1,    description="Were orders available in zone?")
    duplicate_upi_event: int         = Field(0,    ge=0,  le=1,    description="1=duplicate UPI payout detected")
    # Loyalty
    loyalty_score: float             = Field(0.7,  ge=0,  le=1.0)
    loyalty_discount: float          = Field(0.14, ge=0,  le=1.0,  description="Loyalty discount fraction")
    weekly_premium_inr: float        = Field(59,   gt=0,            description="Current weekly premium (INR)")
    hours_disrupted: float           = Field(3,    ge=0,  le=24,   description="Hours of income disruption claimed")


class BatchRequest(BaseModel):
    """Run pricing and/or fraud models in a single HTTP call."""
    pricing: Optional[PricingRequest] = None
    fraud:   Optional[FraudRequest]   = None


# ── Routes ──────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "PolicyPilotAI ML v3",
        "target": "Gig Worker Income Protection",
    }


@app.get("/models/info", tags=["System"])
def model_info():
    meta = {}
    if META_PATH.exists():
        with open(META_PATH) as f:
            meta = json.load(f)
    return {
        "version": "3.0",
        "models": {
            "weekly_micro_premium": {
                "algorithm"           : "XGBoost Gradient Boosting",
                "output"              : "Weekly premium ₹29–₹99",
                "feature_count"       : 22,
                "features"            : pricing_model.get_feature_names(),
                "training_records"    : 60_000,
                "retraining_schedule" : "Monthly",
                "endpoint"            : "POST /predict/premium",
            },
            "gigshield_fraud_detection": {
                "algorithm"           : "GigShield Random Forest v1",
                "output"              : "Fraud decision (AUTO_APPROVE / MANUAL_REVIEW / AUTO_REJECT) + top signals",
                "feature_count"       : 35,
                "features"            : fraud_model.get_feature_names(),
                "signal_groups"       : ["worker_demographics", "gps", "weather", "behavioural", "loyalty"],
                "decision_thresholds" : {
                    "auto_approve_below": 0.30,
                    "auto_reject_above" : 0.70,
                },
                "retraining_schedule" : "Monthly",
                "endpoint"            : "POST /predict/fraud",
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
    Score a single insurance claim using the GigShield Random Forest model.

    Returns:
      - decision: AUTO_APPROVE / MANUAL_REVIEW / AUTO_REJECT
      - risk_score: 0–100
      - fraud_probability: 0.0–1.0
      - top_signals: top 5 feature importances
      - action & payout_eta
    """
    try:
        result = fraud_model.predict(req.model_dump())
        return {"success": True, "prediction": result}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Fraud prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/fraud/batch", tags=["Predictions"])
def predict_fraud_batch(claims: list[FraudRequest]):
    """
    Score up to 100 claims in one call using the GigShield RF model.
    Each item in the response mirrors the single /predict/fraud response.
    Requests with > 100 items are rejected with HTTP 400.
    """
    if len(claims) > 100:
        raise HTTPException(status_code=400, detail="Batch size limit is 100 claims per request.")
    try:
        results = fraud_model.predict_batch([c.model_dump() for c in claims])
        return {"success": True, "count": len(results), "results": results}
    except Exception as exc:
        logger.exception("Fraud batch prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/batch", tags=["Predictions"])
def predict_batch(req: BatchRequest):
    """Run pricing and/or fraud models in a single call."""
    response: dict[str, Any] = {"success": True}
    try:
        if req.pricing:
            response["pricing"] = pricing_model.predict(req.pricing.model_dump())
        if req.fraud:
            response["fraud"] = fraud_model.predict(req.fraud.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Batch prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
