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
  MapPin
} from 'lucide-react';

const parametricTriggers = [
  { parameter: 'Precipitation Rate', threshold: '> 50 mm/hr', current: '58 mm/hr', status: 'triggered' as const },
  { parameter: 'Temperature', threshold: '> 45°C', current: '32°C', status: 'normal' as const },
  { parameter: 'AQI', threshold: '> 400', current: '285', status: 'normal' as const },
  { parameter: 'Wind Speed', threshold: '> 80 km/hr', current: '24 km/hr', status: 'normal' as const },
];

export function Weather() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Weather Monitor</h1>
          <p className="text-sm text-white/60">Real-time weather tracking and parametric triggers</p>
        </div>
        <StatusBadge status="warning">1 Trigger Active</StatusBadge>
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
                Mumbai, India
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parametricTriggers.map((trigger) => (
                <div
                  key={trigger.parameter}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${trigger.status === 'triggered' 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-white/5 border-white/10'}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/60">{trigger.parameter}</span>
                    {trigger.status === 'triggered' ? (
                      <StatusBadge status="warning">Triggered</StatusBadge>
                    ) : (
                      <StatusBadge status="success">Normal</StatusBadge>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{trigger.current}</p>
                      <p className="text-xs text-white/40 mt-1">Threshold: {trigger.threshold}</p>
                    </div>
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      ${trigger.status === 'triggered' ? 'bg-amber-500/20' : 'bg-emerald-500/20'}
                    `}>
                      {trigger.parameter.includes('Rain') && <CloudRain className="w-5 h-5 text-amber-400" />}
                      {trigger.parameter.includes('Temp') && <Thermometer className="w-5 h-5 text-emerald-400" />}
                      {trigger.parameter.includes('AQI') && <Wind className="w-5 h-5 text-emerald-400" />}
                      {trigger.parameter.includes('Wind') && <Droplets className="w-5 h-5 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              ))}
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
