import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePayments } from '@/hooks/usePayments';
import { 
  Search, 
  Download, 
  Eye,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function TransactionTable() {
  const { transactions, loading, refreshTransactions, selectTransaction, selectedTransaction } = usePayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = 
      txn.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <StatusBadge status="success">Success</StatusBadge>;
      case 'pending':
        return <StatusBadge status="pending">Pending</StatusBadge>;
      case 'failed':
        return <StatusBadge status="danger">Failed</StatusBadge>;
      default:
        return <StatusBadge status="neutral">Unknown</StatusBadge>;
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
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Recent Transactions
          </h3>
          <p className="text-sm font-medium text-white/70">Payment history via Razorpay</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshTransactions}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 text-white/60', loading && 'animate-spin')} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
        >
          <option value="all" className="bg-gray-900">All Status</option>
          <option value="success" className="bg-gray-900">Success</option>
          <option value="pending" className="bg-gray-900">Pending</option>
          <option value="failed" className="bg-gray-900">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10 uppercase tracking-wider">
              <th className="pb-3 text-[10px] font-bold text-white/80">Transaction ID</th>
              <th className="pb-3 text-[10px] font-bold text-white/80">Worker</th>
              <th className="pb-3 text-[10px] font-bold text-white/80">Purpose</th>
              <th className="pb-3 text-[10px] font-bold text-white/80">Amount</th>
              <th className="pb-3 text-[10px] font-bold text-white/80">Status</th>
              <th className="pb-3 text-[10px] font-bold text-white/80">Time</th>
              <th className="pb-3 text-[10px] font-bold text-white/80">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr
                key={txn.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3">
                  <span className="text-sm font-bold font-mono text-white/90">{txn.id}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-white">{txn.workerName}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-white/70">{txn.purpose}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm font-mono text-white">
                    ₹{txn.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3">
                  {getStatusBadge(txn.status)}
                </td>
                <td className="py-3">
                  <span className="text-sm font-medium text-white/70">{formatDate(txn.createdAt)}</span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => selectTransaction(txn)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white/60" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">No transactions found</p>
        </div>
      )}

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => selectTransaction(null)}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-sm text-white/60 mb-1">Amount</p>
                <p className="text-3xl font-bold text-white">
                  ₹{selectedTransaction.amount.toLocaleString()}
                </p>
                {getStatusBadge(selectedTransaction.status)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/60">Transaction ID</span>
                  <span className="text-sm font-mono text-white">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/60">Worker</span>
                  <span className="text-sm text-white">{selectedTransaction.workerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/60">Purpose</span>
                  <span className="text-sm text-white">{selectedTransaction.purpose}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/60">Date & Time</span>
                  <span className="text-sm text-white">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                {selectedTransaction.razorpayOrderId && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Razorpay Order ID</span>
                    <span className="text-sm font-mono text-white/80">
                      {selectedTransaction.razorpayOrderId}
                    </span>
                  </div>
                )}
                {selectedTransaction.razorpayPaymentId && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-white/60">Razorpay Payment ID</span>
                    <span className="text-sm font-mono text-white/80">
                      {selectedTransaction.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
}
