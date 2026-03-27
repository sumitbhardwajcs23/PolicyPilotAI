import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { authApi } from '@/services/api'
import toast from 'react-hot-toast'

interface RegisterData {
  mobile: string
  name: string
  platform: 'zomato' | 'swiggy' | 'blinkit' | 'dunzo' | 'bigbasket' | 'both'
  zone: string
  upiId: string
  otp: string
}

export function Register() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<RegisterData>({
    mobile: '',
    name: '',
    platform: 'zomato',
    zone: '',
    upiId: '',
    otp: ''
  })
  const navigate = useNavigate()

  const zones = [
    'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Central Delhi',
    'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad'
  ]

  const handleSendOTP = async () => {
    if (data.mobile.length !== 10) {
      toast.error('Please enter a valid mobile number')
      return
    }
    setIsLoading(true)
    try {
      await authApi.sendOTP(data.mobile)
      toast.success('OTP sent!')
      setStep(2)
    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      await authApi.register(data as any)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Let's get started</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={data.mobile}
                onChange={(e) => setData({ ...data, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="input-field"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="input-field"
                placeholder="Your full name"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={isLoading || data.mobile.length !== 10 || !data.name}
              className="btn-primary w-full"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Verify your number</h2>
            <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to +91 {data.mobile}</p>
            <input
              type="text"
              value={data.otp}
              onChange={(e) => setData({ ...data, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="000000"
            />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={data.otp.length !== 6}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Work details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Platform</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['zomato', 'swiggy', 'blinkit', 'dunzo', 'bigbasket', 'both'] as const).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setData({ ...data, platform })}
                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                      data.platform === platform
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Zone</label>
              <select
                value={data.zone}
                onChange={(e) => setData({ ...data, zone: e.target.value })}
                className="input-field"
              >
                <option value="">Select your zone</option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!data.zone}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
              <input
                type="text"
                value={data.upiId}
                onChange={(e) => setData({ ...data, upiId: e.target.value })}
                className="input-field"
                placeholder="name@upi"
              />
              <p className="text-xs text-gray-500 mt-1">For instant claim payouts</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={isLoading || !data.upiId}
                className="btn-primary flex-1"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Step {step} of 4</p>
        </div>

        <div className="card p-8">
          {renderStep()}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <a href="/login" className="text-brand-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  )
}
