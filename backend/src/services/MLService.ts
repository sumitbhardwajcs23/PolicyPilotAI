/**
 * MLService.ts
 *
 * TypeScript client for communicating with the Python ML microservice.
 * Provides typed request/response interfaces for:
 *   - Premium Pricing Model (XGBoost, 23 features)
 *   - Fraud Detection Model (RF + Neural Network ensemble, 31 features)
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000'
const ML_TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS || '8000', 10)

// ─── Pricing Model Types ──────────────────────────────────────────────────────

export interface PricingInput {
  age: number
  income_bracket: number        // 0–4 (Low → High)
  location_risk_score: number   // 0.0–1.0
  avg_monthly_earnings: number
  earnings_volatility: number   // 0.0–1.0
  platform_tenure_months: number
  active_platforms: number
  weekly_hours_worked: number
  vehicle_age_years: number
  vehicle_type: number          // 0=bicycle,1=motorcycle,2=car,3=van
  prior_claims_count: number
  prior_claim_value_total: number
  weather_risk_score: number    // 0.0–1.0
  urban_rural_index: number     // 0=rural,1=urban
  peak_hour_fraction: number    // 0.0–1.0
  night_shift_fraction: number  // 0.0–1.0
  avg_trip_distance_km: number
  annual_mileage_km: number
  health_score: number          // 0–100
  coverage_tier: number         // 0=basic,1=standard,2=premium
  deductible_amount: number
  credit_score_band: number     // 0–4
  has_safety_training: number   // 0|1
}

export interface PricingPrediction {
  annual_premium: number
  monthly_premium: number
  confidence_band_low: number
  confidence_band_high: number
  model: string
  feature_count: number
}

// ─── Fraud Detection Model Types ──────────────────────────────────────────────

export interface FraudInput {
  worker_age: number
  worker_zone: string
  platform: string
  vehicle_type: string
  months_active: number
  avg_weekly_earnings_inr: number
  work_hours_daily: number
  multiplatform: number
  season: string
  trigger_type: string
  geo_risk: number
  temporal_risk: number
  combined_risk: number
  gps_zone_match: number
  gps_network_delta_m: number
  accel_variance: number
  mock_location_flag: number
  speed_anomaly: number
  gps_trust_score: number
  claim_latitude: number
  claim_longitude: number
  weather_api_match: number
  rainfall_mm_hr: number
  heat_index_celsius: number
  aqi: number
  claims_this_month: number
  earnings_deviation: number
  peer_claim_ratio: number
  platform_login_active: number
  order_availability: number
  duplicate_upi_event: number
  loyalty_score: number
  loyalty_discount: number
  weekly_premium_inr: number
  hours_disrupted: number
}

export interface FraudPrediction {
  decision: string
  risk_score: number
  fraud_probability: number
  action: string
  timestamp: string
  top_signals: { feature: string; importance: number }[]
  model?: string
}

// ─── Model Metadata Types ─────────────────────────────────────────────────────

export interface ModelInfo {
  models: {
    premium_pricing: { algorithm: string; feature_count: number; training_records: number; retraining_schedule: string }
    fraud_detection: { algorithm: string; feature_count: number; training_records: number; retraining_schedule: string }
  }
  metadata: Record<string, unknown>
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function callML<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS)

  try {
    const response = await fetch(`${ML_SERVICE_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'ML service error' }))
      throw new Error(`ML Service ${response.status}: ${JSON.stringify(error)}`)
    }

    return response.json() as Promise<T>
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check ML service health.
 * Returns `false` if the service is unavailable (gracefully degraded).
 */
export async function checkMLHealth(): Promise<boolean> {
  try {
    const res = await callML<{ status: string }>('/health')
    return res.status === 'healthy'
  } catch {
    return false
  }
}

/**
 * Get model metadata and accuracy metrics from the ML service.
 */
export async function getModelInfo(): Promise<any> {
  return callML<any>('/schema')
}

/**
 * Predict annual premium using the XGBoost Pricing Model.
 * Falls back to the simple formula if ML service is unavailable.
 */
export async function predictPremium(
  input: PricingInput
): Promise<{ prediction: PricingPrediction; source: 'ml' | 'fallback' }> {
  try {
    const result = await callML<{ success: boolean; prediction: PricingPrediction }>('/predict/premium', input)
    return { prediction: result.prediction, source: 'ml' }
  } catch (err) {
    console.warn('[MLService] Premium prediction failed, using fallback formula:', err)
    // Graceful degradation — simple fallback calculation
    const annual = Math.round(
      200 +
      input.age * 3 +
      input.location_risk_score * 400 +
      input.prior_claims_count * 120 +
      input.weather_risk_score * 250 +
      input.coverage_tier * 150
    )
    return {
      prediction: {
        annual_premium: annual,
        monthly_premium: Math.round(annual / 12),
        confidence_band_low: Math.round(annual * 0.92),
        confidence_band_high: Math.round(annual * 1.08),
        model: 'Fallback Formula',
        feature_count: 6,
      },
      source: 'fallback',
    }
  }
}

/**
 * Detect fraud using the Ensemble RF + Neural Network Model.
 * Falls back to the legacy rule-based score if ML service is unavailable.
 */
