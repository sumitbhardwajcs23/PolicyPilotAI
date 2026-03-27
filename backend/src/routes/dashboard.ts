import mongoose from 'mongoose'
import { Router } from 'express'
import { Claim } from '../models/Claim'
import { Policy } from '../models/Policy'
import { Notification } from '../models/Notification'
import { User } from '../models/User'
import { AppError } from '../middleware/errorHandler'
import { authenticate } from '../middleware/auth'

const router = Router()

// GET /api/dashboard/worker
router.get('/worker', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    // Get active policy
    const activePolicy = await Policy.findOne({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 })

    // Get this month's claims
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthClaimsResult = await Claim.aggregate([
      { 
        $match: { 
          // Match the ObjectIds by passing strings to match if needed, but Mongoose aggregate requires ObjectId, so we cast it
          userId: new mongoose.Types.ObjectId(userId), 
          createdAt: { $gte: startOfMonth } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          count: { $sum: 1 }, 
          totalPayout: { $sum: '$payoutAmount' } 
        } 
      }
    ])
    
    const totalClaimsThisMonth = monthClaimsResult[0]?.count || 0
    const totalPayoutsThisMonth = monthClaimsResult[0]?.totalPayout || 0

    // Calculate income protected (total payouts)
    const allPayoutsResult = await Claim.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          status: 'paid' 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$payoutAmount' } 
        } 
      }
    ])
    const incomeProtected = allPayoutsResult[0]?.total || 0

    // Calculate weekly risk score based on zone and season
    const user = await User.findById(userId).select('zone')

    const zoneRiskScores: Record<string, number> = {
      'South Delhi': 35,
      'North Delhi': 45,
      'East Delhi': 75,
      'West Delhi': 50,
      'Central Delhi': 40,
      'Gurgaon': 45,
      'Noida': 40,
      'Faridabad': 55,
      'Ghaziabad': 60
    }

    const month = new Date().getMonth()
    let seasonalMultiplier = 1
    if (month >= 5 && month <= 8) seasonalMultiplier = 1.3 // Monsoon
    if (month >= 3 && month <= 5) seasonalMultiplier = 1.2 // Summer

    const baseRisk = zoneRiskScores[user?.zone || 'South Delhi'] || 40
    const weeklyRiskScore = Math.min(100, Math.round(baseRisk * seasonalMultiplier))

    res.json({
      success: true,
      data: {
        activePolicy: activePolicy || null,
        totalClaimsThisMonth,
        totalPayoutsThisMonth,
        incomeProtected,
        upcomingRenewalDate: activePolicy?.endDate,
        weeklyRiskScore
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/dashboard/risk-forecast
router.get('/risk-forecast', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const user = await User.findById(userId).select('zone')

    // Generate 7-day forecast
    const forecasts = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      // Simulate risk based on zone and random factors
      const zoneRisk = {
        'East Delhi': 0.7,
        'Ghaziabad': 0.6,
        'Faridabad': 0.5,
        'West Delhi': 0.4,
        'Gurgaon': 0.4,
        'North Delhi': 0.35,
        'Noida': 0.35,
        'South Delhi': 0.3,
        'Central Delhi': 0.3
      }[user?.zone || 'South Delhi'] || 0.3

      const randomFactor = Math.random()
      const riskLevel = randomFactor < zoneRisk * 0.3 ? 'severe' :
                       randomFactor < zoneRisk * 0.6 ? 'high' :
                       randomFactor < zoneRisk ? 'medium' : 'low'

      const riskTypes = ['heavy_rain', 'extreme_heat', 'severe_pollution'] as const
      const riskType = riskLevel !== 'low' ? riskTypes[Math.floor(Math.random() * riskTypes.length)] : undefined

      const descriptions: Record<string, string> = {
        heavy_rain: 'Heavy rainfall expected, possible work disruption',
        extreme_heat: 'High temperature alert, heat index above 45°C',
        severe_pollution: 'AQI levels may exceed 400, health advisory issued'
      }

      forecasts.push({
        date: date.toISOString(),
        riskLevel,
        riskType,
        description: riskType ? descriptions[riskType] : 'Favorable conditions for work',
        suggestedAction: riskLevel === 'high' || riskLevel === 'severe' 
          ? 'Consider rescheduling work hours'
          : 'Safe to work, stay hydrated'
      })
    }

    res.json({ success: true, data: forecasts })
  } catch (error) {
    next(error)
  }
})

// GET /api/notifications
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const userNotifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v')

    res.json({ success: true, data: userNotifications })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params

    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      { read: true }
    )

    res.json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    next(error)
  }
})

export { router as dashboardRouter }
