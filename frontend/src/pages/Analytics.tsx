import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GlassCard } from '@/components/common/GlassCard';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import { 
  TrendingUp, 
  ShieldCheck,
  Star,
  Calendar,
  Download
} from 'lucide-react';

// Mock data for analytics
const monthlyClaimsData = [
  { month: 'Jan', claims: 45, approved: 38, rejected: 7 },
  { month: 'Feb', claims: 52, approved: 44, rejected: 8 },
  { month: 'Mar', claims: 48, approved: 41, rejected: 7 },
  { month: 'Apr', claims: 61, approved: 52, rejected: 9 },
  { month: 'May', claims: 55, approved: 47, rejected: 8 },
  { month: 'Jun', claims: 67, approved: 58, rejected: 9 },
];

const fraudDetectionData = [
  { zone: 'Andheri West', detected: 15, prevented: 12 },
  { zone: 'Bandra', detected: 8, prevented: 7 },
  { zone: 'Andheri East', detected: 5, prevented: 4 },
  { zone: 'Khar', detected: 3, prevented: 3 },
  { zone: 'Juhu', detected: 2, prevented: 2 },
];

const payoutData = [
  { name: '0-500', value: 15 },
  { name: '500-1K', value: 32 },
  { name: '1K-2K', value: 45 },
  { name: '2K-3K', value: 28 },
  { name: '3K+', value: 12 },
];

const satisfactionData = [
  { rating: '5 Star', count: 89 },
  { rating: '4 Star', count: 45 },
  { rating: '3 Star', count: 12 },
  { rating: '2 Star', count: 3 },
  { rating: '1 Star', count: 1 },
];

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

export function Analytics() {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-3">
          <p className="text-sm text-white/60 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-white/60">Comprehensive performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <Calendar className="w-4 h-4 text-white/40" />
            <select className="bg-transparent text-sm text-white focus:outline-none">
              <option className="bg-gray-900">Last 30 Days</option>
              <option className="bg-gray-900">Last 90 Days</option>
              <option className="bg-gray-900">Last Year</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Claim Approval Rate', value: 73, suffix: '%', change: '+5.2% from last month', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
          { label: 'Fraud Detection Rate', value: 95.2, suffix: '%', decimals: 1, change: '+2.1% from last month', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { label: 'Customer Satisfaction', value: 4.8, suffix: '/5', decimals: 1, change: 'Based on 150 reviews', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        ].map((metric, i) => (
          <motion.div key={metric.label} variants={cardVariants} initial="hidden" animate="visible" custom={i}>
            <GlassCard>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${metric.bg} flex items-center justify-center`}>
                  <metric.icon className={`w-7 h-7 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{metric.label}</p>
                  <p className="text-3xl font-bold text-white leading-tight">
                    <AnimatedNumber value={metric.value} suffix={metric.suffix} decimals={metric.decimals} />
                  </p>
                  <p className="text-xs font-medium text-emerald-400 mt-1">{metric.change}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Monthly Claims Trend */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
          <GlassCard>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Monthly Claims Trend</h3>
              <p className="text-sm font-medium text-white/70">Claims volume and approval rate over time</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyClaimsData}>
                  <defs>
                    <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="claims"
                    name="Total Claims"
                    stroke="#a78bfa"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorClaims)"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    name="Approved"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorApproved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fraud Detection by Zone */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={4}>
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Fraud Detection by Zone</h3>
                <p className="text-sm font-medium text-white/70">Cases detected and prevented</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fraudDetectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="zone" 
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 500 }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="detected" name="Detected" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="prevented" name="Prevented" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Payout Distribution */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={5}>
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Payout Distribution</h3>
                <p className="text-sm font-medium text-white/70">Claim amount breakdown</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={payoutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {payoutData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {payoutData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs font-medium text-white/70">{item.name}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Customer Satisfaction */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={6}>
          <GlassCard>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Customer Satisfaction</h3>
              <p className="text-sm font-medium text-white/70">Worker feedback ratings</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={satisfactionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="rating" 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reviews" fill="#7c3aed" radius={[0, 4, 4, 0]}>
                    {satisfactionData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