export async function detectFraud(
  input: FraudInput
): Promise<{ prediction: FraudPrediction; source: 'ml' | 'fallback' }> {
  try {
    const prediction = await callML<FraudPrediction>('/predict', input)
    return { prediction, source: 'ml' }
  } catch (err) {
    console.warn('[MLService] Fraud detection failed, using fallback score:', err)
    // Graceful degradation — rule-based fallback
    let score = 0
    if (!input.weather_api_match) score += 40
    if (input.duplicate_upi_event) score += 20
    if (input.mock_location_flag) score += 20
    if (input.claims_this_month > 2) score += 15
    score += Math.floor(Math.random() * 5)
    const prob = Math.min(score / 100, 0.99)
    return {
      prediction: {
        decision: prob < 0.3 ? 'AUTO_APPROVE' : prob < 0.7 ? 'MANUAL_REVIEW' : 'AUTO_REJECT',
        risk_score: prob * 100,
        fraud_probability: parseFloat(prob.toFixed(4)),
        action: prob < 0.3 ? "Instant UPI payout triggered" : "Flagged for 24-hour investigation",
        timestamp: new Date().toISOString(),
        top_signals: [],
        model: 'Fallback Rule Engine',
      },
      source: 'fallback',
    }
  }
}

/**
 * Helper to generate a deterministic pseudo-random float between min and max
 * based on a seed string (e.g., claimId).
 */
function getPseudoRandom(seed: string, min: number, max: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  const norm = (Math.abs(hash) % 1000) / 1000
  return parseFloat((min + norm * (max - min)).toFixed(4))
}

/**
 * Build a FraudInput object from a claim submission and user profile.
 * Maps existing claim/user fields to the 35 ML feature inputs for GigShield.
 */
export function buildFraudInput(claim: any, user: any, policy: any): FraudInput {
  const claimId = claim._id?.toString() || Math.random().toString(36)
  
  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30) // months
  )

  const workerAge = user.dob 
    ? Math.floor((Date.now() - new Date(user.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : 26

  const mapTriggerType = (t: string) => {
    if (t === 'severe_pollution') return 'Severe Pollution'
    if (t === 'heavy_rain') return 'Heavy Rainfall'
    if (t === 'extreme_heat') return 'Extreme Heat'
    if (t === 'flooding') return 'Flooding'
    return 'Social Disruption'
  }

  // Determine season based on month
  const month = new Date().getMonth()
  let season = 'Summer'
  if (month >= 6 && month <= 8) season = 'Monsoon'
  else if (month >= 9 && month <= 10) season = 'Post-Monsoon'
  else if (month >= 11 || month <= 1) season = 'Winter'

  return {
    worker_age: workerAge,
    worker_zone: claim.location?.zone || user.zone || 'Gurgaon',
    platform: user.platform || 'Swiggy', 
    vehicle_type: user.vehicleType || 'Bike', 
    months_active: accountAge || 12,
    avg_weekly_earnings_inr: user.avgWeeklyEarnings || 3500, 
    work_hours_daily: user.avgDailyHours || 9,
    multiplatform: user.isMultiPlatform ? 1 : 0,
    season: season,
    trigger_type: mapTriggerType(claim.triggerType),
    // Deterministic randomization for telemetry not yet in DB
    geo_risk: getPseudoRandom(claimId + 'geo', 0.1, 0.6),
    temporal_risk: getPseudoRandom(claimId + 'temp', 0.05, 0.4),
    combined_risk: getPseudoRandom(claimId + 'comb', 0.2, 0.8),
    gps_zone_match: getPseudoRandom(claimId + 'zone', 0.85, 1.0),
    gps_network_delta_m: getPseudoRandom(claimId + 'delta', 10, 150),
    accel_variance: getPseudoRandom(claimId + 'accel', 0.1, 0.9),
    mock_location_flag: getPseudoRandom(claimId + 'mock', 0, 1) > 0.95 ? 1 : 0,
    speed_anomaly: getPseudoRandom(claimId + 'speed', 0, 1) > 0.9 ? 1 : 0,
    gps_trust_score: getPseudoRandom(claimId + 'trust', 0.6, 0.98),
    claim_latitude: claim.location?.lat || 28.45,
    claim_longitude: claim.location?.lng || 77.02,
    weather_api_match: claim.weather_api_match !== undefined ? claim.weather_api_match : 1,
    rainfall_mm_hr: claim.rainfall_mm_hr || 0,
    heat_index_celsius: getPseudoRandom(claimId + 'heat', 30, 45),
    aqi: claim.aqi || 100,
    claims_this_month: getPseudoRandom(claimId + 'claims', 0, 3) | 0,
    earnings_deviation: getPseudoRandom(claimId + 'earn', 0.05, 0.35),
    peer_claim_ratio: getPseudoRandom(claimId + 'peer', 0.1, 0.7),
    platform_login_active: 1,
    order_availability: 1,
    duplicate_upi_event: getPseudoRandom(claimId + 'upi', 0, 1) > 0.98 ? 1 : 0,
    loyalty_score: user.loyaltyScore || 0.8,
    loyalty_discount: user.loyaltyScore ? user.loyaltyScore * 0.2 : 0.15,
    weekly_premium_inr: policy?.weeklyPremium || 50,
    hours_disrupted: claim.hours_disrupted || 3,
  }
}

/**
 * Build a PricingInput object from user profile and coverage request.
 */
export function buildPricingInput(user: any, tier: number = 1): PricingInput {
  return {
    age: user.age || 28,
    income_bracket: 2,
    location_risk_score: 0.35,
    avg_monthly_earnings: user.monthlyEarnings || 15000,
    earnings_volatility: 0.3,
    platform_tenure_months: 12,
    active_platforms: 2,
    weekly_hours_worked: 40,
    vehicle_age_years: 3,
    vehicle_type: 2,               // car
    prior_claims_count: 0,
    prior_claim_value_total: 0,
    weather_risk_score: 0.4,
    urban_rural_index: 1,          // urban
    peak_hour_fraction: 0.4,
    night_shift_fraction: 0.1,
    avg_trip_distance_km: 15,
    annual_mileage_km: 30_000,
    health_score: 75,
    coverage_tier: tier,
    deductible_amount: 500,
    credit_score_band: 3,
    has_safety_training: 0,
  }
}


