import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useWeather } from '@/hooks/useWeather';
import { 
  CloudRain, 
  Droplets, 
  Wind, 
  Thermometer,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function WeatherWidget() {
  const { weather, forecast, loading, error, refresh, lastUpdated, mapCoords } = useWeather(300000);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        y: -8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, []);

  if (loading && !weather) {
    return (
      <GlassCard className="h-full">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (error || !weather) {
    return (
      <GlassCard className="h-full">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-white/60">Failed to load weather data</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </GlassCard>
    );
  }

  const hasActiveTrigger = weather.rainfall && weather.rainfall > 50;

  return (
    <GlassCard className={cn(hasActiveTrigger && 'border-amber-500/30')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{weather.location}</span>
          </div>
          <p className="text-xs text-white/40">
            Updated {lastUpdated?.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={cn('w-4 h-4 text-white/60', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center gap-6 mb-8">
        <div ref={iconRef} className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
          <CloudRain className="w-12 h-12 text-purple-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{weather.temperature}</span>
            <span className="text-2xl text-white/60">°C</span>
          </div>
          <p className="text-lg text-white/80 mt-1">{weather.condition}</p>
          {hasActiveTrigger && (
            <StatusBadge status="warning" className="mt-2">
              Trigger Active
            </StatusBadge>
          )}
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Droplets className="w-4 h-4" />
            <span className="text-xs">Humidity</span>
          </div>
          <p className="text-lg font-semibold text-white">{weather.humidity}%</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Wind className="w-4 h-4" />
            <span className="text-xs">Wind</span>
          </div>
          <p className="text-lg font-semibold text-white">{weather.windSpeed} km/h</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs">Rainfall</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {weather.rainfall || 0} mm/hr
          </p>
        </div>
      </div>

      {/* Air Quality Metrics */}
      {weather.airQuality && (
        <div className="mb-6">
          <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Air Quality Index (AQI): <span className={cn(
              "font-bold",
              weather.airQuality.aqi < 50 ? "text-green-400" :
              weather.airQuality.aqi < 100 ? "text-yellow-400" :
              weather.airQuality.aqi < 150 ? "text-orange-400" :
              "text-red-400"
            )}>{weather.airQuality.aqi}</span>
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-lg bg-white/5 flex flex-col justify-center gap-1">
              <span className="text-xs text-white/40">PM2.5</span>
              <span className="text-sm font-medium text-white">{weather.airQuality.pm2_5} µg/m³</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 flex flex-col justify-center gap-1">
              <span className="text-xs text-white/40">PM10</span>
              <span className="text-sm font-medium text-white">{weather.airQuality.pm10} µg/m³</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 flex flex-col justify-center gap-1">
              <span className="text-xs text-white/40">Ozone</span>
              <span className="text-sm font-medium text-white">{weather.airQuality.ozone} µg/m³</span>
            </div>
          </div>
        </div>
      )}

      {/* Forecast */}
      <div>
        <p className="text-sm text-white/60 mb-3">5-Day Forecast</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="flex-shrink-0 p-3 rounded-xl bg-white/5 min-w-[80px] text-center"
            >
              <p className="text-xs text-white/60 mb-2">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <CloudRain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">{day.tempMax}°</p>
              <p className="text-xs text-white/40">{day.tempMin}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map Embed */}
      {mapCoords && (
        <div className="mt-6 rounded-xl overflow-hidden border border-white/5 bg-white/5">
          <div className="flex items-center justify-between px-3 pt-3 mb-2">
            <p className="text-sm text-white/60 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Live Map Location
            </p>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest leading-none">
              {mapCoords.lat.toFixed(3)}°N, {mapCoords.lng.toFixed(3)}°E
            </span>
          </div>
          <iframe
            width="100%"
            height="210"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          ></iframe>
          <div className="p-3 bg-white/5 border-t border-white/5">
            <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">
              Location: <span className="text-white/60">{weather.location}</span>
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
