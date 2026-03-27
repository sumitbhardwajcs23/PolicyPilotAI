import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePolicies } from '@/hooks/usePolicies';
import { useClaims } from '@/hooks/useClaims';
import { 
  History, 
  Search, 
  Shield,
  FileText,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  type: 'policy' | 'claim' | 'payment';
  title: string;
  description: string;
  amount?: number;
  status: string;
  date: Date;
}

export function UserHistory() {
  const { userPolicies } = usePolicies();
  const { userClaims } = useClaims();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Combine policies and claims into history items
  const historyItems: HistoryItem[] = [
    ...userPolicies.map(p => ({
      id: p.id,
      type: 'policy' as const,
      title: `${p.type.charAt(0).toUpperCase() + p.type.slice(1)} Insurance`,
      description: `Policy ${p.status}`,
      amount: p.premium,
      status: p.status,
      date: p.createdAt,
    })),
    ...userClaims.map(c => ({
      id: c.id,
      type: 'claim' as const,
      title: c.type,
      description: c.description,
      amount: c.amount,
      status: c.status,
      date: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return <StatusBadge status="success">{status}</StatusBadge>;
      case 'approved':
        return <StatusBadge status="info">{status}</StatusBadge>;
      case 'pending':
        return <StatusBadge status="pending">{status}</StatusBadge>;
      case 'under_review':
        return <StatusBadge status="warning">{status}</StatusBadge>;
      case 'rejected':
      case 'cancelled':
        return <StatusBadge status="danger">{status}</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'claim':
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'payment':
        return <IndianRupee className="w-5 h-5 text-emerald-400" />;
      default:
        return <History className="w-5 h-5 text-white/40" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-sm text-white/60">View your complete activity history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userPolicies.length}</p>
              <p className="text-xs text-white/60">Total Policies</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userClaims.length}</p>
              <p className="text-xs text-white/60">Total Claims</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                ₹{(userClaims.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.paidAmount || 0), 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-white/60">Total Received</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                ₹{(userPolicies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.premium, 0)).toLocaleString()}
              </p>
              <p className="text-xs text-white/60">Monthly Premium</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
        >
          <option value="all" className="bg-gray-900">All Types</option>
          <option value="policy" className="bg-gray-900">Policies</option>
          <option value="claim" className="bg-gray-900">Claims</option>
        </select>
      </div>

      {/* History List */}
      <GlassCard>
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                item.type === 'policy' && 'bg-purple-500/20',
                item.type === 'claim' && 'bg-cyan-500/20',
                item.type === 'payment' && 'bg-emerald-500/20'
              )}>
                {getTypeIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">{item.title}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{item.description}</p>
                  </div>
                  {item.amount && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">₹{item.amount.toLocaleString()}</p>
                      <p className="text-xs text-white/40">
                        {item.type === 'policy' ? 'Premium' : 'Amount'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <span className="text-xs text-white/40 font-mono">{item.id}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-lg text-white/60">No history found</p>
              <p className="text-sm text-white/40">Your activity will appear here</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
