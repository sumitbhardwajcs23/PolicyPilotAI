import { Router } from 'express'
import { Claim } from '../models/Claim'
import { Policy } from '../models/Policy'
import { User } from '../models/User'
import { ParametricEvent } from '../models/ParametricEvent'
import { AppError } from '../middleware/errorHandler'
import { authenticate, authorize, requireMasterAdmin, loadAdminUser, requirePermission } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

// All admin routes: authenticated + admin/insurer role
router.use(authenticate)
router.use(authorize('admin', 'insurer'))
// Load the full admin user for permission checks
router.use(loadAdminUser)

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeWorkers,
      activePolicies,
      pendingPolicies,
      totalClaims,
      pendingClaims,
      payoutResult,
      premiumResult,
      totalAdmins
    ] = await Promise.all([
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'worker', isActive: true }),
      Policy.countDocuments({ status: 'active' }),
      Policy.countDocuments({ status: 'pending' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Claim.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$payoutAmount' } } }]),
      Policy.aggregate([{ $group: { _id: null, total: { $sum: '$weeklyPremium' } } }]),
      User.countDocuments({ role: { $in: ['admin', 'insurer'] } }),
    ])

    const totalPayouts = payoutResult[0]?.total || 0
    const totalPremiums = premiumResult[0]?.total || 0
    const lossRatio = totalPremiums > 0 ? parseFloat(((totalPayouts / totalPremiums) * 100).toFixed(1)) : 0

    res.json({
      success: true,
      data: {
        totalUsers,
        activeWorkers,
        activePolicies,
        pendingPolicies,
        totalClaims,
        pendingClaims,
        totalPayouts,
        totalPremiums,
        lossRatio,
        avgProcessingTime: 12,
        fraudDetectionRate: 95.5,
        totalAdmins,
      }
    })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/policies ──────────────────────────────────────────────────
router.get('/policies', requirePermission('view_policies'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const query: any = {}
    if (status) query.status = status

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    const [results, total] = await Promise.all([
      Policy.find(query)
        .populate('userId', 'name email mobile platform zone')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-__v'),
      Policy.countDocuments(query)
    ])

    res.json({
      success: true,
      data: { data: results, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    })
  } catch (error) {
    next(error)
  }
})

