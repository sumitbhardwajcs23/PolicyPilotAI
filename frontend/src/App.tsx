import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Login } from '@/components/auth/Login'
import { Register } from '@/components/auth/Register'
import { Landing } from '@/pages/Landing'
import { MLDemo } from '@/pages/MLDemo'

// Layout components
import { UserLayout } from '@/components/layout/UserLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// User pages
import { UserDashboard } from '@/pages/user/UserDashboard'
import { UserPolicies } from '@/pages/user/UserPolicies'
import { NewPolicy } from '@/pages/user/NewPolicy'
import { UserClaims } from '@/pages/user/UserClaims'
import { NewClaim } from '@/pages/user/NewClaim'
import { UserHistory } from '@/pages/user/UserHistory'
import { UserProfile } from '@/pages/user/UserProfile'

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminPolicies } from '@/pages/admin/AdminPolicies'
import { AdminClaims } from '@/pages/admin/AdminClaims'
import { AdminManagement } from '@/pages/admin/AdminManagement'
import { AdminSettings } from '@/pages/admin/AdminSettings'

// Shared pages
import { Analytics } from '@/pages/Analytics'
import { FraudDetection } from '@/pages/FraudDetection'
import { GPSTracking } from '@/pages/GPSTracking'
import { Payments } from '@/pages/Payments'
import { Weather } from '@/pages/Weather'
import { Settings } from '@/pages/Settings'

// Protected route for workers/users
function WorkerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect admins/insurers to admin dashboard
  if (user?.role === 'admin' || user?.role === 'insurer') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}

// Protected route for admins/insurers
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect workers to user dashboard
  if (user?.role === 'worker') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/ml-demo" element={<MLDemo />} />

      {/* Worker/User Routes with Layout */}
      <Route path="/dashboard" element={
        <WorkerProtectedRoute>
          <UserLayout />
        </WorkerProtectedRoute>
      }>
        <Route index element={<UserDashboard />} />
        <Route path="policies" element={<UserPolicies />} />
        <Route path="policies/new" element={<NewPolicy />} />
        <Route path="claims" element={<UserClaims />} />
        <Route path="claims/new" element={<NewClaim />} />
        <Route path="history" element={<UserHistory />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="gps" element={<GPSTracking />} />
        <Route path="weather" element={<Weather />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin Routes with Layout */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="policies" element={<AdminPolicies />} />
        <Route path="claims" element={<AdminClaims />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="gps" element={<GPSTracking />} />
        <Route path="fraud" element={<FraudDetection />} />
        <Route path="weather" element={<Weather />} />
        <Route path="payments" element={<Payments />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
