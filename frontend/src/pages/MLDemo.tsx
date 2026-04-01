import { useState, useEffect } from 'react'
import { mlDemoApi } from '@/services/api'
import {
  Brain, Zap, Shield, CheckCircle2,
  AlertTriangle, XCircle, Loader2,
  ArrowLeft, RotateCcw, IndianRupee, Clock,
  Activity, Cpu, Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface PricingResult {
  weekly_premium: number
  monthly_estimate: number
  annual_estimate: number
  tier_label: 'Basic' | 'Standard' | 'Premium'
  confidence_band_low: number
  confidence_band_high: number
  model: string
  feature_count: number
  coverage_note: string
}

interface FraudResult {
  is_fraud: boolean
  fraud_probability: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  rf_probability: number
  nn_probability: number
  payout_decision: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'REJECTED'
  payout_eta: string | null
  top_risk_features: string[]
  threshold_used: number
  model: string
  feature_count: number
  api_verified: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const riskCfg = {
  LOW:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-500', Icon: CheckCircle2 },
  MEDIUM:   { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   bar: 'bg-amber-500',   Icon: AlertTriangle },
  HIGH:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  bar: 'bg-orange-500',  Icon: AlertTriangle },
  CRITICAL: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     bar: 'bg-red-500',     Icon: XCircle },
}

