import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { GlassCard } from '@/components/common/GlassCard';
import { mockClaimsChartData, mockPolicyDistribution, mockPayoutDistribution } from '@/services/mockData';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];

export function OverviewCharts() {
  // We rely on the global pageLoadAnimation() to handle the entry animation for '.dashboard-card' 
  // elements to avoid conflicts and overlapping state updates.

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-3">
          <p className="text-sm text-white/60 mb-1">{label}</p>
          <p className="text-lg font-semibold text-white">
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Claims Overview Chart */}
      <GlassCard className="lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Claims Overview</h3>
          <p className="text-sm font-medium text-white/70">Daily claim submissions for the past week</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockClaimsChartData}>
              <defs>
                <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="label" 
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
                dataKey="value"
                stroke="#a78bfa"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorClaims)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Side Charts */}
      <div className="space-y-6">
        {/* Policy Distribution */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Policy Distribution</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPolicyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockPolicyDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {mockPolicyDistribution.map((item, index) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs font-medium text-white/70">{item.label}</span>
                <span className="text-xs text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Payout Distribution */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Payout Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPayoutDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  {mockPayoutDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
