import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { usePayments } from '@/hooks/usePayments';
import { 
  IndianRupee, 
  User, 
  FileText, 
  Send,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const purposes = [
  'Claim Payout - Heavy Rain',
  'Claim Payout - Flooding',
  'Claim Payout - Extreme Heat',
  'Claim Payout - Severe Pollution',
  'Claim Payout - Social Disruption',
  'Manual Adjustment',
  'Bonus Payment',
];

export function PaymentForm() {
  const { initiatePayment, processingPayment } = usePayments();
  const [amount, setAmount] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !workerId || !workerName || !purpose) return;

    const success = await initiatePayment(
      parseInt(amount),
      workerId,
      workerName,
      purpose
    );

    if (success) {
      setShowSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#06b6d4', '#10b981'],
      });
      
      // Reset form
      setAmount('');
      setWorkerId('');
      setWorkerName('');
      setPurpose('');
      
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const isValid = amount && workerId && workerName && purpose;

  return (
    <GlassCard>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-purple-400" />
          Initiate Payment
        </h3>
        <p className="text-sm text-white/60">Send payout via Razorpay</p>
      </div>

      {showSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Payment Initiated!</h4>
          <p className="text-sm text-white/60">The payment has been sent to Razorpay for processing.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Amount (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                min="1"
              />
            </div>
          </div>

          {/* Worker ID */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Worker ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="e.g., W001"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
            </div>
          </div>

          {/* Worker Name */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Worker Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder="Enter worker name"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Purpose</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all appearance-none"
              >
                <option value="" className="bg-gray-900">Select purpose</option>
                {purposes.map((p) => (
                  <option key={p} value={p} className="bg-gray-900">{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || processingPayment}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2',
              isValid && !processingPayment
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-glow'
                : 'bg-white/10 cursor-not-allowed'
            )}
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Initiate Payment
              </>
            )}
          </button>

          {/* Razorpay Badge */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs text-white/40">Powered by</span>
            <span className="text-xs font-medium text-purple-400">Razorpay</span>
          </div>
        </form>
      )}
    </GlassCard>
  );
}
