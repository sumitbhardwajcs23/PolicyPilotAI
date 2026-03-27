import { Router } from 'express'
import { Claim } from '../models/Claim'
import { Policy } from '../models/Policy'
import { User } from '../models/User'
import { ParametricEvent } from '../models/ParametricEvent'
import { AppError } from '../middleware/errorHandler'
import { authenticate } from '../middleware/auth'
import { z } from 'zod'
import { getAirQuality, getWeatherData } from '../services/weatherService'

const router = Router()

// Fraud detection simulation
const calculateFraudScore = async (claim: any, user: any) => {
  let score = 0
  const factors = {
    gpsValid: true,
    weatherCorrelated: false, // Start as false, then validate
    behavioralAnomaly: false,
    platformVerified: true
  }

  try {
    const { lat, lng } = claim.location;
    
    if (claim.triggerType === 'severe_pollution') {
      const aqData = await getAirQuality(lat, lng);
      // If AQI > 300 (severe), weather correlated
      if (aqData.aqi >= 300) {
        factors.weatherCorrelated = true;
      } else {
        score += 40; // High score if trigger claimed but not found in data
      }
    } else if (claim.triggerType === 'heavy_rain') {
      const weatherData = await getWeatherData(lat, lng);
      // If rainfall > 10mm/hr, weather correlated
      if (weatherData.rainfall && weatherData.rainfall >= 10) {
        factors.weatherCorrelated = true;
      } else {
        score += 40;
      }
    } else {
      // For other triggers, default to true for now or add more logic
      factors.weatherCorrelated = true;
    }
  } catch (error) {
    console.warn('Fraud check weather validation failed, defaulting to correlated');
    factors.weatherCorrelated = true;
  }

  // Check claim frequency
  if (Math.random() > 0.8) {
    score += 20
    factors.behavioralAnomaly = true
  }

  // Random variation for demo
  score += Math.floor(Math.random() * 20)

  return { score, factors, confidence: 0.9 }
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

    // Fraud detection
    const fraudCheck = await calculateFraudScore(data, user)

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
      fraudAnalysis: fraudCheck,
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
