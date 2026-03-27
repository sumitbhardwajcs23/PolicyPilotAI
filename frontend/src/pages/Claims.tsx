import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockClaims, mockTriggers } from '@/services/mockData';
import { 
  Filter, 
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CloudRain,
  Thermometer,
  Wind,
  Waves,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const triggerIcons: Record<string, React.ElementType> = {
  'Heavy Rainfall': CloudRain,
  'Extreme Heat': Thermometer,
  'Severe Pollution': Wind,
  'Flooding': Waves,
  'Social Disruption': Users,
};

export function Claims() {
  const [activeTab, setActiveTab] = useState<'all' | 'triggers' | 'automation'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredClaims = mockClaims.filter(claim => 
    statusFilter === 'all' || claim.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'auto_approved':
        return <StatusBadge status="success">Auto-Approved</StatusBadge>;
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Claims Management</h1>
          <p className="text-sm text-white/60">Parametric insurance claim processing</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <StatusBadge status="success">{mockClaims.length} Total</StatusBadge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 w-fit">
        {[
          { id: 'all', label: 'All Claims', count: mockClaims.length },
          { id: 'triggers', label: 'Parametric Triggers', count: mockTriggers.length },
          { id: 'automation', label: 'Automation', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/10 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* All Claims Tab */}
      {activeTab === 'all' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none"
              >
                <option value="all" className="bg-gray-900">All Status</option>
                <option value="auto_approved" className="bg-gray-900">Auto-Approved</option>
                <option value="approved" className="bg-gray-900">Approved</option>
                <option value="pending" className="bg-gray-900">Pending</option>
                <option value="under_review" className="bg-gray-900">Under Review</option>
                <option value="rejected" className="bg-gray-900">Rejected</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 text-sm font-medium text-white/60">Claim ID</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Worker</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Zone</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Trigger</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Amount</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Risk Score</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Status</th>
                    <th className="pb-3 text-sm font-medium text-white/60">Date</th>
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
                        <span className="text-sm text-white/70">{claim.zone}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-white/70">{claim.triggerType}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-mono text-white">
                          ₹{claim.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          'text-sm font-mono',
                          claim.riskScore >= 70 ? 'text-red-400' :
                          claim.riskScore >= 31 ? 'text-amber-400' :
                          'text-emerald-400'
                        )}>
                          {claim.riskScore}
                        </span>
                      </td>
                      <td className="py-3">
                        {getStatusBadge(claim.status)}
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-white/60">{formatDate(claim.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {/* Parametric Triggers Tab */}
      {activeTab === 'triggers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTriggers.map((trigger) => {
            const Icon = triggerIcons[trigger.name] || CloudRain;
            return (
              <GlassCard key={trigger.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <StatusBadge status={trigger.status === 'active' ? 'success' : 'neutral'}>
                    {trigger.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{trigger.name}</h4>
                <p className="text-sm text-white/60 mb-4">{trigger.parameter}</p>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 mb-1">Threshold</p>
                  <p className="text-sm font-medium text-white">{trigger.threshold}</p>
                </div>
                {trigger.lastTriggered && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Last triggered: {formatDate(trigger.lastTriggered)}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Automation Settings</h3>
                <p className="text-sm text-white/60">Configure automatic claim processing rules</p>
              </div>
              <StatusBadge status="success">Enabled</StatusBadge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Auto-approve Low Risk</p>
                  <p className="text-xs text-white/60">Automatically approve claims with risk score 0-30</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-emerald-500/30 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Flag for Review</p>
                  <p className="text-xs text-white/60">Flag claims with risk score 31-70 for manual review</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-emerald-500/30 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Auto-reject High Risk</p>
                  <p className="text-xs text-white/60">Automatically reject claims with risk score 71-100</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-emerald-500/30 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">68%</p>
                  <p className="text-sm text-white/60">Auto-approved</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">27%</p>
                  <p className="text-sm text-white/60">Manual Review</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">5%</p>
                  <p className="text-sm text-white/60">Auto-rejected</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
