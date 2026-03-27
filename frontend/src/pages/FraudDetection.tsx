import { RiskGauge } from '@/components/fraud/RiskGauge';
import { DetectionCards } from '@/components/fraud/DetectionCards';
import { FlaggedClaimsTable } from '@/components/fraud/FlaggedClaimsTable';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle,
  Brain,
  TrendingUp
} from 'lucide-react';

export function FraudDetection() {

  const workflowSteps = [
    { name: 'Claim Trigger', icon: AlertTriangle, status: 'complete' },
    { name: 'GPS Check', icon: CheckCircle2, status: 'complete' },
    { name: 'Weather API', icon: CheckCircle2, status: 'complete' },
    { name: 'Behavioral Analysis', icon: Brain, status: 'processing' },
    { name: 'Platform Verification', icon: Shield, status: 'pending' },
    { name: 'Risk Score', icon: TrendingUp, status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Detection</h1>
          <p className="text-sm text-white/60">AI-powered multi-layer fraud prevention system</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30">
            <span className="text-sm font-medium text-purple-400 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Model v2.4
            </span>
          </div>
          <StatusBadge status="success">System Active</StatusBadge>
        </div>
      </div>

      {/* Risk Gauge */}
      <RiskGauge />

      {/* Detection Workflow */}
      <GlassCard>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">Fraud Detection Workflow</h3>
          <p className="text-sm text-white/60">Multi-layer validation process</p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10" />
          <div 
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000"
            style={{ width: '60%' }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.name} className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300
                      ${step.status === 'complete' ? 'bg-emerald-500/20 border-2 border-emerald-500' : ''}
                      ${step.status === 'processing' ? 'bg-purple-500/20 border-2 border-purple-500 animate-pulse' : ''}
                      ${step.status === 'pending' ? 'bg-white/5 border-2 border-white/20' : ''}
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5
                        ${step.status === 'complete' ? 'text-emerald-400' : ''}
                        ${step.status === 'processing' ? 'text-purple-400' : ''}
                        ${step.status === 'pending' ? 'text-white/40' : ''}
                      `}
                    />
                  </div>
                  <span
                    className={`
                      mt-3 text-xs font-medium text-center max-w-[80px]
                      ${step.status === 'complete' ? 'text-emerald-400' : ''}
                      ${step.status === 'processing' ? 'text-purple-400' : ''}
                      ${step.status === 'pending' ? 'text-white/40' : ''}
                    `}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Detection Mechanisms */}
      <DetectionCards />

      {/* Flagged Claims */}
      <FlaggedClaimsTable />

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">68%</p>
              <p className="text-sm text-white/60">Auto-approved</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">27%</p>
              <p className="text-sm text-white/60">Manual Review</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5%</p>
              <p className="text-sm text-white/60">Auto-rejected</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Average Processing Time */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Clock className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Average Processing Time</p>
              <p className="text-3xl font-bold text-white">8-12 minutes</p>
              <p className="text-xs text-emerald-400 mt-1">From event detection to payout</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">Claims Processed Today</p>
            <p className="text-3xl font-bold text-white">47</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
