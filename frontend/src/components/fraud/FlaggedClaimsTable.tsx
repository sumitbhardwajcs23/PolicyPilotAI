import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye,
  AlertTriangle,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function FlaggedClaimsTable() {
  const { flaggedClaims, approveClaim, rejectClaim, selectClaim, selectedClaim } = useFraudDetection();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const filteredClaims = flaggedClaims.filter((claim) => {
    const matchesSearch = 
      claim.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.zone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = 
      riskFilter === 'all' ||
      (riskFilter === 'high' && claim.riskScore >= 70) ||
      (riskFilter === 'medium' && claim.riskScore >= 31 && claim.riskScore < 70) ||
      (riskFilter === 'low' && claim.riskScore <= 30);
    
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (score: number) => {
    if (score >= 71) return <StatusBadge status="danger">High ({score})</StatusBadge>;
    if (score >= 31) return <StatusBadge status="warning">Medium ({score})</StatusBadge>;
    return <StatusBadge status="success">Low ({score})</StatusBadge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <StatusBadge status="success">Approved</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="danger">Rejected</StatusBadge>;
      case 'under_review':
        return <StatusBadge status="info">Under Review</StatusBadge>;
      default:
        return <StatusBadge status="pending">Pending</StatusBadge>;
    }
  };

  return (
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Flagged Claims
          </h3>
          <p className="text-sm text-white/60">{filteredClaims.length} claims requiring attention</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
          >
            <option value="all" className="bg-gray-900">All Risk</option>
            <option value="high" className="bg-gray-900">High Risk</option>
            <option value="medium" className="bg-gray-900">Medium Risk</option>
            <option value="low" className="bg-gray-900">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="pb-3 text-sm font-medium text-white/60">Claim ID</th>
              <th className="pb-3 text-sm font-medium text-white/60">Worker</th>
              <th className="pb-3 text-sm font-medium text-white/60">Zone</th>
              <th className="pb-3 text-sm font-medium text-white/60">Amount</th>
              <th className="pb-3 text-sm font-medium text-white/60">Risk Score</th>
              <th className="pb-3 text-sm font-medium text-white/60">Flags</th>
              <th className="pb-3 text-sm font-medium text-white/60">Status</th>
              <th className="pb-3 text-sm font-medium text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((claim) => (
              <tr
                key={claim.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3">
                  <span className="text-sm font-mono text-white/80">{claim.id}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-white">{claim.workerName}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5 text-sm text-white/70">
                    <MapPin className="w-3.5 h-3.5" />
                    {claim.zone}
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-sm font-mono text-white">
                    ₹{claim.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3">
                  {getRiskBadge(claim.riskScore)}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {claim.flags.slice(0, 2).map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-white/5 text-white/60 rounded-full"
                      >
                        {flag}
                      </span>
                    ))}
                    {claim.flags.length > 2 && (
                      <span className="px-2 py-0.5 text-xs bg-white/5 text-white/60 rounded-full">
                        +{claim.flags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  {getStatusBadge(claim.status)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectClaim(claim)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-white/60" />
                    </button>
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveClaim(claim.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => rejectClaim(claim.id)}
                          className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredClaims.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">No flagged claims found</p>
        </div>
      )}

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => selectClaim(null)}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Claim Details
            </DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/60 mb-1">Claim ID</p>
                  <p className="text-sm font-mono text-white">{selectedClaim.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/60 mb-1">Amount</p>
                  <p className="text-sm font-mono text-white">
                    ₹{selectedClaim.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/60 mb-1">Worker</p>
                <p className="text-sm text-white">{selectedClaim.workerName}</p>
                <p className="text-xs text-white/40 mt-1">ID: {selectedClaim.workerId}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/60 mb-2">Risk Flags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-sm bg-red-500/15 text-red-400 rounded-lg"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    approveClaim(selectedClaim.id);
                    selectClaim(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Claim
                </button>
                <button
                  onClick={() => {
                    rejectClaim(selectedClaim.id);
                    selectClaim(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Claim
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
}
