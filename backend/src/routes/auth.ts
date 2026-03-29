import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { RefreshToken } from '../models/RefreshToken'
import { AppError } from '../middleware/errorHandler'
import { authenticate } from '../middleware/auth'
import nodemailer from 'nodemailer'

// ─── Email Transporter ───────────────────────────────────────────────────────

const getTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your-gmail-app-password-here') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return null
}

// ─── Email Templates ─────────────────────────────────────────────────────────

const getOtpEmailHtml = (otp: string, name: string, purpose: 'login' | 'verify'): string => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,45,141,.10);">
  <tr><td style="background:linear-gradient(135deg,#0a2d8d,#1e3a8a,#0f172a);padding:36px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:700;">🛡 GigShield</span>
    <p style="color:#93c5fd;font-size:13px;margin:8px 0 0;">${purpose === 'verify' ? 'Email Verification' : 'Login OTP'}</p>
  </td></tr>
  <tr><td style="padding:36px 40px;">
    <h2 style="color:#0f172a;margin:0 0 8px;">Hi ${name},</h2>
    <p style="color:#64748b;font-size:15px;margin:0 0 28px;">${purpose === 'verify' ? 'Please verify your email address to complete your GigShield registration.' : 'Use the code below to sign in to your account.'}</p>
    <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
      <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;font-weight:600;">Your Code</p>
      <div style="background:#0a2d8d;border-radius:10px;padding:16px 40px;display:inline-block;">
        <span style="color:#fff;font-size:40px;font-weight:800;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;margin:16px 0 0;">⏱ Expires in <strong style="color:#f97316;">5 minutes</strong></p>
    </div>
    <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;">
      <p style="color:#92400e;font-size:13px;margin:0;"><strong>⚠ Never share this code.</strong> GigShield will never call or message you asking for it.</p>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 GigShield · Licensed by IRDAI · Made with ❤️ in India</p>
  </td></tr>
</table></td></tr></table>
</body></html>`

const getLoginAlertHtml = (name: string, identifier: string, time: string): string => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,45,141,.10);">
  <tr><td style="background:linear-gradient(135deg,#0a2d8d,#1e3a8a,#0f172a);padding:36px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:700;">🛡 GigShield</span>
    <p style="color:#93c5fd;font-size:13px;margin:8px 0 0;">Security Alert</p>
  </td></tr>
  <tr><td style="padding:32px 40px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">✅</div>
    <h2 style="color:#0f172a;margin:0 0 8px;">Successful Login</h2>
    <p style="color:#64748b;">Hi ${name}, your account was just accessed.</p>
  </td></tr>
  <tr><td style="padding:0 40px 24px;">
    <table width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:11px;text-transform:uppercase;">Account</span><br/><strong>${identifier}</strong></td></tr>
      <tr><td style="padding:14px 18px;"><span style="color:#94a3b8;font-size:11px;text-transform:uppercase;">Time (IST)</span><br/><strong>${time}</strong></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 40px 32px;">
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;">
      <p style="color:#991b1b;font-size:13px;margin:0;"><strong>🚨 Wasn't you?</strong> Contact support immediately at support@gigshield.in</p>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 GigShield · Licensed by IRDAI</p>
  </td></tr>
</table></td></tr></table>
</body></html>`

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn(`[Email] SMTP not configured — skipping (to: ${to})`)
    return
  }
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'GigShield'}" <${process.env.SMTP_USER}>`,
      to, subject, html, text,
    })
    console.log(`[Email] Sent → ${to} (${info.messageId})`)
  } catch (err: any) {
    console.error(`[Email] Failed → ${to}: ${err.message}`)
  }
}

const getISTTime = () => new Date().toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
})

const isEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isMobileRegex = /^\d{10}$/

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router()

// ─── MongoDB-backed OTP Store (replaces in-memory Map - required for Lambda) ───
import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  purpose: { type: String, required: true },
  expires: { type: Date, required: true },
}, { collection: 'otp_store' })
otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 }) // Auto-delete expired OTPs

const OtpModel = mongoose.models.OtpStore || mongoose.model('OtpStore', otpSchema)

