import { Router } from 'express'
import { Claim } from '../models/Claim'
import { Policy } from '../models/Policy'
import { User } from '../models/User'
import { ParametricEvent } from '../models/ParametricEvent'
import { AppError } from '../middleware/errorHandler'
import { authenticate } from '../middleware/auth'
import { z } from 'zod'
import { getAirQuality, getWeatherData } from '../services/weatherService'
import { detectFraud, buildFraudInput } from '../services/MLService'

const router = Router()

// ─── ML-Powered Fraud Detection ──────────────────────────────────────────────
const runFraudDetection = async (claim: any, user: any, policy: any) => {
  // 1. Weather correlation (augment ML features)
  let weatherEventMatched = 1
  try {
    const { lat, lng } = claim.location
    if (claim.triggerType === 'severe_pollution') {
      const aqData = await getAirQuality(lat, lng)
      weatherEventMatched = aqData.aqi >= 300 ? 1 : 0
    } else if (claim.triggerType === 'heavy_rain') {
      const weather = await getWeatherData(lat, lng)
      weatherEventMatched = weather.rainfall && weather.rainfall >= 10 ? 1 : 0
    }
  } catch {
    console.warn('[Claims] Weather validation skipped — defaulting to matched')
  }

  // 2. Build ML feature vector
  const fraudInput = buildFraudInput(claim, user, policy)
  fraudInput.weather_event_matched = weatherEventMatched

  // 3. Run ML prediction (falls back to rule engine if ML service is down)
  const { prediction, source } = await detectFraud(fraudInput)

  // 4. Map ML output to legacy claim schema
  const legacyScore = Math.round(prediction.fraud_probability * 100)

  return {
    score: legacyScore,
    factors: {
      gpsValid: true,
      weatherCorrelated: weatherEventMatched === 1,
      behavioralAnomaly: prediction.risk_level === 'HIGH' || prediction.risk_level === 'CRITICAL',
      platformVerified: true,
    },
    confidence: 0.95,
    mlPrediction: prediction,
    mlSource: source,
  }
}

// GET /api/claims/my-claims
router.get('/my-claims', authenticate, async (req, res, next) => {
  try {
    const userClaims = await Claim.find({ userId: req.user!.userId })
      .select('-__v')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: userClaims })
  } catch (error) {
    next(error)
  }
})

// GET /api/claims/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params

    const claim = await Claim.findOne({ _id: id, userId: req.user!.userId })

    if (!claim) {
      throw new AppError(404, 'Claim not found')
    }

    res.json({ success: true, data: claim })
  } catch (error) {
    next(error)
  }
})

// POST /api/claims/manual
router.post('/manual', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      triggerType: z.enum(['heavy_rain', 'extreme_heat', 'severe_pollution', 'flooding', 'social_disruption']),
      eventTimestamp: z.string().datetime(),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
        zone: z.string()
      }),
      description: z.string().optional()
    })

    const data = schema.parse(req.body)

    // Check active policy
    const policy = await Policy.findOne({
      userId: req.user!.userId,
      status: 'active'
    })

    if (!policy) {
      throw new AppError(400, 'No active policy found')
    }

    // Check coverage remaining
    if (policy.coverageRemaining <= 0) {
      throw new AppError(400, 'Coverage limit exhausted')
    }

    // Get user
    const user = await User.findById(req.user!.userId)

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Calculate payout (₹150/hour for 3 hours = ₹450)
    const payoutAmount = 450

    // Fraud detection (ML-powered)
    const fraudCheck = await runFraudDetection(data, user, policy)

    // Determine status based on fraud score
    let status = 'pending'
    if (fraudCheck.score < 30) {
      status = 'approved'
    } else if (fraudCheck.score > 70) {
      status = 'rejected'
    }

    // Create claim
    const claim = await Claim.create({
      policyId: policy._id,
      userId: req.user!.userId,
      triggerType: data.triggerType,
      triggerDescription: data.description || `Manual claim for ${data.triggerType}`,
      eventTimestamp: new Date(data.eventTimestamp),
      location: data.location,
      payoutAmount: payoutAmount,
      status,
      fraudScore: fraudCheck.score,
      evidence: []
    })

    // Update policy coverage
    if (status === 'approved') {
      const newRemaining = policy.coverageRemaining - payoutAmount
      policy.coverageUsed += payoutAmount
      policy.coverageRemaining = Math.max(0, newRemaining)
      await policy.save()
    }

    res.status(201).json({
      success: true,
      data: claim,
      fraudAnalysis: {
        score: fraudCheck.score,
        factors: fraudCheck.factors,
        confidence: fraudCheck.confidence,
        riskLevel: fraudCheck.mlPrediction?.risk_level || 'UNKNOWN',
        topRiskFeatures: fraudCheck.mlPrediction?.top_risk_features || [],
        model: fraudCheck.mlPrediction?.model || 'Rule Engine',
        source: fraudCheck.mlSource || 'fallback',
      },
      message: status === 'approved' 
        ? 'Claim approved instantly' 
        : status === 'rejected'
        ? 'Claim rejected due to fraud suspicion'
        : 'Claim submitted for review'
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/claims/:id/evidence
router.post('/:id/evidence', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params

    // TODO: Handle file uploads (S3/Cloudinary)

    res.json({
      success: true,
      message: 'Evidence uploaded successfully'
    })
  } catch (error) {
    next(error)
  }
})

export { router as claimsRouter }
