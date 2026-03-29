import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Smartphone, ArrowRight, Loader2, Mail, CheckCircle,
  Sparkles, User, Calendar, Phone, Eye, EyeOff
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/services/api'
import toast from 'react-hot-toast'

type Step = 'identifier' | 'otp' | 'register' | 'verify' | 'password'

export function Login() {
  const [step, setStep] = useState<Step>('identifier')
  const [loginRole, setLoginRole] = useState<'admin' | 'worker'>('admin')

  // Identifier step
  const [identifier, setIdentifier] = useState('')
  const [isEmail, setIsEmail] = useState(false)

  // OTP step (existing user)
  const [otp, setOtp] = useState('')

  const [countdown, setCountdown] = useState(0)

  // Register step (new user)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [dob, setDob] = useState('')

  // Verify step (new user email OTP)
  const [verifyOtp, setVerifyOtp] = useState('')


  // Password step (test portal)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => { setIsEmail(identifier.includes('@')) }, [identifier])

  const proceedWithLocation = async (user: any) => {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 60000 })
      })
      localStorage.setItem('cachedLocation', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }))
    } catch {
      // Ignore
    }
    navigate(user.role === 'admin' || user.role === 'insurer' ? '/admin' : '/dashboard')
  }

  const startCountdown = () => {
    setCountdown(60)
    const t = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 }), 1000)
  }

  // ── Step 1: Check if user exists ───────────────────────────────────────────
  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier) return

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    const mobileValid = /^\d{10}$/.test(identifier)
    if (!emailValid && !mobileValid) {
      toast.error('Enter a valid email or 10-digit mobile number')
      return
    }

    setIsLoading(true)
    try {
      const res: any = await authApi.checkUser(identifier)

      if (res.exists) {
        // Existing user → send OTP
        await authApi.sendOTP(identifier)
        toast.success(isEmail ? 'OTP sent to your email' : 'OTP sent via SMS')
        startCountdown()
        setStep('otp')
      } else {
        // New user → go to registration form
        if (emailValid) setRegEmail(identifier)
        else setRegMobile(identifier)
        setStep('register')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2a: Verify OTP (existing user) ────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter a valid 6-digit OTP'); return }

    setIsLoading(true)
    try {
      const res: any = await authApi.verifyOTP(identifier, otp)
      if (!res?.token || !res?.user) { toast.error('Login failed — please try again'); return }
      login(res.token, res.user)
      toast.success(`Welcome back, ${res.user.firstName || res.user.name}!`)
      await proceedWithLocation(res.user)
    } catch {
      toast.error('Invalid or expired OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2b: Send verification email (new user) ────────────────────────────
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) { toast.error('First and last name are required'); return }
    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { toast.error('Valid email is required'); return }
    if (regMobile && !/^\d{10}$/.test(regMobile)) { toast.error('Enter a valid 10-digit mobile number'); return }

    setIsLoading(true)
    try {
      await authApi.sendVerification(regEmail)
      toast.success('Verification code sent to your email')
      startCountdown()
      setStep('verify')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 3: Register (new user verify email OTP) ───────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyOtp.length !== 6) { toast.error('Enter a valid 6-digit code'); return }

    setIsLoading(true)
    try {
      const res: any = await authApi.register({
        firstName, lastName, email: regEmail,
        mobile: regMobile || undefined,
        dob: dob || undefined,
        otp: verifyOtp,
      })
      if (!res?.token || !res?.user) { toast.error('Registration failed — please try again'); return }
      login(res.token, res.user)
      toast.success(`Welcome to GigShield, ${firstName}! 🎉`)
      await proceedWithLocation(res.user)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Test portal login ──────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const apiCall = loginRole === 'admin' ? authApi.adminLogin : authApi.workerLogin
      const res: any = await apiCall({ username, password })
      login(res.token, res.user)
      toast.success(`${loginRole === 'admin' ? 'Admin' : 'Test user'} login successful!`)
      await proceedWithLocation(res.user)
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Resend helpers ────────────────────────────────────────────────────────
  const resendLoginOtp = async () => {
    try {
      const res: any = await authApi.sendOTP(identifier)
      if (res?.otp) { setOtp(res.otp) }
      toast.success('New OTP sent')
      startCountdown()
    } catch { toast.error('Failed to resend OTP') }
  }

  const resendVerifyOtp = async () => {
    try {
      const res: any = await authApi.sendVerification(regEmail)
      if (res?.otp) { setVerifyOtp(res.otp) }
      toast.success('New verification code sent')
      startCountdown()
    } catch { toast.error('Failed to resend code') }
  }


  const ResendRow = ({ onResend }: { onResend: () => void }) => (
    <div className="text-center pt-2">
      {countdown > 0
        ? <p className="text-sm text-gray-400">Resend in {countdown}s</p>
        : <button type="button" onClick={onResend} className="text-sm font-semibold text-[#f97316] hover:text-[#ea580c]">Resend Code</button>
      }
    </div>
  )

  const inputCls = "block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a2d8d] focus:border-transparent transition-all text-sm"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5"
  const primaryBtn = "w-full bg-[#f97316] hover:bg-[#ea580c] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
  const secondaryBtn = "w-full bg-[#0a2d8d] hover:bg-[#1e3a8a] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white">

      {/* Left Pane */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a2d8d] via-[#1e3a8a] to-[#0f172a] text-white p-12 flex-col justify-between">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex items-center gap-2">
          <Shield className="w-8 h-8 text-[#f97316]" />
          <span className="text-2xl font-bold font-['Poppins']">GigShield</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>AI-Driven Income Protection</span>
          </div>
          <h1 className="text-5xl font-bold font-['Poppins'] leading-tight mb-6">
            Secure your earnings,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">empower your future.</span>
          </h1>
          <p className="text-xl text-blue-100/80 mb-12">
            GigShield provides dynamic protection against rain, heat, and missing payouts for delivery partners across India.
          </p>
          <div className="space-y-4">
            {['Zero-touch instant claims', 'Coverage from ₹49/week', 'Direct UPI payouts'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-200/60">
          <span>Trusted by 7.7M+ Gig Workers</span>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 sm:p-10">

          {/* ── Step: identifier ── */}
          {step === 'identifier' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#0f172a] font-['Poppins'] mb-2">Welcome</h2>
                <p className="text-[#64748b]">Enter your email or mobile to continue</p>
              </div>
              <form onSubmit={handleCheckUser} className="space-y-5">
                <div>
                  <label className={labelCls}>Email Address or Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {isEmail ? <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#0a2d8d]" /> : <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-[#0a2d8d]" />}
                    </div>
                    <input
                      type="text" value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      className={`${inputCls} pl-11`}
                      placeholder="Enter your email or phone"
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading || !identifier} className={primaryBtn}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-5 h-5" /></>}
                </button>

                {/* Slave Admin hint */}
                <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-700 text-center">
                    <span className="font-semibold">Slave Admins:</span> enter your registered email or mobile above ↑ to log in with OTP
                  </p>
                </div>

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Master Admin only</span></div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep('password'); setLoginRole('admin') }}
                    className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#0a2d8d] hover:text-[#0a2d8d] transition-colors">
                    Master Admin
                  </button>
                  <button type="button" onClick={() => { setStep('password'); setLoginRole('worker') }}
                    className="flex-1 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                    Test Worker
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Step: otp (existing user) ── */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#0f172a] font-['Poppins'] mb-2">Verify Identity</h2>
                <p className="text-[#64748b] text-sm">We sent a code to <strong>{identifier}</strong></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className={labelCls}>Enter 6-Digit OTP</label>
                  <input
                    type="text" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="block w-full py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-3xl tracking-[1em] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a2d8d] focus:border-transparent transition-all"
                    placeholder="——————" maxLength={6} autoFocus
                  />
                </div>
                <button type="submit" disabled={isLoading || otp.length !== 6} className={secondaryBtn}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                </button>
                <div className="flex justify-between items-center pt-1 text-sm">
                  <button type="button" onClick={() => setStep('identifier')} className="text-gray-500 hover:text-gray-800">← Change</button>
                  <ResendRow onResend={resendLoginOtp} />
                </div>
              </form>
            </>
          )}

          {/* ── Step: register (new user form) ── */}
          {step === 'register' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#0f172a] font-['Poppins'] mb-1">Create Account</h2>
                <p className="text-[#64748b] text-sm">Fill in your details to get started</p>
              </div>
              <form onSubmit={handleSendVerification} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                        className={`${inputCls} pl-9`} placeholder="Sumit" required />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Last Name *</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                      className={inputCls} placeholder="Bhardwaj" required />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      className={`${inputCls} pl-9`} placeholder="you@email.com" required />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Mobile Number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input type="tel" value={regMobile} onChange={e => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`${inputCls} pl-9`} placeholder="10-digit mobile" maxLength={10} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                      className={`${inputCls} pl-9`} max={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <button type="submit" disabled={isLoading || !firstName || !lastName || !regEmail} className={`${primaryBtn} mt-2`}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send Verification Email</span><ArrowRight className="w-5 h-5" /></>}
                </button>
                <button type="button" onClick={() => setStep('identifier')} className="w-full text-sm text-center text-gray-500 hover:text-gray-800 pt-1">
                  ← Back
                </button>
              </form>
            </>
          )}

          {/* ── Step: verify (new user email OTP) ── */}
          {step === 'verify' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#0f172a] font-['Poppins'] mb-1">Verify Your Email</h2>
                <p className="text-[#64748b] text-sm">We sent a 6-digit code to <strong>{regEmail}</strong></p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className={labelCls}>Verification Code</label>
                  <input
                    type="text" value={verifyOtp}
                    onChange={e => setVerifyOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="block w-full py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-3xl tracking-[1em] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a2d8d] focus:border-transparent transition-all"
                    placeholder="——————" maxLength={6} autoFocus
                  />
                </div>
                <button type="submit" disabled={isLoading || verifyOtp.length !== 6} className={primaryBtn}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create My Account 🎉'}
                </button>
                <div className="flex justify-between items-center text-sm">
                  <button type="button" onClick={() => setStep('register')} className="text-gray-500 hover:text-gray-800">← Edit Details</button>
                  <ResendRow onResend={resendVerifyOtp} />
                </div>
              </form>
            </>
          )}

          {/* ── Step: password (test portal) ── */}
          {step === 'password' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#0f172a] font-['Poppins'] mb-2">{loginRole === 'admin' ? 'Admin' : 'Test'} Portal</h2>
                <p className="text-[#64748b] text-sm">Enter your credentials</p>
              </div>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className={labelCls}>Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    className={inputCls} placeholder={`${loginRole}`} autoComplete="username" />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`${inputCls} pr-11`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading || !username || !password} className={`${secondaryBtn} mt-2`}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Access ${loginRole === 'admin' ? 'Admin' : 'Test'} Dashboard`}
                </button>
                <button type="button" onClick={() => setStep('identifier')} className="w-full text-sm text-center text-gray-500 hover:text-gray-800 pt-1">
                  ← Back to Login
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
