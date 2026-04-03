import { Router } from 'express'
import { Policy } from '../models/Policy'
import { User } from '../models/User'
import { AppError } from '../middleware/errorHandler'
import { authenticate, authorize } from '../middleware/auth'
import { z } from 'zod'


const router = Router()

// Premium calculation formula
const calculatePremium = (zone: string, earnings: number, tier: string) => {
  const basePremium = 49

  // Geographic risk coefficients
  const zoneRisk: Record<string, number> = {
    'South Delhi': 0.15,
    'North Delhi': 0.20,
    'East Delhi': 0.35,
    'West Delhi': 0.25,
    'Central Delhi': 0.30,
    'Gurgaon': 0.25,
    'Noida': 0.20,
    'Faridabad': 0.30,
    'Ghaziabad': 0.35
  }

  // Temporal risk (seasonal)
  const month = new Date().getMonth()
  let temporalRisk = 0.1
  if (month >= 5 && month <= 8) temporalRisk = 0.3 // Monsoon
  if (month >= 3 && month <= 5) temporalRisk = 0.2 // Summer

  // Tier multipliers
  const tierMultiplier: Record<string, number> = {
    basic: 0.6,
    standard: 1.0,
    premium: 1.6
  }

  const geographicRisk = zoneRisk[zone] || 0.2
  const finalPremium = basePremium * (1 + geographicRisk + temporalRisk) * tierMultiplier[tier]

  return {
    basePremium,
    geographicRisk,
    temporalRisk,
    loyaltyDiscount: 0,
    finalPremium: Math.round(finalPremium),
    tier,
    maxCoverage: Math.round(finalPremium) * 20,
    eventsPerWeek: tier === 'basic' ? 2 : tier === 'standard' ? 3 : 5
  }
}

// GET /api/policies/calculate-premium
router.get('/calculate-premium', authenticate, async (req, res, next) => {
  try {
    const { zone, earnings, tier = 'standard' } = req.query

    if (!zone || !earnings) {
      throw new AppError(400, 'Zone and earnings required')
    }

    const tierMap: Record<string, number> = { basic: 0, standard: 1, premium: 2 }

    const user = await User.findById(req.user!.userId)

    // Legacy-compatible calculation also returned for backward compat
    const legacyCalc = calculatePremium(zone as string, parseInt(earnings as string), tier as string)

    res.json({
      success: true,
      data: {
        ...legacyCalc,
        // Formula-based fallback
        ml: {
          annual_premium: legacyCalc.finalPremium * 12,
          monthly_premium: legacyCalc.finalPremium,
          confidence_band_low: Math.round(legacyCalc.finalPremium * 0.92),
          confidence_band_high: Math.round(legacyCalc.finalPremium * 1.08),
          model: 'Fallback Formula',
          source: 'fallback'
        },
        model_spec: {
          algorithm: 'Formula Fallback',
          features: 6,
          training_records: 'N/A',
          accuracy: 'N/A',
          retraining: 'N/A',
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/policies/my-policies
router.get('/my-policies', authenticate, async (req, res, next) => {
  try {
    const userPolicies = await Policy.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .select('-__v')

    res.json({ success: true, data: userPolicies })
  } catch (error) {
    next(error)
  }
})

// GET /api/policies/current
router.get('/current', authenticate, async (req, res, next) => {
  try {
    const currentPolicy = await Policy.findOne({
      userId: req.user!.userId,
      status: 'active'
    }).sort({ createdAt: -1 }).select('-__v')

    res.json({ success: true, data: currentPolicy || null })
  } catch (error) {
    next(error)
  }
})

// POST /api/policies
router.post('/', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      tier: z.enum(['basic', 'standard', 'premium']),
      paymentMethod: z.enum(['upi', 'card', 'netbanking']),
      autoRenewal: z.boolean().default(false)
    })

    const { tier, paymentMethod, autoRenewal } = schema.parse(req.body)

    // Get user details
    const user = await User.findById(req.user!.userId)

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Calculate premium
    const calculation = calculatePremium(user.zone || '', 3000, tier)

    // Check for existing active policy
    const existing = await Policy.findOne({
      userId: req.user!.userId,
      status: 'active'
    })

    if (existing) {
      throw new AppError(409, 'Active policy already exists')
    }

    // Create policy
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    const policy = await Policy.create({
      userId: req.user!.userId,
      tier,
      weeklyPremium: calculation.finalPremium,
      maxCoverage: calculation.maxCoverage,
      eventsPerWeek: calculation.eventsPerWeek,
      startDate,
      endDate,
      status: 'pending',     // requires admin approval
      autoRenewal,
      coverageUsed: 0,
      coverageRemaining: calculation.maxCoverage
    })

    res.status(201).json({
      success: true,
      data: policy,
      message: 'Policy application submitted. Awaiting admin approval.'
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/policies/:id/renew
router.post('/:id/renew', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params

    const policy = await Policy.findOne({
      _id: id,
      userId: req.user!.userId
    })

    if (!policy) {
      throw new AppError(404, 'Policy not found')
    }

    // Extend by 7 days
    const newEndDate = new Date(policy.endDate)
    newEndDate.setDate(newEndDate.getDate() + 7)

    policy.endDate = newEndDate
    policy.coverageUsed = 0
    policy.coverageRemaining = policy.maxCoverage
    
    await policy.save()

    res.json({
      success: true,
      data: policy,
      message: 'Policy renewed successfully'
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/policies/:id/cancel
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params

    const policy = await Policy.findOne({
      _id: id,
      userId: req.user!.userId
    })

    if (!policy) {
      throw new AppError(404, 'Policy not found')
    }

    policy.status = 'cancelled'
    await policy.save()

    res.json({
      success: true,
      data: policy,
      message: 'Policy cancelled successfully'
    })
  } catch (error) {
    next(error)
  }
})

export { router as policyRouter }
