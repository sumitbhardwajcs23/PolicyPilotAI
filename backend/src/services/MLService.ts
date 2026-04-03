/**
 * MLService.ts
 *
 * TypeScript client for communicating with the Python ML microservice.
 * Provides typed request/response interfaces for:
 *   - Premium Pricing Model (XGBoost, 23 features)
 *   - Fraud Detection Model (RF + Neural Network ensemble, 31 features)
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001'
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
  trigger_type: number
  weather_api_threshold_crossed: number
  rainfall_mm_on_day: number
  temperature_celsius: number
  aqi_reading_trigger_day: number
  event_duration_hours: number
  multiple_workers_same_event: number
  gps_in_affected_zone: number
  location_matches_home_zone: number
  distance_from_trigger_km: number
  platform_order_drop_pct: number
  platform_activity_at_time: number
  zone_order_volume_drop: number
  account_age_days: number
  kyc_complete: number
  biometric_verified: number
  prior_claims_count_90d: number
  prior_fraud_flags: number
  platform_rating: number
  tenure_weeks: number
  claim_filed_within_hours: number
  claim_amount_vs_weekly_avg: number
  upi_id_changed_7d: number
  multiple_upi_ids: number
  device_changes_7d: number
  login_anomaly_score: number
  support_escalation_count_7d: number
  claim_description_similarity: number
  ip_match_home_city: number
  battery_level_at_claim: number
  app_version_current: number
  vpn_proxy_active: number
  jailbroken_rooted_device: number
  concurrent_logins: number
  weekend_claim_flag: number
  threshold?: number
}

export interface FraudPrediction {
  is_fraud: boolean
  fraud_probability: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  rf_probability: number
  nn_probability: number
  payout_decision?: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'REJECTED'
  payout_eta?: string | null
  top_risk_features: string[]
  threshold_used: number
  model: string
  feature_count: number
  api_verified?: boolean
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
export async function getModelInfo(): Promise<ModelInfo> {
  return callML<ModelInfo>('/models/info')
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
    const result = await callML<{ success: boolean; prediction: FraudPrediction }>('/predict/fraud', input)
    return { prediction: result.prediction, source: 'ml' }
  } catch (err) {
    console.warn('[MLService] Fraud detection failed, using fallback score:', err)
    // Graceful degradation — rule-based fallback
    let score = 0
    if (!input.weather_api_threshold_crossed) score += 40
    if (input.vpn_proxy_active) score += 20
    if (input.multiple_upi_ids) score += 20
    if (input.prior_claims_count_90d > 3) score += 15
    score += Math.floor(Math.random() * 5)
    const prob = Math.min(score / 100, 0.99)
    return {
      prediction: {
        is_fraud: prob >= 0.5,
        fraud_probability: parseFloat(prob.toFixed(4)),
        risk_level: prob < 0.25 ? 'LOW' : prob < 0.5 ? 'MEDIUM' : prob < 0.75 ? 'HIGH' : 'CRITICAL',
        rf_probability: prob,
        nn_probability: prob,
        payout_decision: prob < 0.3 ? 'AUTO_APPROVE' : prob < 0.7 ? 'MANUAL_REVIEW' : 'REJECTED',
        top_risk_features: [],
        threshold_used: 0.5,
        model: 'Fallback Rule Engine',
        feature_count: 5,
        api_verified: input.weather_api_threshold_crossed === 1
      },
      source: 'fallback',
    }
  }
}

/**
 * Build a FraudInput object from a claim submission and user profile.
 * Maps existing claim/user fields to the 35 ML feature inputs for GigShield.
 */
export function buildFraudInput(claim: any, user: any, policy: any): FraudInput {
  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
  )
  const isWeekend = [0, 6].includes(new Date(claim.eventTimestamp).getDay()) ? 1 : 0

  return {
    trigger_type: mapTriggerType(claim.triggerType),
    weather_api_threshold_crossed: 1, // Mock API verification
    rainfall_mm_on_day: 45.0,
    temperature_celsius: 28.0,
    aqi_reading_trigger_day: 120.0,
    event_duration_hours: 4.5,
    multiple_workers_same_event: 0.2, // Low cluster density by default
    gps_in_affected_zone: 1,
    location_matches_home_zone: 1,
    distance_from_trigger_km: 1.5,
    platform_order_drop_pct: 0.4,
    platform_activity_at_time: 0,
    zone_order_volume_drop: 0.5,
    account_age_days: accountAge || 120,
    kyc_complete: user.kycVerified ? 1 : 0,
    biometric_verified: user.biometricVerified ? 1 : 0,
    prior_claims_count_90d: 0,
    prior_fraud_flags: 0,
    platform_rating: user.platformRating || 4.2,
    tenure_weeks: Math.floor(accountAge / 7) || 20,
    claim_filed_within_hours: 2.0,
    claim_amount_vs_weekly_avg: 1.2,
    upi_id_changed_7d: 0,
    multiple_upi_ids: 0,
    device_changes_7d: 0,
    login_anomaly_score: 0.05,
    support_escalation_count_7d: 0,
    claim_description_similarity: 0.1,
    ip_match_home_city: 1,
    battery_level_at_claim: 45,
    app_version_current: 1,
    vpn_proxy_active: 0,
    jailbroken_rooted_device: 0,
    concurrent_logins: 1,
    weekend_claim_flag: isWeekend,
    threshold: 0.5,
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

function mapTriggerType(trigger: string): number {
  const map: Record<string, number> = {
    severe_pollution: 0,    // medical
    heavy_rain: 3,          // weather
    extreme_heat: 3,        // weather
    flooding: 3,            // weather
    social_disruption: 4,   // other
  }
  return map[trigger] ?? 4
}
