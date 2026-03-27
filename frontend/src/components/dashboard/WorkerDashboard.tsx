import { useEffect, useState } from 'react'
import { 
  Shield, 
  Wallet, 
  FileText, 
  TrendingUp, 
  CloudRain, 
  Sun, 
  Wind,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Header } from '@/components/shared/Header'
import { StatsCard } from '@/components/shared/StatsCard'
import { Sidebar } from '@/components/shared/Sidebar'
import { dashboardApi, policyApi, claimsApi } from '@/services/api'
import { formatCurrency, formatDate, getTriggerTypeLabel, getRiskColor } from '@/utils'
import type { WorkerStats, Policy, Claim, RiskForecast } from '@shared/types'

export function WorkerDashboard() {
  const [stats, setStats] = useState<WorkerStats | null>(null)
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [recentClaims, setRecentClaims] = useState<Claim[]>([])
  const [riskForecast, setRiskForecast] = useState<RiskForecast[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, policyRes, claimsRes, forecastRes] = await Promise.all([
        dashboardApi.getWorkerStats(),
        policyApi.getCurrent(),
        claimsApi.getMyClaims(),
        dashboardApi.getRiskForecast()
      ])

      setStats(statsRes.data)
      setPolicy(policyRes.data)
      setRecentClaims(claimsRes.data?.slice(0, 3) || [])
      setRiskForecast(forecastRes.data?.slice(0, 5) || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskIcon = (type?: string) => {
    switch (type) {
      case 'heavy_rain': return CloudRain
      case 'extreme_heat': return Sun
      case 'severe_pollution': return Wind
      default: return AlertTriangle
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-64">
        <Header 
          title="Dashboard" 
          subtitle="Overview of your protection and earnings" 
        />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Policy"
              value={policy?.status === 'active' ? 'Active' : 'No Active Policy'}
              subtitle={policy ? `₹${policy.maxCoverage}/week coverage` : 'Get protected today'}
              icon={Shield}
              className={policy?.status === 'active' ? 'border-l-4 border-l-success-500' : 'border-l-4 border-l-warning-500'}
            />
            <StatsCard
              title="Income Protected"
              value={stats?.incomeProtected || 0}
              subtitle="This month"
              icon={Wallet}
              formatAsCurrency
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Claims This Month"
              value={stats?.totalClaimsThisMonth || 0}
              subtitle={`₹${stats?.totalPayoutsThisMonth || 0} paid out`}
              icon={FileText}
            />
            <StatsCard
              title="Weekly Risk Score"
              value={`${stats?.weeklyRiskScore || 0}/100`}
              subtitle={stats?.weeklyRiskScore && stats.weeklyRiskScore > 50 ? 'High risk week' : 'Low risk week'}
              icon={TrendingUp}
              className={stats?.weeklyRiskScore && stats.weeklyRiskScore > 50 ? 'border-l-4 border-l-warning-500' : 'border-l-4 border-l-success-500'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Policy Status */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Current Policy</h3>
                  <a href="/policy" className="text-sm text-brand-600 hover:text-brand-700 flex items-center">
                    View details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>

                {policy ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Policy Tier</p>
                        <p className="text-lg font-semibold capitalize">{policy.tier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Weekly Premium</p>
                        <p className="text-lg font-semibold text-brand-600">{formatCurrency(policy.weeklyPremium)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-brand-50 rounded-lg">
                        <p className="text-2xl font-bold text-brand-600">{policy.eventsPerWeek}</p>
                        <p className="text-xs text-gray-600 mt-1">Events/Week</p>
                      </div>
                      <div className="text-center p-4 bg-success-50 rounded-lg">
                        <p className="text-2xl font-bold text-success-600">{formatCurrency(policy.maxCoverage)}</p>
                        <p className="text-xs text-gray-600 mt-1">Max Coverage</p>
                      </div>
                      <div className="text-center p-4 bg-warning-50 rounded-lg">
                        <p className="text-2xl font-bold text-warning-600">{formatCurrency(policy.coverageRemaining)}</p>
                        <p className="text-xs text-gray-600 mt-1">Remaining</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Valid until: {formatDate(policy.endDate)}</span>
                      {policy.autoRenewal && (
                        <span className="flex items-center text-success-600">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Auto-renewal enabled
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No active policy</p>
                    <a href="/policy/new" className="btn-primary">
                      Get Protected Now
                    </a>
                  </div>
                )}
              </div>

              {/* Recent Claims */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Claims</h3>
                  <a href="/claims" className="text-sm text-brand-600 hover:text-brand-700">
                    View all
                  </a>
                </div>

                {recentClaims.length > 0 ? (
                  <div className="space-y-3">
                    {recentClaims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            claim.status === 'paid' ? 'bg-success-100 text-success-600' :
                            claim.status === 'approved' ? 'bg-brand-100 text-brand-600' :
                            'bg-warning-100 text-warning-600'
                          }`}>
                            {claim.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> :
                             claim.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                             <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getTriggerTypeLabel(claim.triggerType)}</p>
                            <p className="text-sm text-gray-500">{formatDate(claim.eventTimestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(claim.payoutAmount)}</p>
                          <span className={`status-badge ${
                            claim.status === 'paid' ? 'success' :
                            claim.status === 'approved' ? 'info' :
                            'warning'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No claims yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Forecast */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Risk Forecast</h3>
                <div className="space-y-3">
                  {riskForecast.map((forecast, index) => {
                    const Icon = getRiskIcon(forecast.riskType)
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          forecast.riskLevel === 'high' || forecast.riskLevel === 'severe' 
                            ? 'bg-danger-100 text-danger-600' :
                          forecast.riskLevel === 'medium' 
                            ? 'bg-warning-100 text-warning-600' :
                            'bg-success-100 text-success-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{formatDate(forecast.date)}</p>
                          <p className="text-xs text-gray-500 truncate">{forecast.description}</p>
                        </div>
                        <span className={`status-badge ${getRiskColor(forecast.riskLevel)}`}>
                          {forecast.riskLevel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a href="/claims/new" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">File a Claim</p>
                      <p className="text-xs text-gray-500">Report income loss</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </a>

                  <a href="/policy/renew" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all">
                    <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-success-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Renew Policy</p>
                      <p className="text-xs text-gray-500">Extend your coverage</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
