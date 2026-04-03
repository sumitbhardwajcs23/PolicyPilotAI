import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { usePoliciesApi } from '@/hooks/usePoliciesApi';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const tiers = [
  { 
    id: 'basic', 
    label: 'Basic Shield', 
    icon: Shield, 
    color: 'from-blue-500 to-cyan-500',
    description: 'Essential protection for rainy days and minor disruptions.',
    weeklyPremium: 49,
    maxCoverage: 49 * 20,
    eventsPerWeek: 1,
    features: ['Rain Protection', 'Heat Alerts', 'Standard Payouts']
  },
  { 
    id: 'standard', 
    label: 'Standard Shield', 
    icon: Zap, 
    color: 'from-purple-500 to-indigo-500',
    description: 'Balanced coverage for active full-time gig workers.',
    weeklyPremium: 79,
    maxCoverage: 79 * 20,
    eventsPerWeek: 2,
    features: ['Rain & Heat Protection', 'Disruption Coverage', 'Priority Support', '2 Events / Week']
  },
  { 
    id: 'premium', 
    label: 'Premium Shield', 
    icon: Sparkles, 
    color: 'from-amber-500 to-orange-500',
    description: 'Ultimate peace of mind with maximum payouts and event count.',
    weeklyPremium: 129,
    maxCoverage: 129 * 20,
    eventsPerWeek: 3,
    features: ['All Risks Covered', 'AQI Protection', '3 Events / Week', 'Instant UPI Payouts', 'Highest Payout Caps']
  },
];

export function NewPolicy() {
  const navigate = useNavigate();
  const { createPolicy, loading } = usePoliciesApi();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const tierData = tiers.find(t => t.id === selectedTier);
  
  const handleSubmit = async () => {
    if (!selectedTier) return;
    
    const success = await createPolicy({
      tier: selectedTier,
      paymentMethod: 'upi',
      autoRenewal: true,
    });

    if (success) {
      setSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#06b6d4', '#f59e0b'],
      });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <GlassCard className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Shield Activated!</h2>
          <p className="text-white/60 mb-6">
            Your policy application has been sent for admin approval. You'll be notified within 2-4 hours.
          </p>
          <div className="p-4 rounded-xl bg-white/5 mb-6 text-left">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Policy Summary</p>
            <div className="flex justify-between mb-1">
              <span className="text-white/60">Tier</span>
              <span className="text-white font-semibold capitalize">{selectedTier}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-white/60">Weekly Premium</span>
              <span className="text-white font-semibold">₹{tierData?.weeklyPremium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Max Coverage</span>
              <span className="text-white font-semibold">₹{tierData?.maxCoverage.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/policies')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium hover:shadow-glow transition-all"
          >
            Go to My Policies
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Choose Your Shield</h1>
        <p className="text-sm text-white/60">Parametric protection tailor-made for India's gig economy</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step >= s 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/10 text-white/40'
              )}
            >
              {s}
            </div>
            <span className={cn(
              'text-sm',
              step >= s ? 'text-white' : 'text-white/40'
            )}>
              {s === 1 ? 'Pick a Plan' : 'Review & Pay'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Tier */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  setSelectedTier(tier.id);
                  setStep(2);
                }}
                className={cn(
                  'relative p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] overflow-hidden group',
                  selectedTier === tier.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                {tier.id === 'standard' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-purple-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                    Most Popular
                  </div>
                )}
                
                <div className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6',
                  tier.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{tier.label}</h3>
                <p className="text-sm text-white/60 mb-6 h-10 line-clamp-2">{tier.description}</p>
                
                <div className="space-y-3 mb-8">
                  {tier.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="mt-auto border-t border-white/10 pt-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Starting At</span>
                    <span className="text-2xl font-bold text-white">₹{tier.weeklyPremium}</span>
                    <span className="text-xs text-white/40">/wk</span>
                  </div>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    selectedTier === tier.id ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/40 group-hover:bg-white/20'
                  )}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Review & Pay */}
      {step === 2 && tierData && (
        <div className="max-w-xl mx-auto">
          <GlassCard className="border-purple-500/20">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setStep(1)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">Review Your Shield</h2>
                <p className="text-sm text-white/60">Subscription details & auto-pay</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', tierData.color)}>
                    <tierData.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tierData.label}</p>
                    <p className="text-xs text-white/40">Parametric Insurance Tier</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-purple-400 hover:text-purple-300">Change</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Weekly Premium</p>
                  <p className="text-lg font-bold text-white">₹{tierData.weeklyPremium}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Max Coverage</p>
                  <p className="text-lg font-bold text-emerald-400">₹{tierData.maxCoverage.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Policy Details</span>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs text-white/60 flex justify-between">
                    <span>Events Period</span>
                    <span className="text-white">7 Days (Weekly Renewal)</span>
                  </li>
                  <li className="text-xs text-white/60 flex justify-between">
                    <span>Max Events / Week</span>
                    <span className="text-white">{tierData.eventsPerWeek}</span>
                  </li>
                  <li className="text-xs text-white/60 flex justify-between">
                    <span>Auto-Debit</span>
                    <span className="text-emerald-400 font-medium">Enabled (via UPI)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-8">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  By activating this shield, you authorize GigShield to debit ₹{tierData.weeklyPremium} every Monday from your linked UPI ID. You can pause or cancel anytime from settings.
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Activate Shield Now
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
