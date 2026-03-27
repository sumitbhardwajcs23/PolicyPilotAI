import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { GlassCard } from '@/components/common/GlassCard';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export function RiskGauge() {
  const { stats } = useFraudDetection();
  const needleRef = useRef<HTMLDivElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);

  // Calculate needle rotation based on accuracy (0-100 maps to -90 to 90 degrees)
  const needleRotation = (stats.accuracy / 100) * 180 - 90;

  useEffect(() => {
    if (needleRef.current && gaugeRef.current) {
      // Animate gauge on mount
      gsap.from(gaugeRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out',
      });

      // Animate needle
      gsap.fromTo(
        needleRef.current,
        { rotation: -90 },
        {
          rotation: needleRotation,
          duration: 1.2,
          delay: 0.3,
          ease: 'expo.out',
        }
      );
    }
  }, [needleRotation]);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Fraud Detection Accuracy
          </h3>
          <p className="text-sm text-white/60">AI-powered risk assessment</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
          <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            +2.4% this week
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Gauge */}
        <div ref={gaugeRef} className="relative w-48 h-24">
          {/* Gauge background */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Red zone (0-30) */}
            <path
              d="M 20 100 A 80 80 0 0 1 60 30.7"
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.3"
            />
            {/* Yellow zone (30-70) */}
            <path
              d="M 60 30.7 A 80 80 0 0 1 140 30.7"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.3"
            />
            {/* Green zone (70-100) */}
            <path
              d="M 140 30.7 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.3"
            />
          </svg>

          {/* Needle */}
          <div
            ref={needleRef}
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-gradient-to-t from-purple-500 to-cyan-400 origin-bottom rounded-full"
            style={{
              transform: 'translateX(-50%) rotate(-90deg)',
            }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg" />
          </div>

          {/* Center point */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg" />
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-4xl font-bold text-white">
              <AnimatedNumber value={stats.accuracy} suffix="%" decimals={1} />
            </p>
            <p className="text-sm text-white/60 mt-1">Detection Accuracy</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Checked</span>
              </div>
              <p className="text-xl font-bold text-white">{stats.totalChecked.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Flagged</span>
              </div>
              <p className="text-xl font-bold text-white">{stats.flaggedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Score Legend */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-sm text-white/60 mb-3">Risk Score Thresholds</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-white/60">0-30: Auto-approve</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-white/60">31-70: Review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-white/60">71-100: Reject</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