// ─── PATCH /api/admin/policies/:id/status ─────────────────────────────────────
// Approve or reject a pending policy purchase
router.patch('/policies/:id/status', requirePermission('manage_policies'), async (req, res, next) => {
  try {
    const { id } = req.params
    const schema = z.object({
      status: z.enum(['active', 'rejected', 'cancelled']),
      notes: z.string().optional()
    })
    const { status, notes } = schema.parse(req.body)

    const policy = await Policy.findById(id)
    if (!policy) throw new AppError(404, 'Policy not found')

    policy.status = status as any
    await policy.save()

    res.json({ success: true, data: policy, message: `Policy ${status} successfully` })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/claims ────────────────────────────────────────────────────
router.get('/claims', requirePermission('view_claims'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const query: any = {}
    if (status) query.status = status

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    const [results, total] = await Promise.all([
      Claim.find(query)
        .populate('userId', 'name email mobile platform zone upiId')
        .populate('policyId', 'tier weeklyPremium maxCoverage')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-__v'),
      Claim.countDocuments(query)
    ])

    res.json({
      success: true,
      data: { data: results, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    })
  } catch (error) {
    next(error)
  }
})

// ─── PATCH /api/admin/claims/:id/status ──────────────────────────────────────
router.patch('/claims/:id/status', requirePermission('manage_claims'), async (req, res, next) => {
  try {
    const { id } = req.params
    const schema = z.object({
      status: z.enum(['pending', 'approved', 'rejected', 'processing', 'paid']),
      notes: z.string().optional()
    })
    const { status } = schema.parse(req.body)

    const updateData: any = {
      status,
      processedBy: req.user!.userId,
    }
    if (status === 'paid') updateData.paidAt = new Date()
    if (status === 'approved' || status === 'rejected') updateData.processedAt = new Date()

    const updated = await Claim.findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name email mobile upiId')

    if (!updated) throw new AppError(404, 'Claim not found')

    // If approved, update policy coverage
    if (status === 'approved') {
      await Policy.findByIdAndUpdate(updated.policyId, {
        $inc: { coverageUsed: updated.payoutAmount, coverageRemaining: -updated.payoutAmount }
      })
    }

    res.json({ success: true, data: updated, message: `Claim ${status} successfully` })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', requirePermission('view_users'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query
    const query: any = {}
    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ]
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    const [results, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-__v'),
      User.countDocuments(query)
    ])

    res.json({
      success: true,
      data: { data: results, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
router.get('/users/:id', requirePermission('view_users'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v')
    if (!user) throw new AppError(404, 'User not found')

    const [policies, claims] = await Promise.all([
      Policy.find({ userId: req.params.id }).select('-__v').sort({ createdAt: -1 }),
      Claim.find({ userId: req.params.id }).select('-__v').sort({ createdAt: -1 })
    ])

    res.json({ success: true, data: { user, policies, claims } })
  } catch (error) {
    next(error)
  }
})

// ─── PATCH /api/admin/users/:id ───────────────────────────────────────────────
router.patch('/users/:id', requirePermission('manage_users'), async (req, res, next) => {
  try {
    const schema = z.object({
      kycStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
      isActive: z.boolean().optional(),
      zone: z.string().optional(),
      platform: z.string().optional(),
    })
    const updates = schema.parse(req.body)
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v')
    if (!user) throw new AppError(404, 'User not found')
    res.json({ success: true, data: user, message: 'User updated' })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/admins ────────────────────────────────────────────────────
// List all slave admins – master admin only
router.get('/admins', requireMasterAdmin, async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'insurer'] } })
      .select('-__v')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: admins })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/admin/admins ───────────────────────────────────────────────────
// Create a slave admin – master admin only
router.post('/admins', requireMasterAdmin, async (req, res, next) => {
  try {
    // Pre-process body: convert empty strings to undefined
    const processedBody = { ...req.body };
    if (processedBody.email === '') delete processedBody.email;
    if (processedBody.mobile === '') delete processedBody.mobile;

    console.log('[createAdmin] body received:', JSON.stringify(processedBody));

    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email().optional(),
      mobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits').optional(),
      role: z.enum(['admin', 'insurer']).default('insurer'),
      permissions: z.array(z.string()).default([]),
    })
    const data = schema.parse(processedBody)
    console.log('[createAdmin] parsed OK:', JSON.stringify(data));

    // Check duplicates
    if (data.email) {
      const exists = await User.findOne({ email: data.email })
      if (exists) throw new AppError(409, 'Email already in use')
    }
    if (data.mobile) {
      const exists = await User.findOne({ mobile: data.mobile })
      if (exists) throw new AppError(409, 'Mobile number already in use')
    }

    const nameParts = data.name.split(' ')
    const newAdmin = await User.create({
      ...data,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      adminType: 'slave',
      kycStatus: 'verified',
      emailVerified: true,
      isActive: true,
    })

    res.status(201).json({ success: true, data: newAdmin, message: 'Slave admin created' })
  } catch (error) {
    next(error)
  }
})

// ─── PATCH /api/admin/admins/:id/permissions ──────────────────────────────────
// Update slave admin permissions – master admin only
router.patch('/admins/:id/permissions', requireMasterAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      permissions: z.array(z.string()),
      isActive: z.boolean().optional(),
    })
    const { permissions, isActive } = schema.parse(req.body)

    const target = await User.findById(req.params.id)
    if (!target) throw new AppError(404, 'Admin not found')
    if (target.adminType === 'master') throw new AppError(403, 'Cannot modify a master admin')

    const updates: any = { permissions }
    if (typeof isActive !== 'undefined') updates.isActive = isActive

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v')
    res.json({ success: true, data: updated, message: 'Permissions updated' })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/zones ─────────────────────────────────────────────────────
router.get('/zones', async (req, res, next) => {
  try {
    const zoneStats = await User.aggregate([
      { $match: { role: 'worker' } },
      { $group: { _id: '$zone', userCount: { $sum: 1 } } }
    ])

    const riskScores: Record<string, number> = {
      'East Delhi': 78, 'Ghaziabad': 65, 'Faridabad': 58, 'West Delhi': 52,
      'Gurgaon': 48, 'North Delhi': 42, 'Noida': 45, 'South Delhi': 35, 'Central Delhi': 38
    }

    const zonesWithRisk = zoneStats.map(z => ({
      zone: z._id,
      userCount: z.userCount,
      riskScore: riskScores[z._id] || 40,
    }))

    res.json({ success: true, data: zonesWithRisk })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/parametric-events ─────────────────────────────────────────
router.get('/parametric-events', async (req, res, next) => {
  try {
    const events = await ParametricEvent.find().sort({ createdAt: -1 }).select('-__v')
    res.json({ success: true, data: events })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/admin/parametric-events ────────────────────────────────────────
router.post('/parametric-events', requirePermission('manage_parametric'), async (req, res, next) => {
  try {
    const schema = z.object({
      type: z.enum(['heavy_rain', 'extreme_heat', 'severe_pollution', 'flooding', 'social_disruption']),
      zone: z.string(),
      intensity: z.number(),
      threshold: z.number(),
      affectedWorkers: z.number().default(0),
      totalEstimatedPayout: z.number().default(0)
    })

    const data = schema.parse(req.body)
    const event = await ParametricEvent.create({ ...data, startTime: new Date(), status: 'active' })

    res.status(201).json({ success: true, data: event, message: 'Parametric event created' })
  } catch (error) {
    next(error)
  }
})

// ─── GET /api/admin/me ────────────────────────────────────────────────────────
// Return current admin's info including adminType and permissions
router.get('/me', async (req, res, next) => {
  try {
    const admin = await User.findById(req.user!.userId).select('-__v')
    if (!admin) throw new AppError(404, 'Admin not found')
    res.json({ success: true, data: admin })
  } catch (error) {
    next(error)
  }
})

export { router as adminRouter }
