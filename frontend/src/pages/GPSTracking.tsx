import { GPSMap } from '@/components/gps/GPSMap';
import { WorkerList } from '@/components/gps/WorkerList';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useGPS } from '@/hooks/useGPS';
import { 
  MapPin, 
  Navigation, 
  AlertCircle,
  Users,
  Activity,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

export function GPSTracking() {
  const { workers, zones, isTracking, startTracking, stopTracking } = useGPS();

  const stats = {
    total: workers.length,
    active: workers.filter(w => w.status === 'active').length,
    alert: workers.filter(w => w.status === 'alert').length,
    inAlertZones: workers.filter(w => {
      const zone = zones.find(z => z.name === w.zone);
      return zone?.alertLevel === 'high' || zone?.alertLevel === 'medium';
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">GPS Live Tracking</h1>
          <p className="text-sm text-white/60">Real-time worker location monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          {isTracking ? (
            <button
              onClick={stopTracking}
              className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Stop Tracking
            </button>
          ) : (
            <button
              onClick={startTracking}
              className="px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Start Tracking
            </button>
          )}
          <StatusBadge status="success">GPS Active</StatusBadge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: stats.total, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { label: 'Active Now', value: stats.active, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
          { label: 'Alerts', value: stats.alert, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
          { label: 'In Alert Zones', value: stats.inAlertZones, icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants} initial="hidden" animate="visible" custom={i}>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-tight">{stat.value}</p>
                  <p className="text-xs font-medium text-white/70">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <GPSMap />
        </div>

        {/* Worker List */}
        <div className="lg:col-span-1">
          <WorkerList />
        </div>
      </div>

      {/* Geofencing Info */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={4}>
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Geofencing Zones
              </h3>
              <p className="text-sm font-medium text-white/70">Active monitoring zones and alert levels</p>
            </div>
            <StatusBadge status="info">{zones.length} Zones Active</StatusBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  zone.alertLevel === 'high' && 'bg-red-500/20 border-red-500/50',
                  zone.alertLevel === 'medium' && 'bg-amber-500/20 border-amber-500/50',
                  zone.alertLevel === 'none' && 'bg-emerald-500/20 border-emerald-500/50'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">{zone.name}</span>
                  {zone.alertLevel === 'high' && <StatusBadge status="danger">High Alert</StatusBadge>}
                  {zone.alertLevel === 'medium' && <StatusBadge status="warning">Medium Alert</StatusBadge>}
                  {zone.alertLevel === 'none' && <StatusBadge status="success">Normal</StatusBadge>}
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-white/80">
                  <span>
                    {workers.filter(w => w.zone === zone.name).length} workers
                  </span>
                  <span>
                    {workers.filter(w => w.zone === zone.name && w.status === 'active').length} active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* GPS Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Real-time Tracking</h4>
              <p className="text-xs font-medium text-white/70">Live location updates every 30 seconds using GPS and cellular triangulation</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Geofencing</h4>
              <p className="text-xs font-medium text-white/70">Automatic alerts when workers enter or leave designated zones</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Movement Analysis</h4>
              <p className="text-xs font-medium text-white/70">Detect stationary vs active status for claim validation</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
