"""
Train script for PolicyPilotAI v2 — Gig Worker Income Protection ML Models.

Target: Food-delivery gig workers (Zomato/Swiggy) in Indian cities.
Coverage: Income loss due to rain, extreme heat, AQI, zone closures, curfews.

Models:
  1. Gig Worker Weekly Micro-Premium Model
     — XGBoost Regressor, 22 features, 60,000 synthetic records
     — Output: weekly premium in ₹29–₹99 range

  2. Parametric Trigger + Fraud Detection Ensemble
     — Random Forest + Neural Network (50/50 avg), 28 features, 15,000 records
     — Output: fraud probability for zero-touch parametric claims
"""
from __future__ import annotations

import json
import os
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras

warnings.filterwarnings("ignore")
np.random.seed(42)
tf.random.set_seed(42)

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)

print(f"\n=== PolicyPilotAI v2 — Gig Worker ML Training ===\n")
print(f"[INFO] Artifacts → {ARTIFACTS_DIR}\n")


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 1 — WEEKLY MICRO-PREMIUM PRICING
# Target: ₹29–₹99/week for gig worker income protection
# ══════════════════════════════════════════════════════════════════════════════

PRICING_FEATURES: list[str] = [
    "age",                          # 18–45 years
    "platform_code",                # 0=Zomato, 1=Swiggy, 2=Both
    "city_tier",                    # 1=Metro, 2=Tier-2, 3=Tier-3
    "avg_weekly_earnings",          # ₹ (2,000–8,000)
    "earnings_cv_4weeks",           # Coefficient of variation (volatility)
    "active_days_per_week",         # 3–7
    "daily_active_hours",           # 4–14 hours/day
    "avg_orders_per_day",           # 10–60
    "avg_delivery_distance_km",     # per trip
    "vehicle_type",                 # 0=cycle, 1=bike, 2=ebike
    "tenure_months_platform",       # months on platform
    "zone_risk_score",              # 0–1 based on closure/disruption history
    "rain_disruption_days_30d",     # days lost to rain in last 30 days
    "heat_disruption_days_30d",     # days lost to extreme heat
    "aqi_avg_30d",                  # 30-day average AQI in work zone
    "flood_risk_zone",              # 0=no, 1=moderate, 2=high
    "curfew_zone_risk",             # 0–1 historical closure frequency
    "coverage_tier",                # 0=Basic(₹29), 1=Standard(₹59), 2=Premium(₹99)
    "income_multiplier",            # 1=1x daily, 1.5=1.5x, 2=2x coverage
    "prior_claims_count",           # 0–5
    "has_alternate_income",         # 0/1
    "kyc_verified",                 # 0/1 (Aadhaar+PAN)
]

def generate_pricing_data(n: int = 60_000) -> pd.DataFrame:
    """Generate synthetic weekly micro-premium records for gig workers."""
    print(f"[INFO] Generating {n:,} gig worker pricing records …")

    age = np.random.randint(18, 46, n)
    platform = np.random.choice([0, 1, 2], n, p=[0.45, 0.40, 0.15])
    city_tier = np.random.choice([1, 2, 3], n, p=[0.50, 0.35, 0.15])
    avg_weekly = np.random.lognormal(8.4, 0.35, n).clip(2000, 8000)   # ₹2k–8k/week
    earnings_cv = np.random.exponential(0.22, n).clip(0.05, 0.90)
    active_days = np.random.randint(3, 8, n)
    daily_hours = np.random.normal(9, 2, n).clip(4, 14)
    orders_per_day = np.random.poisson(25, n).clip(10, 60)
    avg_dist = np.random.lognormal(1.8, 0.45, n).clip(1.5, 12)
    vehicle = np.random.choice([0, 1, 2], n, p=[0.08, 0.75, 0.17])
    tenure = np.random.randint(1, 60, n)
    zone_risk = np.random.beta(2, 4, n)
    rain_days = np.random.poisson(3, n).clip(0, 20)
    heat_days = np.random.poisson(2, n).clip(0, 15)
    aqi_avg = np.random.lognormal(4.5, 0.5, n).clip(30, 400)
    flood_risk = np.random.choice([0, 1, 2], n, p=[0.60, 0.28, 0.12])
    curfew_risk = np.random.beta(1, 8, n)
    coverage_tier = np.random.choice([0, 1, 2], n, p=[0.40, 0.40, 0.20])
    income_mult = np.random.choice([1.0, 1.5, 2.0], n, p=[0.50, 0.35, 0.15])
    prior_claims = np.random.poisson(0.5, n).clip(0, 5)
    alt_income = np.random.binomial(1, 0.15, n)
    kyc = np.random.binomial(1, 0.88, n)

    # ── Weekly premium ground-truth formula (₹29–₹99/week) ─────────────
    base = (
        29.0
        + (coverage_tier * 25)                          # Basic=₹29, Std=₹54, Prem=₹79
        + (income_mult - 1.0) * 10                      # coverage multiplier
        + age * 0.3
        + city_tier * 2.0                               # smaller city → slightly cheaper
        + zone_risk * 10
        + (rain_days + heat_days) * 0.5
        + (aqi_avg > 200).astype(float) * 4             # high pollution surcharge
        + flood_risk * 3
        + curfew_risk * 6
        + earnings_cv * 8                               # volatile income → higher risk
        + prior_claims * 3
        - tenure * 0.05                                 # loyalty discount
        - kyc * 1.5                                     # KYC discount
        - alt_income * 2                                # buffer reduces risk
        + np.random.normal(0, 2, n)                     # noise
    ).clip(29, 99)

    df = pd.DataFrame(dict(zip(PRICING_FEATURES, [
        age, platform, city_tier, avg_weekly, earnings_cv,
        active_days, daily_hours, orders_per_day, avg_dist, vehicle,
        tenure, zone_risk, rain_days, heat_days, aqi_avg,
        flood_risk, curfew_risk, coverage_tier, income_mult,
        prior_claims, alt_income, kyc,
    ])))
    df["weekly_premium"] = base
    return df


