import { useEffect, useState } from 'react'
import { 
  Shield, 
  FileText, 
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Activity
} from 'lucide-react'
import { Header } from '@/components/shared/Header'
import { StatsCard } from '@/components/shared/StatsCard'
import { Sidebar } from '@/components/shared/Sidebar'
import { adminApi } from '@/services/api'
import { formatCurrency, getTriggerTypeLabel } from '@/utils'
import type { DashboardStats, Claim, ParametricEvent } from '@shared/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentClaims, setRecentClaims] = useState<Claim[]>([])
  const [activeEvents, setActiveEvents] = useState<ParametricEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  // Mock chart data - in real app, fetch from API
  const claimsData = [
    { name: 'Mon', claims: 12, payouts: 5400 },
    { name: 'Tue', claims: 19, payouts: 8500 },
    { name: 'Wed', claims: 15, payouts: 6700 },
    { name: 'Thu', claims: 25, payouts: 11200 },
    { name: 'Fri', claims: 32, payouts: 14400 },
    { name: 'Sat', claims: 28, payouts: 12600 },
    { name: 'Sun', claims: 18, payouts: 8100 },
  ]

  const policyDistribution = [
    { name: 'Basic', value: 4500 },
    { name: 'Standard', value: 3200 },
    { name: 'Premium', value: 1800 },
  ]

  const zoneRiskData = [
    { name: 'South Delhi', risk: 35, claims: 120 },
    { name: 'East Delhi', risk: 78, claims: 245 },
    { name: 'Gurgaon', risk: 45, claims: 156 },
    { name: 'Noida', risk: 52, claims: 189 },
    { name: 'Central', risk: 28, claims: 98 },
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, claimsRes, eventsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getClaims({ limit: 5, status: 'pending' }),
        adminApi.getParametricEvents()
      ])

      setStats(statsRes.data)
      setRecentClaims(claimsRes.data?.data?.slice(0, 5) || [])
      setActiveEvents(eventsRes.data?.filter((e: ParametricEvent) => e.status === 'active') || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isAdmin />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin />

      <div className="flex-1 flex flex-col lg:pl-64">
        <Header 
          title="Admin Dashboard" 
          subtitle="Platform overview and analytics" 
        />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Time Range Selector */}
          <div className="flex justify-end mb-6">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === range 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === '24h' ? 'Last 24h' : `Last ${range}`}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Policies"
              value={stats?.activePolicies || 0}
              subtitle="Total coverage active"
              icon={Shield}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Total Claims"
              value={stats?.totalClaims || 0}
              subtitle={`${recentClaims.filter(c => c.status === 'pending').length} pending review`}
              icon={FileText}
              trend={{ value: 12, isPositive: false }}
            />
            <StatsCard
              title="Total Payouts"
              value={stats?.totalPayouts || 0}
              subtitle="Lifetime disbursements"
              icon={Wallet}
              formatAsCurrency
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Fraud Detection"
              value={`${stats?.fraudDetectionRate || 95}%`}
              subtitle="Accuracy rate"
              icon={Activity}
              className="border-l-4 border-l-success-500"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Claims & Payouts Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Claims & Payouts Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={claimsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar yAxisId="left" dataKey="claims" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="payouts" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Policy Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Policy Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={policyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {policyDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {policyDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Zone Risk Analysis */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Zone Risk Analysis</h3>
              <div className="space-y-4">
                {zoneRiskData.map((zone) => (
                  <div key={zone.name} className="flex items-center gap-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                        <span className={`text-xs font-medium ${
                          zone.risk > 60 ? 'text-danger-600' :
                          zone.risk > 40 ? 'text-warning-600' :
                          'text-success-600'
                        }`}>
                          {zone.risk}% risk
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            zone.risk > 60 ? 'bg-danger-500' :
                            zone.risk > 40 ? 'bg-warning-500' :
                            'bg-success-500'
                          }`}
                          style={{ width: `${zone.risk}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{zone.claims} claims this month</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Parametric Events */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
                <span className="status-badge danger">
                  {activeEvents.length} Active
                </span>
              </div>

              {activeEvents.length > 0 ? (
                <div className="space-y-3">
                  {activeEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-danger-50 border border-danger-100 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{getTriggerTypeLabel(event.type)}</p>
                          <p className="text-sm text-gray-600">{event.zone}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Intensity: {event.intensity}</span>
                            <span>{event.affectedWorkers} workers affected</span>
                          </div>
                          <p className="text-sm font-medium text-danger-600 mt-2">
                            Est. payout: {formatCurrency(event.totalEstimatedPayout)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 text-success-300 mx-auto mb-4" />
                  <p>No active parametric events</p>
                </div>
              )}
            </div>

            {/* Recent Claims Requiring Review */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pending Review</h3>
                <a href="/admin/claims" className="text-sm text-brand-600 hover:text-brand-700">
                  View all
                </a>
              </div>

              {recentClaims.length > 0 ? (
                <div className="space-y-3">
                  {recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-warning-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getTriggerTypeLabel(claim.triggerType)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fraud score: {claim.fraudScore}/100
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(claim.payoutAmount)}</p>
                        <button className="text-xs text-brand-600 hover:text-brand-700">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 text-success-300 mx-auto mb-4" />
                  <p>No pending claims</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
