import { PaymentStats } from '@/components/payments/PaymentStats';
import { TransactionTable } from '@/components/payments/TransactionTable';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  CreditCard, 
  Wallet, 
  Smartphone,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const paymentMethods = [
  { name: 'UPI', icon: Smartphone, enabled: true, description: 'Instant bank transfers' },
  { name: 'Credit/Debit Cards', icon: CreditCard, enabled: true, description: 'Visa, Mastercard, RuPay' },
  { name: 'Net Banking', icon: Building2, enabled: true, description: 'All major banks' },
  { name: 'Wallets', icon: Wallet, enabled: true, description: 'Paytm, PhonePe, etc.' },
];

export function Payments() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-sm font-medium text-white/70">Razorpay payment gateway integration</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30">
            <span className="text-sm font-medium text-purple-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Razorpay Connected
            </span>
          </div>
          <StatusBadge status="success">Live Mode</StatusBadge>
        </div>
      </div>

      {/* Payment Stats */}
      <PaymentStats />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Table */}
        <div className="lg:col-span-2">
          <TransactionTable />
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-1">
          <PaymentForm />
        </div>
      </div>

      {/* Payment Methods */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Supported Payment Methods</h3>
            <p className="text-sm font-medium text-white/70">Multiple options for worker payouts</p>
          </div>
          <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            Configure
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.name}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <StatusBadge status="success">Active</StatusBadge>
                </div>
                <p className="text-sm font-medium text-white">{method.name}</p>
                <p className="text-xs text-white/60 mt-1">{method.description}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Razorpay Integration Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Razorpay Integration</h4>
              <p className="text-sm text-white/60 mb-4">
                Secure payment processing with industry-leading success rates. 
                All transactions are encrypted and PCI-DSS compliant.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  PCI-DSS Compliant
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  256-bit SSL
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Instant Payouts</h4>
              <p className="text-sm font-medium text-white/70 mb-4">
                Workers receive payments directly to their bank accounts via UPI 
                within minutes of claim approval.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  24/7 Processing
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Real-time Settlements
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* API Configuration */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">API Configuration</h3>
            <p className="text-sm text-white/60">Razorpay API credentials and settings</p>
          </div>
          <StatusBadge status="success">Connected</StatusBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-white/60 mb-1">API Mode</p>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              Live Mode
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-white/60 mb-1">Webhook Status</p>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              Active
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-white/60 mb-1">Last Sync</p>
            <p className="text-sm font-medium text-white">2 minutes ago</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
