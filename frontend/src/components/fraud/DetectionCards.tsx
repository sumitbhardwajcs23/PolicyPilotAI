import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  MapPin, 
  CloudRain, 
  Brain, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DetectionLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'warning' | 'error';
  checks: string[];
  lastCheck: string;
}

const detectionLayers: DetectionLayer[] = [
  {
    id: 'gps',
    name: 'GPS Validation',
    description: 'Real-time location tracking during claimed disruption',
    icon: 'MapPin',
    status: 'active',
    checks: ['Geofencing verification', 'Movement pattern analysis', 'GPS spoofing detection'],
    lastCheck: '2 min ago',
  },
  {
    id: 'weather',
    name: 'Weather Correlation',
    description: 'Cross-verification with actual weather data',
    icon: 'CloudRain',
    status: 'active',
    checks: ['Timestamp matching', 'Intensity validation', 'Historical comparison'],
    lastCheck: '5 min ago',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Analysis',
    description: 'Claim frequency and pattern detection',
    icon: 'Brain',
    status: 'warning',
    checks: ['Claim frequency', 'Earnings deviation', 'Peer comparison'],
    lastCheck: '10 min ago',
  },
  {
    id: 'platform',
    name: 'Platform Verification',
    description: 'Login status and order validation',
    icon: 'ShieldCheck',
    status: 'active',
    checks: ['Login verification', 'Order availability', 'Zone closure check'],
    lastCheck: '3 min ago',
  },
];

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  CloudRain,
  Brain,
  ShieldCheck,
};

export function DetectionCards() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.from(cardsRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'expo.out',
      });
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Active</StatusBadge>;
      case 'warning':
        return <StatusBadge status="warning">Warning</StatusBadge>;
      default:
        return <StatusBadge status="danger">Error</StatusBadge>;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Detection Mechanisms</h3>
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detectionLayers.map((layer) => {
          const Icon = iconMap[layer.icon];
          
          return (
            <GlassCard key={layer.id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{layer.name}</h4>
                    <p className="text-xs text-white/60">{layer.description}</p>
                  </div>
                </div>
                {getStatusBadge(layer.status)}
              </div>

              {/* Checks List */}
              <div className="space-y-2 mb-4">
                {layer.checks.map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getStatusIcon(layer.status)}
                    <span className="text-xs text-white/70">{check}</span>
                  </div>
                ))}
              </div>

              {/* Last Check */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/40">Last check</span>
                <span className="text-xs text-white/60">{layer.lastCheck}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
