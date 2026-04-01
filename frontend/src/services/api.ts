import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://policypilotai.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    if (error.response?.status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  checkUser: (identifier: string) => api.post('/auth/check-user', { identifier }),
  sendOTP: (identifier: string) => api.post('/auth/send-otp', { identifier }),
  verifyOTP: (identifier: string, otp: string) => api.post('/auth/verify-otp', { identifier, otp }),
  sendVerification: (email: string) => api.post('/auth/send-verification', { email }),
  register: (data: { firstName: string; lastName: string; email: string; mobile?: string; dob?: string; platform?: string; zone?: string; upiId?: string; otp: string }) =>
    api.post('/auth/register', data),
  adminLogin: (data: any) => api.post('/auth/admin-login', data),
  workerLogin: (data: any) => api.post('/auth/worker-login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateLocation: (lat: number, lng: number) => api.patch('/auth/location', { lat, lng }),
}

// ─── Policies ─────────────────────────────────────────────────────────────────
export const policyApi = {
  calculatePremium: (zone: string, earnings: number, tier?: string) =>
    api.get('/policies/calculate-premium', { params: { zone, earnings, tier } }),
  create: (data: any) => api.post('/policies', data),
  getMyPolicies: () => api.get('/policies/my-policies'),
  getCurrent: () => api.get('/policies/current'),
  renew: (id: string) => api.post(`/policies/${id}/renew`),
  cancel: (id: string) => api.post(`/policies/${id}/cancel`),
}

// ─── Claims ─────────────────────────────────────────────────────────────────
export const claimsApi = {
  getMyClaims: () => api.get('/claims/my-claims'),
  getById: (id: string) => api.get(`/claims/${id}`),
  submitManual: (data: any) => api.post('/claims/manual', data),
  uploadEvidence: (claimId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('evidence', file))
    return api.post(`/claims/${claimId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getWorkerStats: () => api.get('/dashboard/worker'),
  getRiskForecast: () => api.get('/dashboard/risk-forecast'),
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id: string) => api.patch(`/notifications/${id}/read`),
}

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getMe: () => api.get('/admin/me'),

  // Policies
  getPolicies: (params?: any) => api.get('/admin/policies', { params }),
  updatePolicyStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/admin/policies/${id}/status`, { status, notes }),

  // Claims
  getClaims: (params?: any) => api.get('/admin/claims', { params }),
  updateClaimStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/admin/claims/${id}/status`, { status, notes }),

  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),

  // Admin management (master only)
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data: any) => api.post('/admin/admins', data),
  updateAdminPermissions: (id: string, permissions: string[], isActive?: boolean) =>
    api.patch(`/admin/admins/${id}/permissions`, { permissions, isActive }),

  // Zones & events
  getZones: () => api.get('/admin/zones'),
  getParametricEvents: () => api.get('/admin/parametric-events'),
  createParametricEvent: (data: any) => api.post('/admin/parametric-events', data),
}

// ─── ML Service (via Node.js proxy, auth-required) ─────────────────────────
export const mlApi = {
  health: () => api.get('/ml/health'),
  info: () => api.get('/ml/info'),
  predictPremium: (tier: string, overrides?: Record<string, number>) =>
    api.post('/ml/predict/premium', { tier, overrides }),
  predictFraud: (claimData: any, threshold?: number, overrides?: Record<string, number>) =>
    api.post('/ml/predict/fraud', { claimData, threshold, overrides }),
}

// ─── ML Service (direct — public demo, no auth) ────────────────────────────
const ML_URL = import.meta.env.VITE_ML_URL || (import.meta.env.PROD ? 'https://policypilotai-2.onrender.com' : 'http://localhost:8001')

export const mlDemoApi = {
  health: async () => {
    const r = await fetch(`${ML_URL}/health`)
    return r.json()
  },
  info: async () => {
    const r = await fetch(`${ML_URL}/models/info`)
    return r.json()
  },
  predictPremium: async (body: Record<string, number>) => {
    const r = await fetch(`${ML_URL}/predict/premium`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return r.json()
  },
  predictFraud: async (body: Record<string, number>) => {
    const r = await fetch(`${ML_URL}/predict/fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return r.json()
  },
}

