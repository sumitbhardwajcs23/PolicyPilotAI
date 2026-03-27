import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { useClaimsApi } from '@/hooks/useClaimsApi';
import { usePoliciesApi } from '@/hooks/usePoliciesApi';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  MapPin,
  Info,
  Shield,
  CloudRain,
  Flame,
  Wind,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';

const eventTypes = [
  { id: 'heavy_rain', label: 'Heavy Rain', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'extreme_heat', label: 'Extreme Heat', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'severe_pollution', label: 'Severe Pollution', icon: Wind, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  { id: 'flooding', label: 'Flooding / Waterlogging', icon: AlertTriangle, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'social_disruption', label: 'Social Disruption (Strike/Rally)', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export function NewClaim() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitClaim, loading } = useClaimsApi();
  const { userPolicies } = usePoliciesApi();
  
  const activePolicies = userPolicies.filter(p => p.status === 'active');
  
  const [step, setStep] = useState(1);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [triggerType, setTriggerType] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('12:00');
  const [submitted, setSubmitted] = useState(false);

  const selectedPolicy = activePolicies.find(p => p._id === selectedPolicyId || p.id === selectedPolicyId);

  const handleSubmit = async () => {
    if (!selectedPolicyId || !triggerType) return;
    
    const success = await submitClaim({
      triggerType,
      eventTimestamp: `${eventDate}T${eventTime}:00Z`,
      location: { 
        lat: 28.6139, // Mock lat
        lng: 77.2090, // Mock lng
        zone: user?.zone || 'Delhi' 
      },
      description,
    });

    if (success) {
      setSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#06b6d4', '#10b981'],
      });
    }
  };

  if (activePolicies.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <GlassCard className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Shield</h2>
          <p className="text-white/60 mb-6 text-sm">
            You need an active policy to file a claim. Payouts are only possible if you are covered during the event.
          </p>
          <button
            onClick={() => navigate('/dashboard/policies/new')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium hover:shadow-glow transition-all"
          >
            Activate a Shield
          </button>
        </GlassCard>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <GlassCard className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Claim Filed!</h2>
          <p className="text-white/60 mb-6 text-sm">
            Your manual claim has been submitted. Our AI is cross-referencing weather & news data for verification.
          </p>
          <div className="p-4 rounded-xl bg-white/5 mb-6 text-left">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Claim ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <div className="flex justify-between mb-1">
              <span className="text-white/60 text-sm">Trigger</span>
              <span className="text-white font-semibold text-sm capitalize">{triggerType.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-white/60 text-sm">Status</span>
              <span className="text-amber-400 font-semibold text-sm">Analysing Risk</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/claims')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium hover:shadow-glow transition-all"
          >
            Track Claim Status
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Manual Claim Filing</h1>
        <p className="text-sm text-white/60">If an event wasn't auto-detected, file it here for review</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= s ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/40')}>
              {s}
            </div>
            <span className={cn('text-sm', step >= s ? 'text-white' : 'text-white/40')}>
              {s === 1 ? 'Details' : 'Review & Submit'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-6">What happened?</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {eventTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setTriggerType(type.id)}
                      className={cn(
                        'p-4 rounded-xl border flex flex-col items-center gap-3 transition-all',
                        triggerType === type.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', type.bg)}>
                        <Icon className={cn('w-5 h-5', type.color)} />
                      </div>
                      <span className="text-xs font-medium text-white text-center">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">When did it occur?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={eventDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <input
                      type="time"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">At which location?</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      readOnly
                      value={user?.zone || 'Current Location'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white/60 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Additional Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell us more about the disruption..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Proof / Evidence (Optional)</label>
                <div className="border border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <Upload className="w-8 h-8 text-white/20 mx-auto mb-2 group-hover:text-purple-400 transition-colors" />
                  <p className="text-xs text-white/40">Upload photos of rain, news screenshots, etc.</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-sm font-bold text-white mb-4">Select Policy</h3>
              <div className="space-y-3">
                {activePolicies.map(p => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedPolicyId(p._id)}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all',
                      selectedPolicyId === p._id ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white capitalize">{p.tier} Plan</span>
                      <CheckCircle2 className={cn('w-4 h-4', selectedPolicyId === p._id ? 'text-emerald-400' : 'text-white/10')} />
                    </div>
                    <p className="text-[10px] text-white/40 mb-2">ID: {p._id.slice(-8)}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Coverage Left</span>
                      <span className="text-emerald-400 font-bold">₹{p.coverageRemaining.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            <button
              onClick={() => setStep(2)}
              disabled={!triggerType || !selectedPolicyId}
              className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              Review Claim <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto">
          <GlassCard>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">Review & Submit</h2>
                <p className="text-sm text-white/60">Almost done!</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Trigger Event</p>
                  <p className="text-sm font-bold text-white capitalize">{triggerType.replace(/_/g, ' ')}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Incident Time</p>
                  <p className="text-sm font-bold text-white">{new Date(`${eventDate}T${eventTime}`).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Associated Policy</p>
                <p className="text-sm font-bold text-white capitalize">{selectedPolicy?.tier} Plan · ID: {selectedPolicy?._id.slice(-8)}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-100/70 leading-relaxed">
                    Once submitted, our AI will automatically fetch historical weather and disruption data for <strong>{user?.zone}</strong> at the specified time to validate your claim. Expected processing time: 10-15 minutes.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold shadow-lg shadow-purple-900/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Confirm & File Claim <ArrowRight className="w-5 h-5" /></>}
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
