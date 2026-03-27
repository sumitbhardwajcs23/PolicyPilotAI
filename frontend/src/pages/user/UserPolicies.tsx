import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePoliciesApi, type ApiPolicy } from '@/hooks/usePoliciesApi';
import { 
  Shield, 
  Search, 
  Eye,
  Download,
  FileText,
  Calendar,
  IndianRupee,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function UserPolicies() {
  const { userPolicies, loading, fetchUserPolicies, cancelPolicy } = usePoliciesApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<ApiPolicy | null>(null);

  const filteredPolicies = userPolicies.filter((policy) => {
    const matchesSearch = 
      policy._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.tier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Active</StatusBadge>;
      case 'expired':
        return <StatusBadge status="neutral">Expired</StatusBadge>;
      case 'cancelled':
        return <StatusBadge status="danger">Cancelled</StatusBadge>;
      case 'pending':
        return <StatusBadge status="pending">Pending Approval</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="danger">Rejected</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const handleCancelLine = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this policy? Auto-renewal will be disabled immediately.')) {
      const success = await cancelPolicy(id);
      if (success) {
        setSelectedPolicy(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Shields</h1>
          <p className="text-sm text-white/60">Manage your active parametric insurance policies</p>
        </div>
        <button
          onClick={fetchUserPolicies}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by ID or Tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                statusFilter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolicies.map((policy) => (
          <GlassCard key={policy._id} className="relative group overflow-hidden">
            {policy.status === 'active' && (
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                <div className="absolute top-[-10px] right-[-30px] w-24 h-6 bg-emerald-500/20 rotate-45 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-emerald-400">SECURE</span>
                </div>
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                policy.tier === 'premium' ? 'from-amber-500 to-orange-500' : 
                policy.tier === 'standard' ? 'from-purple-500 to-indigo-500' : 
                'from-blue-500 to-cyan-500'
              )}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              {getStatusBadge(policy.status)}
            </div>

            <h3 className="text-lg font-bold text-white capitalize mb-1">{policy.tier} Shield</h3>
            <p className="text-[10px] text-white/40 mb-4 font-mono">ID: {policy._id}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Weekly Premium</span>
                <span className="text-sm font-bold text-white">₹{policy.weeklyPremium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Coverage Remaining</span>
                <span className="text-sm font-bold text-emerald-400">₹{policy.coverageRemaining.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Valid Until</span>
                <span className="text-sm text-white/80">{new Date(policy.endDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/5">
              <button
                onClick={() => setSelectedPolicy(policy)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Details
              </button>
              {policy.status === 'active' && (
                <button 
                  onClick={() => handleCancelLine(policy._id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Cancel Policy"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredPolicies.length === 0 && !loading && (
        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
          <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-white font-medium">No shields found</h3>
          <p className="text-sm text-white/40 mt-1">Activate a new shield to protect your earnings.</p>
        </div>
      )}

      {/* Policy Detail Dialog */}
      <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
        <DialogContent className="bg-[#0a0a0b] border-white/10 max-w-lg shadow-2xl overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className={cn('w-5 h-5', 
                selectedPolicy?.tier === 'premium' ? 'text-amber-400' : 
                selectedPolicy?.tier === 'standard' ? 'text-purple-400' : 'text-blue-400'
              )} />
              Shield Configuration
            </DialogTitle>
          </DialogHeader>
          
          {selectedPolicy && (
            <div className="p-6 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Weekly Cost</p>
                  <p className="text-xl font-bold text-white">₹{selectedPolicy.weeklyPremium}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Max Benefit</p>
                  <p className="text-xl font-bold text-emerald-400">₹{selectedPolicy.maxCoverage.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Status</span>
                  {getStatusBadge(selectedPolicy.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Auto-Renewal</span>
                  <span className={cn('font-medium', selectedPolicy.autoRenewal ? 'text-emerald-400' : 'text-red-400')}>
                    {selectedPolicy.autoRenewal ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Coverage Used</span>
                  <span className="text-white font-medium">₹{selectedPolicy.coverageUsed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Events Allowed / Wk</span>
                  <span className="text-white font-medium">{selectedPolicy.eventsPerWeek}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Activation Date</span>
                  <span className="text-white">{new Date(selectedPolicy.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Next Renewal</span>
                  <span className="text-white">{new Date(selectedPolicy.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setSelectedPolicy(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                >
                  Close
                </button>
                {selectedPolicy.status === 'active' && (
                  <button 
                    onClick={() => handleCancelLine(selectedPolicy._id)}
                    className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all"
                  >
                    Terminate Shield
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
