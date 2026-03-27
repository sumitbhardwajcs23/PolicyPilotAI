import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePoliciesApi } from '@/hooks/usePoliciesApi';
import { useClaimsApi } from '@/hooks/useClaimsApi';
import { dashboardApi } from '@/services/api';
import {
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  MapPin,
  CloudSun,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GPSMap } from '@/components/gps/GPSMap';
import { WeatherWidget } from '@/components/weather/WeatherWidget';

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
};

export function UserDashboard() {
  const { user } = useAuth();
  const { userPolicies, loading: policiesLoading, fetchUserPolicies } = usePoliciesApi();
  const { userClaims, loading: claimsLoading, fetchUserClaims } = useClaimsApi();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [riskForecast, setRiskForecast] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [statsRes, forecastRes] = await Promise.all([
        dashboardApi.getWorkerStats(),
        dashboardApi.getRiskForecast(),
      ]) as any[];
      setStats(statsRes?.data);
      setRiskForecast(forecastRes?.data || []);
    } catch { }
    setStatsLoading(false);
  };

  const refreshAll = () => {
    fetchUserPolicies();
    fetchUserClaims();
    loadStats();
  };

  const activePolicies = userPolicies.filter(p => p.status === 'active');
  const pendingPolicies = userPolicies.filter(p => p.status === 'pending');
  const pendingClaims = userClaims.filter(c => c.status === 'pending' || c.status === 'processing');
  const totalCoverage = activePolicies.reduce((s, p) => s + p.maxCoverage, 0);
  const totalPremium = activePolicies.reduce((s, p) => s + p.weeklyPremium, 0);

  const riskScore = stats?.weeklyRiskScore ?? 0;
  const riskColor = riskScore > 70 ? 'text-red-400' : riskScore > 40 ? 'text-amber-400' : 'text-emerald-400';
  const riskLabel = riskScore > 70 ? 'High Risk' : riskScore > 40 ? 'Moderate' : 'Low Risk';

  const isLoading = policiesLoading || claimsLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-white/60">
            {user?.platform && user?.zone
              ? `${user.platform} · ${user.zone}`
              : 'Your GigShield Insurance Dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAll}
            disabled={isLoading}
            className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/dashboard/policies/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Buy Policy
          </Link>
        </div>
      </div>

      {/* Pending Policy Alert */}
      {pendingPolicies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <strong>{pendingPolicies.length} policy application{pendingPolicies.length > 1 ? 's' : ''}</strong> pending admin approval. You'll be notified once reviewed.
          </p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Policies',
            value: activePolicies.length,
            sub: pendingPolicies.length > 0 ? `${pendingPolicies.length} pending` : 'All active',
            subColor: pendingPolicies.length > 0 ? 'text-amber-400' : 'text-emerald-400',
            icon: Shield,
            iconColor: 'text-purple-400',
            bg: 'bg-purple-500/20',
          },
          {
            label: 'Total Coverage',
            value: `₹${(totalCoverage / 1000).toFixed(1)}K`,
            sub: 'Max payout',
            subColor: 'text-white/40',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
          },
          {
            label: 'Weekly Premium',
            value: `₹${totalPremium}`,
            sub: 'Auto-debit',
            subColor: 'text-white/40',
            icon: IndianRupee,
            iconColor: 'text-cyan-400',
            bg: 'bg-cyan-500/20',
          },
          {
            label: 'Pending Claims',
            value: pendingClaims.length,
            sub: 'Under review',
            subColor: 'text-amber-400',
            icon: Clock,
            iconColor: 'text-amber-400',
            bg: 'bg-amber-500/20',
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants} initial="hidden" animate="visible" custom={i}>
            <GlassCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${stat.subColor}`}>
                    {stat.sub}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Risk Score Card + Income Protected */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={4}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Weekly Risk Score</h3>
              <TrendingUp className="w-4 h-4 text-white/40" />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-bold ${riskColor}`}>{riskScore}</span>
              <span className="text-white/40 mb-1">/100</span>
            </div>
            <p className={`text-sm mt-2 font-medium ${riskColor}`}>{riskLabel}</p>
            <p className="text-xs text-white/40 mt-1">Based on your zone & season</p>
            {/* Mini progress bar */}
            <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  riskScore > 70 ? 'bg-red-500' : riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={5}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Income Protected</h3>
              <Wallet className="w-4 h-4 text-white/40" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              ₹{(stats?.incomeProtected || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-white/40 mt-2">Total payouts received</p>
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-white/60">
                This month: <span className="text-white font-medium">₹{(stats?.totalPayoutsThisMonth || 0).toLocaleString('en-IN')}</span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={6}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Claims This Month</h3>
              <FileText className="w-4 h-4 text-white/40" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalClaimsThisMonth ?? userClaims.length}</p>
            <p className="text-xs text-white/40 mt-2">Submitted claims</p>
            <div className="mt-3 pt-3 border-t border-white/5">
              <Link
                to="/dashboard/claims/new"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                File new claim <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Active Policies & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Policies */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={7}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">My Policies</h3>
                <p className="text-sm text-white/60">Active & pending approvals</p>
              </div>
              <Link to="/dashboard/policies" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {userPolicies.slice(0, 3).map((policy) => (
                <div key={policy._id} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white capitalize">{policy.tier} Plan</span>
                        {policy.status === 'active' && <StatusBadge status="success">Active</StatusBadge>}
                        {policy.status === 'pending' && <StatusBadge status="pending">Pending Approval</StatusBadge>}
                        {policy.status === 'expired' && <StatusBadge status="danger">Expired</StatusBadge>}
                        {policy.status === 'cancelled' && <StatusBadge status="danger">Cancelled</StatusBadge>}
                      </div>
                      <p className="text-xs text-white/40 mt-1">ID: {policy._id.slice(-8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">₹{policy.maxCoverage.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Max coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <div>
                      <p className="text-xs text-white/40">Weekly Premium</p>
                      <p className="text-sm text-white">₹{policy.weeklyPremium}/wk</p>
                    </div>
                    {policy.status === 'active' && (
                      <div>
                        <p className="text-xs text-white/40">Valid Until</p>
                        <p className="text-sm text-white">{new Date(policy.endDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    )}
                    <div className="ml-auto">
                      <p className="text-xs text-white/40">Coverage Used</p>
                      <p className="text-sm text-white">₹{policy.coverageUsed}</p>
                    </div>
                  </div>
                </div>
              ))}
              {userPolicies.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No policies yet</p>
                  <Link to="/dashboard/policies/new" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
                    Buy your first policy →
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Claims */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={8}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Claims</h3>
                <p className="text-sm text-white/60">Your claim history</p>
              </div>
              <Link to="/dashboard/claims" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {userClaims.slice(0, 3).map((claim) => (
                <div key={claim._id} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{claim.type}</span>
                        {claim.status === 'paid' && <StatusBadge status="success">Paid</StatusBadge>}
                        {claim.status === 'approved' && <StatusBadge status="info">Approved</StatusBadge>}
                        {claim.status === 'pending' && <StatusBadge status="pending">Pending</StatusBadge>}
                        {claim.status === 'processing' && <StatusBadge status="warning">Processing</StatusBadge>}
                        {claim.status === 'rejected' && <StatusBadge status="danger">Rejected</StatusBadge>}
                      </div>
                      <p className="text-xs text-white/40 mt-1">{new Date(claim.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${claim.status === 'paid' ? 'text-emerald-400' : claim.status === 'rejected' ? 'text-red-400' : 'text-white'}`}>
                        ₹{claim.payoutAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/60">
                        Fraud score: <span className={claim.fraudScore > 60 ? 'text-red-400' : claim.fraudScore > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                          {claim.fraudScore}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {userClaims.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No claims yet</p>
                  <Link to="/dashboard/claims/new" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
                    File a claim →
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Risk Forecast Strip */}
      {riskForecast.length > 0 && (
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={9}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">7-Day Risk Forecast</h3>
                <p className="text-sm text-white/60">Weather & disruption outlook for your zone</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {riskForecast.slice(0, 7).map((day: any, i: number) => {
                const d = new Date(day.date);
                const label = i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' });
                const color = day.riskLevel === 'severe' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : day.riskLevel === 'high' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : day.riskLevel === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
                const dot = day.riskLevel === 'severe' ? 'bg-red-500'
                  : day.riskLevel === 'high' ? 'bg-amber-500'
                  : day.riskLevel === 'medium' ? 'bg-yellow-500'
                  : 'bg-emerald-500';
                return (
                  <div key={i} className={`p-2 rounded-xl border text-center ${color}`}>
                    <p className="text-xs font-medium">{label}</p>
                    <div className={`w-2 h-2 rounded-full ${dot} mx-auto my-1.5`} />
                    <p className="text-xs capitalize">{day.riskLevel}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* GPS + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" variants={cardVariants} initial="hidden" animate="visible" custom={10}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  Live Location
                </h3>
                <p className="text-sm text-white/60">Real-time status tracking</p>
              </div>
              <Link to="/dashboard/gps" className="text-sm text-purple-400 hover:text-purple-300">View Details</Link>
            </div>
            <GPSMap />
          </GlassCard>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={11}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-cyan-400" />
                  Weather
                </h3>
                <p className="text-sm text-white/60">Local conditions</p>
              </div>
              <Link to="/dashboard/weather" className="text-sm text-purple-400 hover:text-purple-300">Monitor</Link>
            </div>
            <WeatherWidget />
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/policies/new', icon: PlusCircle, iconColor: 'text-purple-400', bg: 'bg-purple-500/20', border: 'hover:border-purple-500/40', title: 'Buy New Policy', sub: 'Browse Basic, Standard, Premium tiers' },
          { to: '/dashboard/claims/new', icon: FileText, iconColor: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'hover:border-cyan-500/40', title: 'File a Claim', sub: 'Submit for weather/AQI/disruption' },
          { to: '/dashboard/history', icon: Clock, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'hover:border-emerald-500/40', title: 'View History', sub: 'All past policies & payouts' },
        ].map((action, i) => (
          <motion.div key={action.title} variants={cardVariants} initial="hidden" animate="visible" custom={12 + i}>
            <Link to={action.to}>
              <GlassCard className={`h-full transition-colors ${action.border}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{action.title}</h4>
                    <p className="text-xs text-white/60">{action.sub}</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
