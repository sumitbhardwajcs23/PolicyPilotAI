import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useGPS } from '@/hooks/useGPS';
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkerList() {
  const { workers, selectedWorker, selectWorker, refreshLocations, loading } = useGPS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.zone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Active</StatusBadge>;
      case 'alert':
        return <StatusBadge status="danger">Alert</StatusBadge>;
      default:
        return <StatusBadge status="neutral">Inactive</StatusBadge>;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <GlassCard className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Workers</h3>
          <p className="text-sm text-white/60">{filteredWorkers.length} workers found</p>
        </div>
        <button
          onClick={refreshLocations}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={cn('w-4 h-4 text-white/60', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search workers..."
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
          <option value="active" className="bg-gray-900">Active</option>
          <option value="alert" className="bg-gray-900">Alert</option>
          <option value="inactive" className="bg-gray-900">Inactive</option>
        </select>
      </div>

      {/* Worker List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            onClick={() => selectWorker(worker)}
            className={cn(
              'p-3 rounded-xl cursor-pointer transition-all duration-200',
              selectedWorker?.id === worker.id
                ? 'bg-purple-500/20 border border-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{worker.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/60">{worker.zone}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(worker.status)}
            </div>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Phone className="w-3 h-3" />
                {worker.phone}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="w-3 h-3" />
                {formatTime(worker.lastUpdate)}
              </div>
            </div>
          </div>
        ))}
        
        {filteredWorkers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-white/40">No workers found</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