const otpStore = {
  set: async (identifier: string, data: { otp: string; expires: number; purpose: string }) => {
    await OtpModel.findOneAndUpdate(
      { identifier },
      { otp: data.otp, purpose: data.purpose, expires: new Date(data.expires) },
      { upsert: true, new: true }
    )
  },
  get: async (identifier: string) => {
    const doc = await OtpModel.findOne({ identifier })
    if (!doc) return null
    return { otp: doc.otp, expires: doc.expires.getTime(), purpose: doc.purpose }
  },
  delete: async (identifier: string) => {
    await OtpModel.deleteOne({ identifier })
  }
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  } as jwt.SignOptions)
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  } as jwt.SignOptions)
  return { accessToken, refreshToken }
}

const storeRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await RefreshToken.create({ userId, token, expiresAt })
}

const buildUserResponse = (user: any) => ({
  id: user.id,
  name: user.name,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  platform: user.platform,
  zone: user.zone,
  kycStatus: user.kycStatus,
  emailVerified: user.emailVerified,
})

// ─── POST /api/auth/check-user ────────────────────────────────────────────────
// Step 1: Check if the identifier (email or mobile) is already registered.
// Returns { exists: true/false }

router.post('/check-user', async (req, res, next) => {
  try {
    const { identifier } = req.body
    if (!identifier) throw new AppError(400, 'Email or mobile required')

    const isEmail  = isEmailRegex.test(identifier)
    const isMobile = isMobileRegex.test(identifier)
    if (!isEmail && !isMobile) throw new AppError(400, 'Enter a valid email or 10-digit mobile number')

    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] })

    res.json({ success: true, exists: !!user, isEmail, isMobile })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Step 2a (existing users only): Send OTP to login.

router.post('/send-otp', async (req, res, next) => {
  try {
    const { identifier } = req.body
    if (!identifier) throw new AppError(400, 'Email or mobile required')

    const isEmail  = isEmailRegex.test(identifier)
    const isMobile = isMobileRegex.test(identifier)
    if (!isEmail && !isMobile) throw new AppError(400, 'Valid email or 10-digit mobile required')

    // Verify user actually exists
    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] })
    if (!user) throw new AppError(404, 'No account found with this email/mobile. Please sign up.')

    const otp = generateOtp()
    await otpStore.set(identifier, { otp, expires: Date.now() + 5 * 60 * 1000, purpose: 'login' })

    if (isEmail) {
      await sendEmail(
        identifier,
        'Your GigShield Login OTP',
        getOtpEmailHtml(otp, user.firstName || user.name, 'login'),
        `Your GigShield login OTP is: ${otp}. Expires in 5 minutes.`
      )
    } else {
      console.log(`[SMS] Login OTP for ${identifier}: ${otp}`)
    }

    res.json({
      success: true,
      message: isEmail ? 'OTP sent to your email' : 'OTP sent via SMS',
    })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Step 2b (existing users): Verify OTP and return JWT.

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { identifier, otp } = req.body
    if (!identifier || !otp) throw new AppError(400, 'Identifier and OTP required')

    const stored = await otpStore.get(identifier)
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      throw new AppError(400, 'Invalid or expired OTP')
    }
    if (stored.purpose !== 'login') throw new AppError(400, 'Invalid OTP purpose')

    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] })
    if (!user) throw new AppError(404, 'User not found')

    await otpStore.delete(identifier)

    user.lastLoginAt = new Date()
    await user.save()

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    await storeRefreshToken(user.id, refreshToken)

    // Login alert email (fire-and-forget)
    if (user.email) {
      sendEmail(
        user.email,
        '✅ New Login to Your GigShield Account',
        getLoginAlertHtml(user.firstName || user.name, identifier, getISTTime()),
        `Hi ${user.firstName || user.name}, a new login was detected at ${getISTTime()} IST.`
      )
    }

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: buildUserResponse(user),
    })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/auth/send-verification ────────────────────────────────────────
// Step 3 (new users): Send email verification OTP after filling the registration form.

