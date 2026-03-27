import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useClaimsApi, type ApiClaim } from '@/hooks/useClaimsApi';
import { usePoliciesApi } from '@/hooks/usePoliciesApi';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Eye,
  PlusCircle,
  Calendar,
  IndianRupee,
  Shield,
  RefreshCw,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function UserClaims() {
  const { userClaims, loading: claimsLoading, fetchUserClaims } = useClaimsApi();
  const { userPolicies, loading: policiesLoading } = usePoliciesApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<ApiClaim | null>(null);

  const loading = claimsLoading || policiesLoading;

  const filteredClaims = userClaims.filter((claim) => {
    const matchesSearch = 
      claim._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.triggerType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <StatusBadge status="success">Paid</StatusBadge>;
      case 'approved':
        return <StatusBadge status="info">Approved</StatusBadge>;
      case 'pending':
        return <StatusBadge status="pending">Pending Review</StatusBadge>;
      case 'processing':
        return <StatusBadge status="warning">Processing</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="danger">Rejected</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const totalPayouted = userClaims
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.payoutAmount, 0);

  const activePoliciesCount = userPolicies.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Claims</h1>
          <p className="text-sm text-white/60">View and track your parametric payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUserClaims}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <Link
            to="/dashboard/claims/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:shadow-glow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Claim
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userClaims.length}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Submitted</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{totalPayouted.toLocaleString()}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Total Paid</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userClaims.filter(c => c.status === 'pending' || c.status === 'processing').length}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">In Progress</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activePoliciesCount}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Active Shields</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by Trigger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                statusFilter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Grid / Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Payout</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Risk Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <tr
                  key={claim._id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm font-semibold text-white capitalize">{claim.triggerType.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-emerald-400">₹{claim.payoutAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         'text-xs font-mono px-2 py-0.5 rounded-md',
                         claim.fraudScore > 60 ? 'bg-red-500/20 text-red-400' :
                         claim.fraudScore > 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                       )}>
                         {claim.fraudScore}%
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(claim.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-white/60">{new Date(claim.createdAt).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors text-white/40"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClaims.length === 0 && !loading && (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/60">No claims recorded yet.</p>
            <Link to="/dashboard/claims/new" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
              File a manual claim →
            </Link>
          </div>
        )}
      </GlassCard>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="bg-[#0a0a0b] border-white/10 max-w-lg shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Claim Review
            </DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Status</p>
                  {getStatusBadge(selectedClaim.status)}
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Manual Payout</p>
                  <p className="text-xl font-bold text-emerald-400">₹{selectedClaim.payoutAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Trigger Event</span>
                    <span className="text-white font-medium capitalize">{selectedClaim.triggerType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Risk Analysis</span>
                    <span className={cn('font-bold', selectedClaim.fraudScore > 50 ? 'text-red-400' : 'text-emerald-400')}>
                      {selectedClaim.fraudScore}% {selectedClaim.fraudScore > 50 ? '(High)' : '(Low)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Incident Zone</span>
                    <span className="text-white font-medium">{selectedClaim.location?.zone || 'Delhi'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Internal Assessment</p>
                  <p className="text-sm text-white/80 leading-relaxed italic">
                    "{selectedClaim.triggerDescription || 'No additional notes provided by the system.'}"
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div className="text-xs text-purple-200/70">
                    <p className="font-bold text-white/80">Location Fingerprint</p>
                    <p>{selectedClaim.location?.lat.toFixed(4)}, {selectedClaim.location?.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Submitted On</p>
                  <p className="text-xs text-white font-medium">{new Date(selectedClaim.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Processed By</p>
                  <p className="text-xs text-white font-medium">GigShield AI Core v2.4</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedClaim(null)}
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all"
              >
                Close Summary
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
