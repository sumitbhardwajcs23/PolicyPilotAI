import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { GlassCard } from '@/components/common/GlassCard';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Wallet,
  FileCheck,
  AlertTriangle,
  Clock
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Wallet,
  FileCheck,
  AlertTriangle,
  Clock,
};

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0,
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[icon] || Wallet;

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: delay * 0.1,
        ease: 'expo.out',
      });
    }
  }, [delay]);

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-emerald-400';
      case 'decrease':
        return 'text-red-400';
      default:
        return 'text-white/40';
    }
  };

  return (
    <GlassCard ref={cardRef} className="dashboard-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              <AnimatedNumber
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
                delay={delay * 100 + 200}
              />
            </span>
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs', getChangeColor())}>
              {getChangeIcon()}
              <span>{Math.abs(change)}%</span>
              <span className="text-white/40 ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
      </div>
    </GlassCard>
  );
}
