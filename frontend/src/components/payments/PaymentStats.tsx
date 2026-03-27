import { motion } from 'framer-motion';
import { GlassCard } from '@/components/common/GlassCard';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import { usePayments } from '@/hooks/usePayments';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  IndianRupee
} from 'lucide-react';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

export function PaymentStats() {
  const { stats } = usePayments();

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const statItems = [
    {
      label: 'Total Processed',
      value: formatAmount(stats.totalProcessed),
      trend: '+12.5% this month',
      icon: IndianRupee,
      color: 'text-purple-400',
      bg: 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20',
      trendColor: 'text-emerald-400'
    },
    {
      label: 'Success Rate',
      value: <AnimatedNumber value={stats.successRate} suffix="%" />,
      trend: '+0.8% this week',
      icon: Wallet,
      color: 'text-emerald-400',
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10',
      trendColor: 'text-emerald-400'
    },
    {
      label: 'Pending',
      value: <AnimatedNumber value={stats.pending} />,
      trend: 'Awaiting processing',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/10',
      trendColor: 'text-amber-400'
    },
    {
      label: 'Failed',
      value: <AnimatedNumber value={stats.failed} />,
      trend: 'Needs attention',
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-gradient-to-br from-red-500/20 to-red-500/10',
      trendColor: 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, i) => (
        <motion.div
          key={item.label}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={i}
        >
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">{item.label}</p>
                <div className="text-2xl font-bold text-white">
                  {item.value}
                </div>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${item.trendColor}`}>
                  {item.label === 'Total Processed' || item.label === 'Success Rate' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : item.label === 'Pending' ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  <span>{item.trend}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center border border-white/5`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
