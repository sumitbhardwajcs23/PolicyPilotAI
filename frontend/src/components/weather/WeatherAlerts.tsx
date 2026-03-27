import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useWeather } from '@/hooks/useWeather';
import { AlertTriangle, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WeatherAlerts() {
  const { weather } = useWeather();

  const alerts = weather?.alerts || [];

  // Mock zone alerts data
  const zoneAlerts = [
    {
      id: 'ZA001',
      zone: 'Andheri West',
      condition: 'Heavy Rain',
      severity: 'high' as const,
      status: 'active',
      affectedWorkers: 45,
    },
    {
      id: 'ZA002',
      zone: 'Bandra',
      condition: 'Flooding',
      severity: 'critical' as const,
      status: 'active',
      affectedWorkers: 32,
    },
    {
      id: 'ZA003',
      zone: 'Andheri East',
      condition: 'Moderate Rain',
      severity: 'medium' as const,
      status: 'monitoring',
      affectedWorkers: 28,
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <StatusBadge status="danger">Critical</StatusBadge>;
      case 'high':
        return <StatusBadge status="warning">High</StatusBadge>;
      case 'medium':
        return <StatusBadge status="info">Medium</StatusBadge>;
      default:
        return <StatusBadge status="neutral">Low</StatusBadge>;
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Weather Alerts
          </h3>
          <p className="text-sm text-white/60">Active weather-related alerts by zone</p>
        </div>
        <StatusBadge status="warning">{zoneAlerts.length} Active</StatusBadge>
      </div>

      {/* Zone Alerts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="pb-3 text-sm font-medium text-white/60">Zone</th>
              <th className="pb-3 text-sm font-medium text-white/60">Condition</th>
              <th className="pb-3 text-sm font-medium text-white/60">Severity</th>
              <th className="pb-3 text-sm font-medium text-white/60">Status</th>
              <th className="pb-3 text-sm font-medium text-white/60">Workers</th>
              <th className="pb-3 text-sm font-medium text-white/60">Action</th>
            </tr>
          </thead>
          <tbody>
            {zoneAlerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3">
                  <span className="text-sm text-white font-medium">{alert.zone}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-white/80">{alert.condition}</span>
                </td>
                <td className="py-3">{getSeverityBadge(alert.severity)}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      'text-sm',
                      alert.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                    )}
                  >
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-white/80 font-mono">
                    {alert.affectedWorkers}
                  </span>
                </td>
                <td className="py-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    View Claims
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Alerts */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-3">Weather API Alerts</h4>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-4 rounded-xl border',
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.severity === 'high'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{alert.event}</p>
                    <p className="text-xs text-white/60 mt-1">{alert.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    {alert.start.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
