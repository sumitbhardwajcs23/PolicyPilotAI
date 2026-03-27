import { useEffect } from 'react';
import { gsap } from 'gsap';
import { StatCard } from '@/components/dashboard/StatCard';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { GlassCard } from '@/components/common/GlassCard';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const stats = [
  { title: 'Total Policies', value: 24000000, prefix: '₹', suffix: '', decimals: 0, change: 12.5, changeType: 'increase' as const, icon: 'Wallet' },
  { title: 'Active Claims', value: 156, prefix: '', suffix: '', decimals: 0, change: 8.2, changeType: 'increase' as const, icon: 'FileCheck' },
  { title: 'Fraud Alerts', value: 12, prefix: '', suffix: '', decimals: 0, change: -3.1, changeType: 'decrease' as const, icon: 'AlertTriangle' },
  { title: 'Processing Time', value: 8.5, prefix: '', suffix: ' min', decimals: 1, change: -15.2, changeType: 'decrease' as const, icon: 'Clock' },
];

const recentActivity = [
  { id: 1, type: 'claim', message: 'New claim from Rahul Sharma', time: '2 min ago', status: 'success' },
  { id: 2, type: 'fraud', message: 'High risk alert: GPS mismatch detected', time: '5 min ago', status: 'warning' },
  { id: 3, type: 'payment', message: '₹2,500 paid to Priya Patel', time: '10 min ago', status: 'success' },
  { id: 4, type: 'weather', message: 'Heavy rainfall alert: Andheri West', time: '15 min ago', status: 'info' },
  { id: 5, type: 'claim', message: 'Claim CLM003 approved automatically', time: '20 min ago', status: 'success' },
];

export function Dashboard() {
  useEffect(() => {
    // Animate stats on mount
    gsap.from('.stat-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'expo.out',
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-white/60">Real-time insights into your insurance operations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-emerald-400">System Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.title} className="stat-card">
            <StatCard {...stat} delay={index} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
          <OverviewCharts />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Recent Activity */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <p className="text-sm text-white/60">Latest system events</p>
              </div>
              <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${activity.status === 'success' ? 'bg-emerald-500/15' : ''}
                    ${activity.status === 'warning' ? 'bg-amber-500/15' : ''}
                    ${activity.status === 'info' ? 'bg-cyan-500/15' : ''}
                  `}>
                    {activity.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {activity.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {activity.status === 'info' && <TrendingUp className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.message}</p>
                    <p className="text-xs text-white/40 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