const payoutCfg = {
  AUTO_APPROVE:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30', label: '✅ Auto-Approve — Instant UPI Payout' },
  MANUAL_REVIEW: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-400/30',   label: '📋 Manual Review Required' },
  REJECTED:      { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-400/30',     label: '🚫 Claim Rejected — Fraud Detected' },
}

const tierCfg = {
  Basic:    { weekly: '₹29', icon: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Standard: { weekly: '₹59', icon: '🔵', color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  Premium:  { weekly: '₹99', icon: '🟣', color: 'text-violet-400',  bg: 'bg-violet-500/10' },
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [d, setD] = useState(0)
  useEffect(() => {
    let v = 0; const step = value / 35
    const t = setInterval(() => { v += step; if (v >= value) { setD(value); clearInterval(t) } else setD(v) }, 18)
    return () => clearInterval(t)
  }, [value])
  return <span>{d.toFixed(decimals)}</span>
}

function Slider({ label, value, min, max, step = 1, unit = '', prefix = '', onChange, color = 'violet' }: {
  label: string; value: number; min: number; max: number; step?: number
  unit?: string; prefix?: string; onChange: (v: number) => void; color?: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/50">{label}</span>
        <span className={`text-${color}-400 font-semibold tabular-nums`}>{prefix}{typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-${color}-500`} />
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1">
      <div onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-violet-600' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </div>
      <span className="text-xs text-white/60">{label}</span>
    </label>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

export function MLDemo() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'pricing' | 'fraud'>('pricing')
  const [mlStatus, setMlStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // ── Pricing state ────────────────────────────────────────────────────────
  const [P, setP] = useState({
    age: 26,
    platform_code: 0,
    city_tier: 1,
    avg_weekly_earnings: 3500,
    earnings_cv_4weeks: 0.22,
    active_days_per_week: 6,
    daily_active_hours: 9,
    avg_orders_per_day: 25,
    avg_delivery_distance_km: 4.5,
    vehicle_type: 1,
    tenure_months_platform: 12,
    zone_risk_score: 0.3,
    rain_disruption_days_30d: 3,
    heat_disruption_days_30d: 2,
    aqi_avg_30d: 150,
    flood_risk_zone: 0,
    curfew_zone_risk: 0.05,
    coverage_tier: 1,
    income_multiplier: 1.0,
    prior_claims_count: 0,
    has_alternate_income: 0,
    kyc_verified: 1,
  })
  const [pResult, setPResult] = useState<PricingResult | null>(null)
  const [pLoading, setPLoading] = useState(false)

  // ── Fraud state ──────────────────────────────────────────────────────────
  const [F, setF] = useState({
    trigger_type: 0,
    weather_api_threshold_crossed: 1,
    rainfall_mm_on_day: 80,
    temperature_celsius: 38,
    aqi_reading_trigger_day: 250,
    event_duration_hours: 5,
    multiple_workers_same_event: 0.7,
    gps_in_affected_zone: 1,
    location_matches_home_zone: 1,
    distance_from_trigger_km: 0.5,
    platform_order_drop_pct: 0.6,
    platform_activity_at_time: 0,
    zone_order_volume_drop: 0.7,
    account_age_days: 180,
    kyc_complete: 1,
    biometric_verified: 1,
    prior_claims_count_90d: 0,
    prior_fraud_flags: 0,
    platform_rating: 4.2,
    tenure_weeks: 50,
    claim_filed_within_hours: 0.5,
    claim_amount_vs_weekly_avg: 0.8,
    upi_id_changed_7d: 0,
    multiple_upi_ids: 0,
    device_changes_7d: 0,
    login_anomaly_score: 0.05,
    support_escalation_count_7d: 0,
    claim_description_similarity: 0.05,
    threshold: 0.5,
  })
  const [fResult, setFResult] = useState<FraudResult | null>(null)
  const [fLoading, setFLoading] = useState(false)

  useEffect(() => {
    mlDemoApi.health().then(() => setMlStatus('online')).catch(() => setMlStatus('offline'))
  }, [])

  const runPricing = async () => {
    setPLoading(true); setPResult(null)
    try {
      const res = await mlDemoApi.predictPremium(P as Record<string, number>)
      if (res.success) setPResult(res.prediction)
    } finally { setPLoading(false) }
  }

  const runFraud = async () => {
    setFLoading(true); setFResult(null)
    try {
      const res = await mlDemoApi.predictFraud(F as Record<string, number>)
      if (res.success) setFResult(res.prediction)
    } finally { setFLoading(false) }
  }

  const fraudPresets = {
    genuine: { weather_api_threshold_crossed: 1, rainfall_mm_on_day: 90, gps_in_affected_zone: 1, location_matches_home_zone: 1, platform_order_drop_pct: 0.65, multiple_workers_same_event: 0.75, kyc_complete: 1, biometric_verified: 1, prior_fraud_flags: 0, claim_filed_within_hours: 1, login_anomaly_score: 0.03, upi_id_changed_7d: 0, claim_description_similarity: 0.04, prior_claims_count_90d: 0, account_age_days: 300, platform_rating: 4.5 },
    suspicious: { weather_api_threshold_crossed: 0, rainfall_mm_on_day: 12, gps_in_affected_zone: 0, location_matches_home_zone: 0, platform_order_drop_pct: 0.05, multiple_workers_same_event: 0.02, kyc_complete: 1, biometric_verified: 0, prior_fraud_flags: 0, claim_filed_within_hours: 48, login_anomaly_score: 0.5, upi_id_changed_7d: 1, claim_description_similarity: 0.6, prior_claims_count_90d: 2, account_age_days: 40, platform_rating: 2.8 },
    fraud: { weather_api_threshold_crossed: 0, rainfall_mm_on_day: 5, gps_in_affected_zone: 0, location_matches_home_zone: 0, platform_order_drop_pct: 0.0, multiple_workers_same_event: 0.01, kyc_complete: 0, biometric_verified: 0, prior_fraud_flags: 1, claim_filed_within_hours: 70, login_anomaly_score: 0.9, upi_id_changed_7d: 1, multiple_upi_ids: 1, claim_description_similarity: 0.92, prior_claims_count_90d: 6, account_age_days: 12, platform_rating: 1.2, device_changes_7d: 7 },
  }

  const setPreset = (p: keyof typeof fraudPresets) => {
    setF(prev => ({ ...prev, ...fraudPresets[p] }))
    setFResult(null)
  }

  const triggerLabels = ['🌧 Heavy Rain', '🌡 Extreme Heat', '💨 High AQI', '🚧 Zone Closure', '🌊 Flooding']
  const platformLabels = ['Zomato', 'Swiggy', 'Both']
  const cityLabels = ['Metro (Delhi/Mumbai/Bengaluru)', 'Tier-2 (Pune/Jaipur/Lucknow)', 'Tier-3 City']

  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-white/8 bg-[#07090f]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/8 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/50" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">PolicyPilotAI — AI Playground</p>
                <p className="text-[10px] text-white/35 mt-0.5">Gig Worker Income Protection • v2.0</p>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            mlStatus === 'online' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
            mlStatus === 'offline' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
            'bg-white/5 border-white/10 text-white/40'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${mlStatus === 'online' ? 'bg-emerald-400 animate-pulse' : mlStatus === 'offline' ? 'bg-red-400' : 'bg-white/30 animate-pulse'}`} />
            {mlStatus === 'online' ? 'ML Online' : mlStatus === 'offline' ? 'ML Offline' : 'Checking…'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-4">
            <Users className="w-3.5 h-3.5" />7.7M Gig Workers · Income Protection
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 via-rose-400 to-violet-400 bg-clip-text text-transparent mb-3">
            Gig Worker ML Playground
          </h1>
          <p className="text-white/45 text-base max-w-xl mx-auto">
            Weekly micro-insurance from <span className="text-emerald-400 font-bold">₹29/week</span>. Zero-touch claims with <span className="text-cyan-400 font-bold">instant UPI payouts</span>.
            Real AI inference — no login required.
          </p>
        </div>

        {/* ── Stat pills ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Weekly Premium', value: '₹29–₹99', Icon: IndianRupee, color: 'emerald' },
            { label: 'UPI Payout ETA', value: '< 2 min', Icon: Clock, color: 'cyan' },
            { label: 'Fraud Accuracy', value: '95%+', Icon: Shield, color: 'violet' },
            { label: 'Platform APIs', value: 'Real-time', Icon: Activity, color: 'amber' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
              <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/15 flex items-center justify-center flex-shrink-0`}>
                <s.Icon className={`w-4 h-4 text-${s.color}-400`} />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-none">{s.value}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'pricing', label: 'Weekly Premium Calculator', Icon: IndianRupee, activeClass: 'bg-orange-600 shadow-orange-500/20' },
            { id: 'fraud',   label: 'Parametric Claim Verifier', Icon: Shield,      activeClass: 'bg-violet-600 shadow-violet-500/20' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                tab === t.id ? `${t.activeClass} text-white` : 'bg-white/5 text-white/45 hover:bg-white/8 hover:text-white/70'}`}>
              <t.Icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════ PRICING TAB ══════════════════════════════ */}
        {tab === 'pricing' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Input — 3 cols */}
            <div className="lg:col-span-3 bg-white/4 border border-white/8 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">XGBoost Pricing Model</h3>
                  <p className="text-[11px] text-white/35">22 features · 60k gig worker records · ₹29–₹99/week</p>
                </div>
              </div>

              {/* Selects row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] text-white/40 mb-1.5">Platform</p>
                  <select value={P.platform_code} onChange={e => setP(v => ({ ...v, platform_code: +e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    {platformLabels.map((l, i) => <option key={i} value={i}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] text-white/40 mb-1.5">City Tier</p>
                  <select value={P.city_tier} onChange={e => setP(v => ({ ...v, city_tier: +e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    {cityLabels.map((l, i) => <option key={i} value={i + 1}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] text-white/40 mb-1.5">Vehicle</p>
                  <select value={P.vehicle_type} onChange={e => setP(v => ({ ...v, vehicle_type: +e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    <option value={0}>🚲 Cycle</option>
                    <option value={1}>🏍 Bike</option>
                    <option value={2}>⚡ E-Bike</option>
                  </select>
                </div>
              </div>

              {/* Coverage tier prominent tiles */}
              <div>
                <p className="text-[11px] text-white/40 mb-2">Coverage Tier</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Basic', 'Standard', 'Premium'] as const).map((tier, i) => (
                    <button key={tier} onClick={() => setP(v => ({ ...v, coverage_tier: i }))}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        P.coverage_tier === i
                          ? `${tierCfg[tier].bg} ${tierCfg[tier].color} border-current`
                          : 'bg-white/4 text-white/40 border-white/8 hover:bg-white/8'}`}>
                      {tierCfg[tier].icon} {tier}<br />
                      <span className="text-[10px] font-normal opacity-70">{tierCfg[tier].weekly}/wk</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: 2-column grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Slider label="Age" value={P.age} min={18} max={45} onChange={v => setP(p => ({ ...p, age: v }))} color="orange" unit=" yrs" />
                <Slider label="Avg Weekly Earnings" value={P.avg_weekly_earnings} min={1500} max={8000} step={100} prefix="₹" onChange={v => setP(p => ({ ...p, avg_weekly_earnings: v }))} color="orange" />
                <Slider label="Active Days/Week" value={P.active_days_per_week} min={3} max={7} onChange={v => setP(p => ({ ...p, active_days_per_week: v }))} color="orange" unit=" days" />
                <Slider label="Daily Hours" value={P.daily_active_hours} min={4} max={14} onChange={v => setP(p => ({ ...p, daily_active_hours: v }))} color="orange" unit="h" />
                <Slider label="Orders/Day" value={P.avg_orders_per_day} min={5} max={60} onChange={v => setP(p => ({ ...p, avg_orders_per_day: v }))} color="orange" />
                <Slider label="Tenure on Platform" value={P.tenure_months_platform} min={1} max={60} onChange={v => setP(p => ({ ...p, tenure_months_platform: v }))} color="orange" unit=" mo" />
              </div>

              {/* Environmental risk sliders */}
              <div className="bg-white/3 rounded-xl p-4 space-y-4">
                <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">Environmental Risk Factors</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Slider label="🌧 Rain Days (30d)" value={P.rain_disruption_days_30d} min={0} max={20} onChange={v => setP(p => ({ ...p, rain_disruption_days_30d: v }))} color="cyan" unit="d" />
                  <Slider label="🌡 Heat Days (30d)" value={P.heat_disruption_days_30d} min={0} max={15} onChange={v => setP(p => ({ ...p, heat_disruption_days_30d: v }))} color="amber" unit="d" />
                  <Slider label="💨 Avg AQI (30d)" value={P.aqi_avg_30d} min={30} max={400} step={10} onChange={v => setP(p => ({ ...p, aqi_avg_30d: v }))} color="rose" />
                  <Slider label="Zone Risk Score" value={P.zone_risk_score} min={0} max={1} step={0.05} onChange={v => setP(p => ({ ...p, zone_risk_score: v }))} color="orange" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <Toggle label="KYC Verified (Aadhaar+PAN)" value={!!P.kyc_verified} onChange={v => setP(p => ({ ...p, kyc_verified: v ? 1 : 0 }))} />
                <Toggle label="Has Alternate Income" value={!!P.has_alternate_income} onChange={v => setP(p => ({ ...p, has_alternate_income: v ? 1 : 0 }))} />
              </div>

              <button onClick={runPricing} disabled={pLoading || mlStatus !== 'online'}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 disabled:opacity-40 font-bold text-sm transition-all shadow-lg">
                {pLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {pLoading ? 'Running XGBoost…' : 'Calculate Weekly Premium'}
              </button>
            </div>

            {/* Result — 2 cols */}
            <div className="lg:col-span-2 bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col">
              <h3 className="font-bold text-white mb-5">Prediction Result</h3>

              {!pResult && !pLoading && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500/8 border border-orange-500/15 flex items-center justify-center mb-4">
                    <IndianRupee className="w-7 h-7 text-orange-400/40" />
                  </div>
                  <p className="text-white/25 text-sm">Set worker profile and<br />click Calculate</p>
                </div>
              )}

              {pLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin" />
                    <Brain className="absolute inset-0 m-auto w-7 h-7 text-orange-400" />
                  </div>
                  <p className="text-white/35 text-sm">XGBoost Gradient Boosting…</p>
                </div>
              )}

              {pResult && (() => {
                const tc = tierCfg[pResult.tier_label]
                return (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Weekly premium hero */}
                    <div className="bg-gradient-to-br from-orange-600/20 to-rose-600/20 border border-orange-500/20 rounded-2xl p-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3 ${tc.bg} ${tc.color}`}>
                        {tc.icon} {pResult.tier_label} Plan
                      </div>
                      <p className="text-5xl font-black text-white">
                        ₹<AnimatedNumber value={pResult.weekly_premium} decimals={0} />
                      </p>
                      <p className="text-orange-300/70 text-sm mt-1">per week</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 rounded-lg py-2">
                          <p className="text-white/40">Monthly</p>
                          <p className="text-white font-bold">₹{pResult.monthly_estimate}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg py-2">
                          <p className="text-white/40">Annual</p>
                          <p className="text-white font-bold">₹{pResult.annual_estimate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="bg-white/4 rounded-xl p-4">
                      <p className="text-[11px] text-white/35 mb-2">Confidence Band (±6%)</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-white/50">₹{pResult.confidence_band_low}</span>
                        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full w-full" />
                        </div>
                        <span className="text-white/50">₹{pResult.confidence_band_high}</span>
                      </div>
                    </div>

                    {/* Coverage note */}
                    <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3">
                      <p className="text-[11px] text-cyan-400/80">📋 {pResult.coverage_note}</p>
                    </div>

                    {/* Model metadata */}
                    <div className="grid grid-cols-2 gap-2">
                      {[['Algorithm', 'XGBoost v2'], ['Features', `${pResult.feature_count} inputs`], ['Training', '60,000 records'], ['Target Workers', 'Zomato/Swiggy']].map(([k, v]) => (
                        <div key={k} className="bg-white/4 rounded-lg p-2.5">
                          <p className="text-[10px] text-white/25 uppercase tracking-wide">{k}</p>
                          <p className="text-xs text-white font-medium mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setPResult(null)} className="flex items-center justify-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors">
                      <RotateCcw className="w-3 h-3" />Reset
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ══════════════════════ FRAUD TAB ════════════════════════════════ */}
        {tab === 'fraud' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Input — 3 cols */}
            <div className="lg:col-span-3 bg-white/4 border border-white/8 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Parametric Claim Verifier</h3>
                  <p className="text-[11px] text-white/35">RF(60%) + NN(40%) ensemble · 28 signals · Zero-touch UPI</p>
                </div>
              </div>

              {/* Scenario presets */}
              <div>
                <p className="text-[11px] text-white/40 mb-2">Quick Scenario</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'genuine',    label: '✅ Genuine Claim',   col: 'emerald' },
                    { id: 'suspicious', label: '⚠️ Suspicious',      col: 'amber' },
                    { id: 'fraud',      label: '🚨 Fraud Attempt',   col: 'red' },
                  ].map(s => (
                    <button key={s.id} onClick={() => setPreset(s.id as keyof typeof fraudPresets)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all bg-${s.col}-500/10 border-${s.col}-500/25 text-${s.col}-400 hover:bg-${s.col}-500/15`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger type */}
              <div>
                <p className="text-[11px] text-white/40 mb-2">Trigger Event Type</p>
                <div className="flex flex-wrap gap-2">
                  {triggerLabels.map((l, i) => (
                    <button key={i} onClick={() => setF(v => ({ ...v, trigger_type: i }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        F.trigger_type === i ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/4 border-white/8 text-white/40 hover:bg-white/8'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* API & environmental readings */}
              <div className="bg-white/3 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">External API Readings</p>
                  <Toggle label="API Threshold Crossed" value={!!F.weather_api_threshold_crossed} onChange={v => setF(p => ({ ...p, weather_api_threshold_crossed: v ? 1 : 0 }))} />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Slider label="🌧 Rainfall (mm)" value={F.rainfall_mm_on_day} min={0} max={200} step={5} onChange={v => setF(p => ({ ...p, rainfall_mm_on_day: v }))} color="cyan" unit="mm" />
                  <Slider label="🌡 Temperature (°C)" value={F.temperature_celsius} min={15} max={50} onChange={v => setF(p => ({ ...p, temperature_celsius: v }))} color="orange" unit="°C" />
                  <Slider label="💨 AQI Reading" value={F.aqi_reading_trigger_day} min={0} max={500} step={10} onChange={v => setF(p => ({ ...p, aqi_reading_trigger_day: v }))} color="rose" />
                  <Slider label="Event Duration" value={F.event_duration_hours} min={0} max={24} step={0.5} onChange={v => setF(p => ({ ...p, event_duration_hours: v }))} color="violet" unit="h" />
                </div>
              </div>

              {/* Platform & GPS signals */}
              <div className="bg-white/3 rounded-xl p-4 space-y-4">
                <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">Platform & GPS Signals</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Slider label="Order Drop in Zone (%)" value={F.platform_order_drop_pct} min={0} max={1} step={0.05} onChange={v => setF(p => ({ ...p, platform_order_drop_pct: v }))} color="violet" unit="%" />
                  <Slider label="Zone Volume Drop" value={F.zone_order_volume_drop} min={0} max={1} step={0.05} onChange={v => setF(p => ({ ...p, zone_order_volume_drop: v }))} color="violet" />
                  <Slider label="Distance from Trigger (km)" value={F.distance_from_trigger_km} min={0} max={50} step={0.5} onChange={v => setF(p => ({ ...p, distance_from_trigger_km: v }))} color="cyan" unit="km" />
                  <Slider label="% Cluster Claims" value={F.multiple_workers_same_event} min={0} max={1} step={0.05} onChange={v => setF(p => ({ ...p, multiple_workers_same_event: v }))} color="emerald" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Toggle label="GPS in Affected Zone" value={!!F.gps_in_affected_zone} onChange={v => setF(p => ({ ...p, gps_in_affected_zone: v ? 1 : 0 }))} />
                  <Toggle label="Location = Home Zone" value={!!F.location_matches_home_zone} onChange={v => setF(p => ({ ...p, location_matches_home_zone: v ? 1 : 0 }))} />
                  <Toggle label="Worker App Active" value={!!F.platform_activity_at_time} onChange={v => setF(p => ({ ...p, platform_activity_at_time: v ? 1 : 0 }))} />
                  <Toggle label="KYC Complete" value={!!F.kyc_complete} onChange={v => setF(p => ({ ...p, kyc_complete: v ? 1 : 0 }))} />
                  <Toggle label="Biometric Verified" value={!!F.biometric_verified} onChange={v => setF(p => ({ ...p, biometric_verified: v ? 1 : 0 }))} />
                  <Toggle label="UPI Changed (7d)" value={!!F.upi_id_changed_7d} onChange={v => setF(p => ({ ...p, upi_id_changed_7d: v ? 1 : 0 }))} />
                  <Toggle label="Prior Fraud Flag" value={!!F.prior_fraud_flags} onChange={v => setF(p => ({ ...p, prior_fraud_flags: v ? 1 : 0 }))} />
                  <Toggle label="Multiple UPI IDs" value={!!F.multiple_upi_ids} onChange={v => setF(p => ({ ...p, multiple_upi_ids: v ? 1 : 0 }))} />
                </div>
              </div>

              {/* Worker profile sliders */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Slider label="Platform Rating" value={F.platform_rating} min={1} max={5} step={0.1} onChange={v => setF(p => ({ ...p, platform_rating: v }))} color="amber" />
                <Slider label="Account Age" value={F.account_age_days} min={0} max={730} step={10} onChange={v => setF(p => ({ ...p, account_age_days: v }))} color="violet" unit="d" />
                <Slider label="Claims in 90d" value={F.prior_claims_count_90d} min={0} max={10} onChange={v => setF(p => ({ ...p, prior_claims_count_90d: v }))} color="rose" />
                <Slider label="Login Anomaly" value={F.login_anomaly_score} min={0} max={1} step={0.01} onChange={v => setF(p => ({ ...p, login_anomaly_score: v }))} color="rose" />
                <Slider label="Claim ÷ Weekly Avg" value={F.claim_amount_vs_weekly_avg} min={0} max={3} step={0.1} onChange={v => setF(p => ({ ...p, claim_amount_vs_weekly_avg: v }))} color="amber" />
                <Slider label="Desc. Similarity" value={F.claim_description_similarity} min={0} max={1} step={0.01} onChange={v => setF(p => ({ ...p, claim_description_similarity: v }))} color="rose" />
              </div>

              <button onClick={runFraud} disabled={fLoading || mlStatus !== 'online'}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 font-bold text-sm transition-all shadow-lg">
                {fLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {fLoading ? 'Verifying Claim…' : 'Verify Parametric Claim'}
              </button>
            </div>

            {/* Result — 2 cols */}
            <div className="lg:col-span-2 bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col">
              <h3 className="font-bold text-white mb-5">Verification Result</h3>

              {!fResult && !fLoading && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-violet-500/8 border border-violet-500/15 flex items-center justify-center mb-4">
                    <Shield className="w-7 h-7 text-violet-400/40" />
                  </div>
                  <p className="text-white/25 text-sm">Choose a scenario preset or<br />adjust signals, then verify</p>
                </div>
              )}

              {fLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
                    <Brain className="absolute inset-0 m-auto w-7 h-7 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/35 text-sm">RF + Neural Network ensemble</p>
                    <p className="text-white/20 text-xs">Cross-referencing weather APIs…</p>
                  </div>
                </div>
              )}

              {fResult && (() => {
                const rc = riskCfg[fResult.risk_level]
                const pc = payoutCfg[fResult.payout_decision]
                const pct = Math.round(fResult.fraud_probability * 100)
                return (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Fraud probability */}
                    <div className={`${rc.bg} border ${rc.border} rounded-2xl p-5 text-center`}>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-2 ${rc.bg} ${rc.color} border ${rc.border}`}>
                        <rc.Icon className="w-3.5 h-3.5" />{fResult.risk_level} RISK
                      </div>
                      <p className={`text-5xl font-black ${rc.color}`}>
                        <AnimatedNumber value={pct} />%
                      </p>
                      <p className="text-white/35 text-xs mt-1">fraud probability</p>
                    </div>

                    {/* Payout decision — most important */}
                    <div className={`${pc.bg} border ${pc.border} rounded-xl p-4 text-center`}>
                      <p className={`text-base font-bold ${pc.color}`}>{pc.label}</p>
                      {fResult.payout_eta && (
                        <p className="text-white/40 text-xs mt-1">⏱ Payout ETA: <span className="text-white/60 font-semibold">{fResult.payout_eta}</span></p>
                      )}
                    </div>

                    {/* API verified badge */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                      fResult.api_verified ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/8 border border-red-500/20 text-red-400'}`}>
                      {fResult.api_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      Weather API {fResult.api_verified ? 'Threshold Confirmed' : 'NOT Verified — trigger disputed'}
                    </div>

                    {/* RF vs NN bars */}
                    <div className="bg-white/4 rounded-xl p-4">
                      <p className="text-[11px] text-white/35 mb-3">Ensemble Sub-models</p>
                      {[
                        { label: 'Random Forest (60%)', val: fResult.rf_probability },
                        { label: 'Neural Network (40%)', val: fResult.nn_probability },
                      ].map(s => (
                        <div key={s.label} className="mb-2">
                          <div className="flex justify-between text-[11px] text-white/40 mb-1">
                            <span>{s.label}</span>
                            <span className={rc.color}>{(s.val * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className={`h-full ${rc.bar} rounded-full transition-all duration-700`} style={{ width: `${s.val * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Top risk features */}
                    {fResult.top_risk_features?.length > 0 && (
                      <div className="bg-white/4 rounded-xl p-4">
                        <p className="text-[11px] text-white/35 mb-2">Top Risk Signals (RF Feature Importance)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {fResult.top_risk_features.map(f => (
                            <span key={f} className={`px-2 py-0.5 rounded text-[10px] font-mono ${rc.bg} ${rc.color} border ${rc.border}`}>
                              {f.replaceAll('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => setFResult(null)} className="flex items-center justify-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors">
                      <RotateCcw className="w-3 h-3" />Reset
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-white/15 mt-10">
          Real inference via Python/FastAPI microservice · XGBoost + RF/NN ensemble · India gig economy focus ·{' '}
          <a href="https://policypilotai-2.onrender.com/docs" target="_blank" rel="noreferrer" className="text-violet-400/50 hover:text-violet-400 underline">Swagger →</a>
        </p>
      </div>
    </div>
  )
}
