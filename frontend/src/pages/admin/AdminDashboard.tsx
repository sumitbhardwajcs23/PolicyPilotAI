import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePoliciesApi } from '@/hooks/usePoliciesApi';
import { useClaimsApi } from '@/hooks/useClaimsApi';
import { adminApi } from '@/services/api';
import { Link } from 'react-router-dom';
import {
  Shield, Users, CheckCircle2, Clock, AlertCircle,
  ArrowRight, UserCog, Activity, Database, Globe,
  Zap, RefreshCw, IndianRupee, BarChart2, MapPin, Crown, Lock
} from 'lucide-react';
import { GPSMap } from '@/components/gps/GPSMap';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';
// import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.07, duration: 0.4 } }),
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const { pendingApplications, fetchAdminPolicies, approvePolicy, rejectPolicy } = usePoliciesApi();
  const { pendingClaims, fetchAdminClaims, approveClaim, rejectClaim } = useClaimsApi();

  const isMaster = adminInfo?.adminType === 'master';
  const permissions: string[] = adminInfo?.permissions || [];
  const can = (p: string) => isMaster || permissions.includes(p);

  const loadAll = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [statsRes, meRes] = await Promise.all([adminApi.getStats(), adminApi.getMe()]) as any[];
      setStats(statsRes?.data);
      setAdminInfo(meRes?.data);
    } catch { }
    setStatsLoading(false);
    fetchAdminPolicies('pending');
    fetchAdminClaims('pending');
  }, [fetchAdminPolicies, fetchAdminClaims]);

  useEffect(() => { loadAll(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            {isMaster ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/20 border border-amber-500/30 rounded-full px-2 py-0.5">
                <Crown className="w-3 h-3" /> Master
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/20 border border-blue-500/30 rounded-full px-2 py-0.5">
                <Lock className="w-3 h-3" /> Slave
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">
            {adminInfo?.name || user?.name} · {isMaster ? 'Full access' : `${permissions.length} permission(s) granted`}
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={statsLoading}
          className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: stats?.totalUsers ?? '—', sub: `${stats?.activeWorkers ?? 0} active`, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { label: 'Active Policies', value: stats?.activePolicies ?? '—', sub: `${stats?.pendingPolicies ?? 0} pending`, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
          { label: 'Pending Claims', value: stats?.pendingClaims ?? '—', sub: 'Need review', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
          { label: 'Total Payouts', value: `₹${((stats?.totalPayouts || 0) / 1000).toFixed(1)}K`, sub: `Loss ratio ${stats?.lossRatio ?? 0}%`, icon: IndianRupee, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants} initial="hidden" animate="visible" custom={i}>
            <GlassCard className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs font-medium text-white/60 mt-2">{stat.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts + Approval Queues */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={4}>
            <OverviewCharts />
          </motion.div>

          {/* Pending Policy Approvals */}
          {can('manage_policies') && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={5}>
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Pending Policy Approvals</h3>
                    <p className="text-sm font-medium text-white/70">{pendingApplications.length} awaiting review</p>
                  </div>
                  <Link to="/admin/policies" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingApplications.slice(0, 5).map((policy) => {
                    const workerName = typeof policy.userId === 'object' ? (policy.userId as any)?.name : 'Worker';
                    return (
                      <div key={policy._id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white capitalize">{policy.tier} Plan</span>
                              <StatusBadge status="pending">Pending</StatusBadge>
                            </div>
                            <p className="text-xs font-medium text-white/60 mt-0.5">{workerName} · ₹{policy.weeklyPremium}/wk · Max ₹{policy.maxCoverage.toLocaleString()}</p>
                  </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => approvePolicy(policy._id)}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectPolicy(policy._id)}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {pendingApplications.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                      <p className="text-sm text-white/40">All policies reviewed</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Pending Claim Approvals */}
          {can('manage_claims') && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={6}>
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Pending Claim Reviews</h3>
                    <p className="text-sm font-medium text-white/70">{pendingClaims.length} awaiting decision</p>
                  </div>
                  <Link to="/admin/claims" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingClaims.slice(0, 5).map((claim) => {
                    const workerName = typeof claim.userId === 'object' ? (claim.userId as any)?.name : 'Worker';
                    const fraudScore = claim.fraudScore;
                    const fraudColor = fraudScore > 60 ? 'text-red-400 bg-red-500/10 border-red-500/20'
                      : fraudScore > 30 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                    return (
                      <div key={claim._id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{claim.type}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${fraudColor}`}>
                                Fraud {fraudScore}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-white/60 mt-1">
                              {workerName} · ₹{claim.payoutAmount.toLocaleString()} · {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => approveClaim(claim._id)}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectClaim(claim._id)}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {pendingClaims.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                      <p className="text-sm text-white/40">All claims reviewed</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* GPS Map */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={7}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Live Worker Tracking
                  </h3>
                  <p className="text-sm text-white/60">Real-time worker locations</p>
                </div>
                <Link to="/admin/gps" className="text-sm text-purple-400 hover:text-purple-300">Monitor</Link>
              </div>
              <div className="h-[280px]">
                <GPSMap />
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right: Side Panel */}
        <div className="space-y-6">
          {/* System Health */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={8}>
            <GlassCard>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  System Health
                </h3>
                <p className="text-sm font-medium text-white/70">Live infrastructure status</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'API Services', status: 'Optimal', icon: Zap, color: 'text-emerald-400' },
                  { name: 'MongoDB', status: 'Stable', icon: Database, color: 'text-cyan-400' },
                  { name: 'CDN', status: 'Online', icon: Globe, color: 'text-purple-400' },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <service.icon className={`w-4 h-4 ${service.color}`} />
                      <span className="text-sm text-white/80">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-emerald-400">{service.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Fraud Detection Rate</span>
                  <span>{stats?.fraudDetectionRate ?? 95.5}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{ width: `${stats?.fraudDetectionRate ?? 95.5}%` }} />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Weather Widget */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={9}>
            <WeatherWidget />
          </motion.div>

          {/* Admin Quick Actions */}
          <div className="space-y-3">
            {can('view_users') && (
              <Link to="/admin/users">
                <GlassCard className="hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">User Management</h4>
                      <p className="text-xs text-white/60">{stats?.totalUsers ?? 0} workers registered</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
                  </div>
                </GlassCard>
              </Link>
            )}
            {isMaster && (
              <Link to="/admin/admins">
                <GlassCard className="hover:border-amber-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Manage Admins</h4>
                      <p className="text-xs text-white/60">{stats?.totalAdmins ?? 0} admins · master controls</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
                  </div>
                </GlassCard>
              </Link>
            )}
            <Link to="/admin/analytics">
              <GlassCard className="hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Analytics</h4>
                    <p className="text-xs text-white/60">Loss ratios & trends</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
                </div>
              </GlassCard>
            </Link>
            {can('manage_parametric') && (
              <Link to="/admin/settings">
                <GlassCard className="hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Trigger Settings</h4>
                      <p className="text-xs text-white/60">Configure parametric thresholds</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
                  </div>
                </GlassCard>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
