import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useClaimsApi } from '@/hooks/useClaimsApi';
import { adminApi } from '@/services/api';
import { CheckCircle2, XCircle, CreditCard, RefreshCw, Search, Filter, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const TRIGGER_LABELS: Record<string, string> = {
  heavy_rain: '🌧 Heavy Rain',
  extreme_heat: '🌡 Extreme Heat',
  severe_pollution: '😷 Severe Pollution',
  flooding: '🌊 Flooding',
  social_disruption: '🚧 Social Disruption',
};

export function AdminClaims() {
  const { adminClaims, loading, fetchAdminClaims, approveClaim, rejectClaim, markAsPaid } = useClaimsApi();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [adminPerms, setAdminPerms] = useState<string[]>([]);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    fetchAdminClaims(statusFilter || undefined);
    adminApi.getMe().then((res: any) => {
      setAdminPerms(res?.data?.permissions || []);
      setIsMaster(res?.data?.adminType === 'master');
    }).catch(() => {});
  }, [statusFilter]);

  const can = (p: string) => isMaster || adminPerms.includes(p);

  const filtered = adminClaims.filter(c => {
    if (!search) return true;
    const workerName = typeof c.userId === 'object' ? (c.userId as any)?.name : '';
    return workerName.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
  });

  const statusOptions = ['', 'pending', 'approved', 'rejected', 'paid'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Claims Management</h1>
          <p className="text-sm text-white/60">{adminClaims.length} claim(s) · review and approve/reject</p>
        </div>
        <button
          onClick={() => fetchAdminClaims(statusFilter || undefined)}
          disabled={loading}
          className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by worker name or claim type..."
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
              {statusOptions.map(s => (
                <option key={s} value={s} className="bg-gray-900">{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Claims'}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Claims Table */}
      <GlassCard>
        <div className="space-y-3">
          {filtered.map((claim, i) => {
            const worker = typeof claim.userId === 'object' ? (claim.userId as any) : null;
            const policy = typeof claim.policyId === 'object' ? (claim.policyId as any) : null;
            const fraudScore = claim.fraudScore;
            const fraudColor = fraudScore > 60 ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : fraudScore > 30 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

            return (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-white">{TRIGGER_LABELS[claim.triggerType] || claim.type}</span>
                      {claim.status === 'paid' && <StatusBadge status="success">Paid</StatusBadge>}
                      {claim.status === 'approved' && <StatusBadge status="info">Approved</StatusBadge>}
                      {claim.status === 'pending' && <StatusBadge status="pending">Pending</StatusBadge>}
                      {claim.status === 'processing' && <StatusBadge status="warning">Processing</StatusBadge>}
                      {claim.status === 'rejected' && <StatusBadge status="danger">Rejected</StatusBadge>}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${fraudColor}`}>
                        Fraud Score: {fraudScore}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 space-y-0.5">
                      <p>👤 {worker?.name || 'Unknown'} · {worker?.mobile || worker?.email || '—'}</p>
                      {worker?.upiId && <p>💳 UPI: {worker.upiId}</p>}
                      <p>📍 {claim.location?.zone || '—'} · 📅 {new Date(claim.createdAt).toLocaleString('en-IN')}</p>
                      {policy && <p>📜 {policy.tier} Plan · Max ₹{policy.maxCoverage}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-lg font-bold text-white">₹{claim.payoutAmount.toLocaleString('en-IN')}</p>
                    {fraudScore > 60 && (
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        High risk
                      </div>
                    )}
                    {can('manage_claims') && claim.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveClaim(claim._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => rejectClaim(claim._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                    {can('manage_claims') && claim.status === 'approved' && (
                      <button
                        onClick={() => markAsPaid(claim._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                      >
                        <CreditCard className="w-3 h-3" /> Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No claims found</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
