import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/services/api';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Users,
  CheckCircle2
} from 'lucide-react';

interface ParametricEvent {
  _id: string;
  type: string;
  zone: string;
  intensity: number;
  threshold: number;
  status: 'active' | 'resolved';
  affectedWorkers: number;
  totalEstimatedPayout: number;
  createdAt: string;
}

interface ZoneStat {
  zone: string;
  userCount: number;
}


export function Weather() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ParametricEvent[]>([]);
  const [zones, setZones] = useState<ZoneStat[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'insurer';
  const userZone = user?.zone || 'Gurgaon';

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, zonesRes] = await Promise.all([
        adminApi.getParametricEvents(),
        adminApi.getZones()
      ]) as any[];
      setEvents(eventsRes.data || []);
      setZones(zonesRes.data || []);
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter triggers: Admin sees all active, Worker sees their zone
  const activeTriggers = events.filter(e => {
    if (isAdmin) return e.status === 'active';
    return e.status === 'active' && e.zone === userZone;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'heavy_rain': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'extreme_heat': return <Thermometer className="w-5 h-5 text-orange-400" />;
      case 'severe_pollution': return <Wind className="w-5 h-5 text-purple-400" />;
      case 'flooding': return <Droplets className="w-5 h-5 text-cyan-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getEventLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Weather Monitor</h1>
          <p className="text-sm text-white/60">
            {isAdmin ? 'System-wide threshold monitoring across all zones' : `Real-time tracking for ${userZone}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} disabled={loading} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <RefreshCw className={`w-4 h-4 text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {activeTriggers.length > 0 ? (
            <StatusBadge status="warning">{activeTriggers.length} Trigger{activeTriggers.length > 1 ? 's' : ''} Active</StatusBadge>
          ) : (
            <StatusBadge status="success">Normal</StatusBadge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>

        {/* Parametric Triggers */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Parametric Triggers
                </h3>
                <p className="text-sm text-white/60">Real-time threshold monitoring</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4" />
                {isAdmin ? 'All Operational Zones' : `${userZone}, India`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTriggers.length > 0 ? (
                activeTriggers.map((event) => (
                  <div key={event._id} className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{getEventLabel(event.type)}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">{event.zone}</span>
                      </div>
                      <StatusBadge status="warning">Triggered</StatusBadge>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {event.intensity}{event.type === 'extreme_heat' ? '°C' : event.type === 'heavy_rain' ? ' mm' : ''}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mt-1">
                          <Users className="w-3 h-3" />
                          <span>{event.affectedWorkers} Workers Impacted</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        {getEventIcon(event.type)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white/4 border border-white/8 rounded-2xl border-dashed">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mb-3" />
                  <p className="text-sm text-white/40">No active parametric triggers detected</p>
                  <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">System Stable</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Weather Alerts */}
      <WeatherAlerts />

      {/* API Integration Info */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">API Integration Status</h3>
            <p className="text-sm text-white/60">Connected weather data providers</p>
          </div>
          <StatusBadge status="success">Connected</StatusBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <CloudRain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">OpenWeatherMap</p>
                <p className="text-xs text-white/60">Primary Provider</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Polling every 5 min
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">IMD India</p>
                <p className="text-xs text-white/60">Secondary Provider</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Standby mode
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Wind className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">CPCB AQI</p>
                <p className="text-xs text-white/60">Air Quality Data</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Real-time updates
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