router.post('/send-verification', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email || !isEmailRegex.test(email)) throw new AppError(400, 'Valid email required')

    // Check not already registered
    const exists = await User.findOne({ email })
    if (exists) throw new AppError(409, 'An account with this email already exists. Please log in.')

    const otp = generateOtp()
    await otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000, purpose: 'verify' })

    await sendEmail(
      email,
      'Verify Your GigShield Account',
      getOtpEmailHtml(otp, 'there', 'verify'),
      `Your GigShield email verification code is: ${otp}. It expires in 10 minutes.`
    )

    res.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Step 4 (new users): Verify email OTP + create account.

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile, dob, otp } = req.body

    if (!firstName || !lastName || !email || !otp) {
      throw new AppError(400, 'First name, last name, email and OTP are required')
    }
    if (!isEmailRegex.test(email)) throw new AppError(400, 'Valid email required')
    if (mobile && !isMobileRegex.test(mobile)) throw new AppError(400, 'Valid 10-digit mobile number required')

    // Verify OTP
    const stored = await otpStore.get(email)
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      throw new AppError(400, 'Invalid or expired verification code')
    }
    if (stored.purpose !== 'verify') throw new AppError(400, 'Invalid OTP purpose')
    await otpStore.delete(email)

    // Check for duplicates
    const emailExists = await User.findOne({ email })
    if (emailExists) throw new AppError(409, 'An account with this email already exists')

    if (mobile) {
      const mobileExists = await User.findOne({ mobile })
      if (mobileExists) throw new AppError(409, 'An account with this mobile number already exists')
    }

    const user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      mobile: mobile || undefined,
      dob: dob ? new Date(dob) : undefined,
      role: 'worker',
      kycStatus: 'pending',
      emailVerified: true,
      lastLoginAt: new Date(),
    })

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    await storeRefreshToken(user.id, refreshToken)

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: buildUserResponse(user),
    })
  } catch (error) {
    next(error)
  }
})

// ─── POST /api/auth/admin-login ───────────────────────────────────────────────

router.post('/admin-login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (username !== 'admin' || password !== 'admin123') throw new AppError(401, 'Invalid admin credentials')

    let user = await User.findOne({ role: 'admin' })
    if (!user) {
      user = await User.create({
        mobile: '0000000000', name: 'System Admin', firstName: 'System', lastName: 'Admin',
        role: 'admin', adminType: 'master',
        permissions: [
          'view_policies', 'manage_policies',
          'view_claims', 'manage_claims',
          'view_users', 'manage_users',
          'manage_parametric', 'manage_admins'
        ],
        platform: 'none', zone: 'All', upiId: 'admin@upi',
        kycStatus: 'verified', emailVerified: true, isActive: true, lastLoginAt: new Date(),
      })
    } else {
      user.lastLoginAt = new Date()
      // Ensure master admin always has all permissions or at least the master type
      if (user.adminType !== 'master') { 
        user.adminType = 'master'
        user.permissions = [
          'view_policies', 'manage_policies',
          'view_claims', 'manage_claims',
          'view_users', 'manage_users',
          'manage_parametric', 'manage_admins'
        ]
      }
      await user.save()
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    await storeRefreshToken(user.id, refreshToken)
    res.json({ success: true, token: accessToken, refreshToken, user: buildUserResponse(user) })
  } catch (error) { next(error) }
})

// ─── POST /api/auth/worker-login ──────────────────────────────────────────────

router.post('/worker-login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (username !== 'worker' || password !== 'worker123') throw new AppError(401, 'Invalid worker credentials')

    let user = await User.findOne({ mobile: '1111111111' })
    if (!user) {
      user = await User.create({
        mobile: '1111111111', name: 'Test Worker', firstName: 'Test', lastName: 'Worker',
        role: 'worker', platform: 'zomato', zone: 'South Delhi', upiId: 'worker@upi',
        kycStatus: 'verified', emailVerified: true, lastLoginAt: new Date(),
      })
    } else {
      user.lastLoginAt = new Date()
      await user.save()
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    await storeRefreshToken(user.id, refreshToken)
    res.json({ success: true, token: accessToken, refreshToken, user: buildUserResponse(user) })
  } catch (error) { next(error) }
})

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.userId).select('-__v')
    if (!user) throw new AppError(404, 'User not found')
    res.json({ success: true, data: user })
  } catch (error) { next(error) }
})

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw new AppError(400, 'Refresh token required')

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any
    const stored = await RefreshToken.findOne({ token: refreshToken })
    if (!stored || stored.expiresAt < new Date()) throw new AppError(401, 'Invalid refresh token')

    const user = await User.findById(stored.userId)
    if (!user) throw new AppError(404, 'User not found')

    const tokens = generateTokens(user.id, user.role)
    await RefreshToken.deleteOne({ token: refreshToken })
    await storeRefreshToken(user.id, tokens.refreshToken)

    res.json({ success: true, token: tokens.accessToken, refreshToken: tokens.refreshToken })
  } catch (error) { next(error) }
})

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) { next(error) }
})

export { router as authRouter }
