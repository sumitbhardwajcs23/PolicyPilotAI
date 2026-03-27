import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePoliciesApi } from '@/hooks/usePoliciesApi';
import { adminApi } from '@/services/api';
import { CheckCircle2, XCircle, RefreshCw, Search, Filter, Shield } from 'lucide-react';

const TIER_INFO: Record<string, { weekly: number; coverage: number; color: string }> = {
  basic:    { weekly: 49, coverage: 1500, color: 'text-blue-400' },
  standard: { weekly: 79, coverage: 2500, color: 'text-purple-400' },
  premium:  { weekly: 129, coverage: 4000, color: 'text-amber-400' },
};

export function AdminPolicies() {
  const { adminPolicies, loading, fetchAdminPolicies, approvePolicy, rejectPolicy } = usePoliciesApi();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [adminPerms, setAdminPerms] = useState<string[]>([]);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    fetchAdminPolicies(statusFilter || undefined);
    adminApi.getMe().then((res: any) => {
      setAdminPerms(res?.data?.permissions || []);
      setIsMaster(res?.data?.adminType === 'master');
    }).catch(() => {});
  }, [statusFilter]);

  const can = (p: string) => isMaster || adminPerms.includes(p);

  const filtered = adminPolicies.filter(p => {
    if (!search) return true;
    const workerName = typeof p.userId === 'object' ? (p.userId as any)?.name : '';
    return workerName.toLowerCase().includes(search.toLowerCase());
  });

  const COUNTS = {
    total: adminPolicies.length,
    pending: adminPolicies.filter(p => p.status === 'pending').length,
    active: adminPolicies.filter(p => p.status === 'active').length,
    rejected: adminPolicies.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Policy Management</h1>
          <p className="text-sm text-white/60">
            {COUNTS.pending} pending · {COUNTS.active} active · {COUNTS.rejected} rejected
          </p>
        </div>
        <button
          onClick={() => fetchAdminPolicies(statusFilter || undefined)}
          disabled={loading}
          className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: COUNTS.total, color: 'text-white' },
          { label: 'Pending', value: COUNTS.pending, color: 'text-amber-400' },
          { label: 'Active', value: COUNTS.active, color: 'text-emerald-400' },
          { label: 'Rejected', value: COUNTS.rejected, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <GlassCard key={label}>
            <p className="text-xs text-white/60 mb-1">{label} Policies</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by worker name..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="" className="bg-gray-900">All Policies</option>
              <option value="pending" className="bg-gray-900">Pending Approval</option>
              <option value="active" className="bg-gray-900">Active</option>
              <option value="expired" className="bg-gray-900">Expired</option>
              <option value="cancelled" className="bg-gray-900">Cancelled</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Policies List */}
      <GlassCard>
        <div className="space-y-3">
          {filtered.map((policy, i) => {
            const worker = typeof policy.userId === 'object' ? (policy.userId as any) : null;
            const tierInfo = TIER_INFO[policy.tier] || { weekly: policy.weeklyPremium, coverage: policy.maxCoverage, color: 'text-white' };

            return (
              <motion.div
                key={policy._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Shield className={`w-4 h-4 ${tierInfo.color}`} />
                      <span className={`text-sm font-semibold capitalize ${tierInfo.color}`}>{policy.tier} Plan</span>
                      {policy.status === 'active'    && <StatusBadge status="success">Active</StatusBadge>}
                      {policy.status === 'pending'   && <StatusBadge status="pending">Pending Approval</StatusBadge>}
                      {policy.status === 'expired'   && <StatusBadge status="danger">Expired</StatusBadge>}
                      {policy.status === 'cancelled' && <StatusBadge status="danger">Cancelled</StatusBadge>}
                    </div>
                    <div className="text-xs text-white/40 space-y-0.5">
                      <p>👤 {worker?.name || 'Unknown'} · {worker?.mobile || worker?.email || '—'}</p>
                      {worker?.platform && <p>🏍 Platform: {worker.platform} · Zone: {worker.zone}</p>}
                      <p>
                        💰 ₹{policy.weeklyPremium}/wk · Max Coverage: ₹{policy.maxCoverage.toLocaleString()} · 
                        {` Used: ₹${policy.coverageUsed}`}
                      </p>
                      <p>📅 Applied: {new Date(policy.createdAt).toLocaleDateString('en-IN')}</p>
                      {policy.status === 'active' && (
                        <p>✅ Valid until: {new Date(policy.endDate).toLocaleDateString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                  {can('manage_policies') && policy.status === 'pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => approvePolicy(policy._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => rejectPolicy(policy._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No policies found</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