def train_pricing_model(df: pd.DataFrame):
    """Train XGBoost weekly micro-premium model."""
    print("[INFO] Training XGBoost Weekly Premium model …")
    X = df[PRICING_FEATURES].values
    y = df["weekly_premium"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_train)
    X_te = scaler.transform(X_test)

    model = xgb.XGBRegressor(
        n_estimators=600,
        max_depth=5,
        learning_rate=0.04,
        subsample=0.8,
        colsample_bytree=0.75,
        min_child_weight=5,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    model.fit(X_tr, y_train, eval_set=[(X_te, y_test)], verbose=False)

    preds = model.predict(X_te).clip(29, 99)
    accuracy = float(np.mean(np.abs(preds - y_test) / y_test < 0.10))
    mae = float(np.mean(np.abs(preds - y_test)))

    print(f"  [Pricing] Within-10% accuracy: {accuracy:.2%}  MAE: ₹{mae:.2f}/week")
    return model, scaler, {"accuracy": accuracy, "mae": mae}


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 2 — PARAMETRIC TRIGGER + FRAUD DETECTION ENSEMBLE
# Target: Zero-touch claims triggered by external events (rain/AQI/heat/curfew)
# ══════════════════════════════════════════════════════════════════════════════

FRAUD_FEATURES: list[str] = [
    # ── Trigger verification ──────────────────────
    "trigger_type",                 # 0=rain, 1=heat, 2=aqi, 3=curfew, 4=flood
    "weather_api_threshold_crossed", # 1=verified by OpenWeather/AQI API
    "rainfall_mm_on_day",           # 0–200
    "temperature_celsius",          # 15–50
    "aqi_reading_trigger_day",      # 0–500
    "event_duration_hours",         # 0–24
    "multiple_workers_same_event",  # fraction of zone claiming same trigger (0–1)
    # ── GPS / Location ─────────────────────────────
    "gps_in_affected_zone",         # 1=worker GPS was in zone; 0=not verified
    "location_matches_home_zone",   # 1=usual work area; 0=anomalous
    "distance_from_trigger_km",     # km from trigger centroid at event time
    # ── Platform activity signals ─────────────────
    "platform_order_drop_pct",      # % drop in Zomato/Swiggy orders in zone
    "platform_activity_at_time",    # worker app active during event? (0/1)
    "zone_order_volume_drop",       # 0–1 (0=no drop, 1=complete blackout)
    # ── Worker profile ─────────────────────────────
    "account_age_days",             # days since registration
    "kyc_complete",                 # 0/1
    "biometric_verified",           # 0/1
    "prior_claims_count_90d",       # claims in last 90 days
    "prior_fraud_flags",            # 0/1 — previous suspicious claims
    "platform_rating",              # 1.0–5.0
    "tenure_weeks",                 # weeks on platform
    # ── Claim behaviour ────────────────────────────
    "claim_filed_within_hours",     # 0=auto-trigger, else manual delay
    "claim_amount_vs_weekly_avg",   # ratio: claim ÷ avg weekly earnings
    "upi_id_changed_7d",            # 0/1
    "multiple_upi_ids",             # 0/1
    "device_changes_7d",            # 0–10
    "login_anomaly_score",          # 0–1
    "support_escalation_count_7d",  # 0–20
    "claim_description_similarity", # 0–1 (1=copied template)
]


def generate_fraud_data(n: int = 15_000) -> pd.DataFrame:
    """Generate synthetic parametric claim records (~12% fraud rate)."""
    print(f"[INFO] Generating {n:,} parametric claim records …")
    is_fraud = np.random.binomial(1, 0.12, n)   # realistic 12% fraud rate

    def fw(fraud_val, legit_val):
        return np.where(is_fraud, fraud_val, legit_val)

    # Trigger context
    trigger = np.random.choice([0, 1, 2, 3, 4], n, p=[0.45, 0.20, 0.20, 0.10, 0.05])
    api_verified = fw(np.random.binomial(1, 0.20, n), np.random.binomial(1, 0.92, n))
    rainfall = fw(np.random.uniform(0, 20, n),   np.random.uniform(40, 180, n))
    temperature = fw(np.random.uniform(15, 30, n), np.random.uniform(35, 48, n))
    aqi = fw(np.random.uniform(50, 150, n),       np.random.uniform(200, 450, n))
    event_hrs = fw(np.random.uniform(0.5, 2, n),  np.random.uniform(3, 12, n))
    multi_workers = fw(np.random.uniform(0, 0.05, n), np.random.uniform(0.4, 1.0, n))

    # GPS / location
    gps_in_zone = fw(np.random.binomial(1, 0.20, n), np.random.binomial(1, 0.93, n))
    loc_match    = fw(np.random.binomial(1, 0.30, n), np.random.binomial(1, 0.91, n))
    dist_from    = fw(np.random.uniform(10, 40, n),   np.random.uniform(0, 3, n))

    # Platform signals
    order_drop_pct     = fw(np.random.uniform(0, 0.1, n),  np.random.uniform(0.3, 0.9, n))
    plat_active        = fw(np.random.binomial(1, 0.85, n), np.random.binomial(1, 0.20, n))
    zone_vol_drop      = fw(np.random.uniform(0, 0.1, n),  np.random.uniform(0.4, 1.0, n))

    # Worker profile
    acct_age           = fw(np.random.randint(5, 60, n),    np.random.randint(90, 730, n))
    kyc                = fw(np.random.binomial(1, 0.25, n), np.random.binomial(1, 0.94, n))
    biometric          = fw(np.random.binomial(1, 0.15, n), np.random.binomial(1, 0.88, n))
    prior_claims_90d   = fw(np.random.randint(2, 8, n),     np.random.randint(0, 2, n))
    fraud_flags        = fw(np.random.binomial(1, 0.55, n), np.random.binomial(1, 0.01, n))
    rating             = fw(np.random.uniform(1.0, 2.8, n), np.random.uniform(3.5, 5.0, n))
    tenure_wks         = fw(np.random.randint(1, 20, n),    np.random.randint(20, 200, n))

    # Claim behaviour
    filed_within_hrs   = fw(np.random.uniform(24, 72, n),  np.random.uniform(0, 4, n))
    amount_ratio       = fw(np.random.uniform(1.5, 4.0, n), np.random.uniform(0.5, 1.2, n))
    upi_changed        = fw(np.random.binomial(1, 0.60, n), np.random.binomial(1, 0.03, n))
    multi_upi          = fw(np.random.binomial(1, 0.40, n), np.random.binomial(1, 0.02, n))
    device_changes     = fw(np.random.randint(2, 10, n),    np.random.randint(0, 1, n))
    login_anomaly      = fw(np.random.uniform(0.6, 1.0, n), np.random.uniform(0, 0.15, n))
    support_count      = fw(np.random.randint(5, 20, n),    np.random.randint(0, 2, n))
    desc_similarity    = fw(np.random.uniform(0.7, 1.0, n), np.random.uniform(0, 0.3, n))

    df = pd.DataFrame(dict(zip(FRAUD_FEATURES, [
        trigger, api_verified, rainfall, temperature, aqi,
        event_hrs, multi_workers, gps_in_zone, loc_match, dist_from,
        order_drop_pct, plat_active, zone_vol_drop, acct_age, kyc,
        biometric, prior_claims_90d, fraud_flags, rating, tenure_wks,
        filed_within_hrs, amount_ratio, upi_changed, multi_upi, device_changes,
        login_anomaly, support_count, desc_similarity,
    ])))
    df["is_fraud"] = is_fraud
    return df


def build_nn(input_dim: int) -> keras.Model:
    model = keras.Sequential([
        keras.layers.Input(shape=(input_dim,)),
        keras.layers.Dense(64, activation="relu"),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(32, activation="relu"),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(16, activation="relu"),
        keras.layers.Dense(1, activation="sigmoid"),
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def train_fraud_model(df: pd.DataFrame):
    """Train Ensemble (RF + NN) for parametric claim fraud detection."""
    print("[INFO] Training Parametric Fraud Detection ensemble …")
    X = df[FRAUD_FEATURES].values.astype(np.float32)
    y = df["is_fraud"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_train).astype(np.float32)
    X_te = scaler.transform(X_test).astype(np.float32)

    # Random Forest
    rf = RandomForestClassifier(
        n_estimators=400,
        max_depth=14,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    rf.fit(X_tr, y_train)

    # Neural Network
    nn = build_nn(X_tr.shape[1])
    nn.fit(
        X_tr, y_train,
        epochs=25, batch_size=128,
        validation_split=0.1,
        class_weight={0: 1.0, 1: 7.0},   # 12% fraud → heavy overweight
        verbose=0,
    )

    # Ensemble (60% RF, 40% NN  — RF better for tabular)
    rf_probs = rf.predict_proba(X_te)[:, 1]
    nn_probs = nn.predict(X_te, verbose=0).flatten()
    ens_probs = 0.60 * rf_probs + 0.40 * nn_probs
    preds = (ens_probs >= 0.5).astype(int)

    accuracy = float(accuracy_score(y_test, preds))
    cm = confusion_matrix(y_test, preds)
    fpr = float(cm[0, 1] / (cm[0, 0] + cm[0, 1])) if cm[0].sum() > 0 else 0.0

    print(f"  [Fraud] Accuracy: {accuracy:.2%}  False Positive Rate: {fpr:.2%}")
    return rf, nn, scaler, {"accuracy": accuracy, "false_positive_rate": fpr}


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    # ── 1. Pricing ───────────────────────────────────────────────
    pricing_df = generate_pricing_data(60_000)
    pm, ps, pm_metrics = train_pricing_model(pricing_df)
    joblib.dump(pm, ARTIFACTS_DIR / "pricing_model.joblib")
    joblib.dump(ps, ARTIFACTS_DIR / "pricing_scaler.joblib")
    joblib.dump(PRICING_FEATURES, ARTIFACTS_DIR / "pricing_features.joblib")

    # ── 2. Fraud ─────────────────────────────────────────────────
    fraud_df = generate_fraud_data(15_000)
    rf, nn, fs, fm_metrics = train_fraud_model(fraud_df)
    joblib.dump(rf, ARTIFACTS_DIR / "fraud_rf_model.joblib")
    joblib.dump(fs, ARTIFACTS_DIR / "fraud_scaler.joblib")
    joblib.dump(FRAUD_FEATURES, ARTIFACTS_DIR / "fraud_features.joblib")
    nn.save(str(ARTIFACTS_DIR / "fraud_nn_model.keras"))

    # ── 3. Metadata ───────────────────────────────────────────────
    meta = {
        "version": "2.0",
        "target": "Gig Worker Income Protection (India)",
        "coverage": "Income loss — rain, extreme heat, AQI, curfew, floods",
        "pricing": {
            "algorithm": "XGBoost Gradient Boosting",
            "feature_count": len(PRICING_FEATURES),
            "training_records": 60_000,
            "output": "Weekly premium ₹29–₹99",
            "metrics": pm_metrics,
            "retraining_schedule": "Monthly",
        },
        "fraud": {
            "algorithm": "Ensemble (Random Forest 60% + Neural Network 40%)",
            "feature_count": len(FRAUD_FEATURES),
            "training_records": 15_000,
            "fraud_prevalence": "12%",
            "output": "Fraud probability for parametric claim",
            "metrics": fm_metrics,
            "retraining_schedule": "Weekly",
        },
    }
    with open(ARTIFACTS_DIR / "model_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print("\n=== ✅ Training Complete ===")
    print(f"  Pricing — within-10% accuracy : {pm_metrics['accuracy']:.2%}")
    print(f"  Pricing — MAE                 : ₹{pm_metrics['mae']:.2f}/week")
    print(f"  Fraud   — accuracy            : {fm_metrics['accuracy']:.2%}")
    print(f"  Fraud   — false positive rate : {fm_metrics['false_positive_rate']:.2%}")
    print(f"\n  Artifacts → {ARTIFACTS_DIR}\n")


if __name__ == "__main__":
    main()
