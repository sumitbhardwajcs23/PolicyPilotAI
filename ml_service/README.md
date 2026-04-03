# GigShield Fraud Detection API

A production-ready REST API that scores insurance claims for GigShield's gig worker platform using a Random Forest model (AUC 1.0 on synthetic data, ~0.90+ expected in production).

## Project structure

```
gigshield-api/
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── render.yaml             # Render deployment config
└── model/
    ├── gigshield_model.pkl # Trained Random Forest (scikit-learn)
    └── schema.json         # Feature names & allowed categorical values
```

---

## Deploy to Render (step by step)

### 1. Push to GitHub

```bash
cd gigshield-api
git init
git add .
git commit -m "Initial GigShield fraud API"
git remote add origin https://github.com/YOUR_USERNAME/gigshield-api.git
git push -u origin main
```

### 2. Create a Render Web Service

1. Go to [https://render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo (`gigshield-api`)
3. Render auto-detects `render.yaml` — just click **Deploy**

Or configure manually:

| Setting | Value |
|---|---|
| Runtime | Python 3 |
| Build command | `pip install -r requirements.txt` |
| Start command | `gunicorn app:app --workers 2 --threads 4 --bind 0.0.0.0:$PORT --timeout 60` |
| Health check path | `/health` |

### 3. Done — your API is live at `https://gigshield-fraud-api.onrender.com`

---

## API reference

### `GET /health`
```bash
curl https://gigshield-fraud-api.onrender.com/health
```
```json
{ "status": "ok", "timestamp": "2026-04-03T10:00:00" }
```

### `GET /schema`
Returns all feature names and allowed categorical values.

```bash
curl https://gigshield-fraud-api.onrender.com/schema
```

### `POST /predict` — score a single claim

```bash
curl -X POST https://gigshield-fraud-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "worker_age": 28,
    "worker_zone": "Gurgaon",
    "platform": "Swiggy",
    "vehicle_type": "Bike",
    "months_active": 12,
    "avg_weekly_earnings_inr": 3500,
    "work_hours_daily": 9,
    "multiplatform": 0,
    "season": "Monsoon",
    "trigger_type": "Heavy Rainfall",
    "geo_risk": 0.3,
    "temporal_risk": 0.2,
    "combined_risk": 0.5,
    "gps_zone_match": 0.9,
    "gps_network_delta_m": 80,
    "accel_variance": 0.45,
    "mock_location_flag": 0,
    "speed_anomaly": 0,
    "gps_trust_score": 0.82,
    "claim_latitude": 28.45,
    "claim_longitude": 77.02,
    "weather_api_match": 0.85,
    "rainfall_mm_hr": 62,
    "heat_index_celsius": 34,
    "aqi": 95,
    "claims_this_month": 1,
    "earnings_deviation": 0.18,
    "peer_claim_ratio": 0.65,
    "platform_login_active": 1,
    "order_availability": 1,
    "duplicate_upi_event": 0,
    "loyalty_score": 0.7,
    "loyalty_discount": 0.14,
    "weekly_premium_inr": 59,
    "hours_disrupted": 3
  }'
```

**Response:**
```json
{
  "decision": "AUTO_APPROVE",
  "risk_score": 8.2,
  "fraud_probability": 0.082,
  "action": "Instant UPI payout triggered",
  "timestamp": "2026-04-03T10:00:00",
  "top_signals": [
    { "feature": "gps_network_delta_m", "importance": 0.157 },
    { "feature": "accel_variance", "importance": 0.143 },
    { "feature": "weather_api_match", "importance": 0.140 },
    { "feature": "gps_trust_score", "importance": 0.139 },
    { "feature": "earnings_deviation", "importance": 0.131 }
  ]
}
```

### `POST /predict/batch` — score up to 100 claims

```bash
curl -X POST https://gigshield-fraud-api.onrender.com/predict/batch \
  -H "Content-Type: application/json" \
  -d '[{ ...claim1... }, { ...claim2... }]'
```

---

## Decision thresholds

| Risk score | Decision | Action |
|---|---|---|
| 0 – 30 | AUTO_APPROVE | Instant UPI payout |
| 31 – 70 | MANUAL_REVIEW | 24-hour investigation |
| 71 – 100 | AUTO_REJECT | Rejected with appeal option |

---

## Allowed categorical values

| Field | Values |
|---|---|
| `worker_zone` | Connaught Place, Dwarka, East Delhi, Faridabad, Gurgaon, Lajpat Nagar, Noida, North Delhi, Rohini, Saket, South Delhi, West Delhi |
| `platform` | BigBasket, Blinkit, Instamart, Swiggy, Zepto, Zomato |
| `vehicle_type` | Bicycle, Bike, EV Scooter |
| `season` | Monsoon, Post-Monsoon, Summer, Winter |
| `trigger_type` | Extreme Heat, Flooding, Heavy Rainfall, Severe Pollution, Social Disruption |

---

## Local development

```bash
pip install -r requirements.txt
python app.py
# → Running on http://localhost:5000
```
