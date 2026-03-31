import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ClipboardList, 
  Users, 
  Settings,
  Map,
  ShieldAlert,
  CloudSun,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'policies', label: 'Policy Approvals', icon: ShieldCheck, path: '/admin/policies' },
    { id: 'claims', label: 'Claim Approvals', icon: ClipboardList, path: '/admin/claims' },
    { id: 'admins', label: 'Admin Management', icon: Users, path: '/admin/admins' },
    { id: 'gps', label: 'GPS Tracking', icon: Map, path: '/admin/gps' },
    { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert, path: '/admin/fraud' },
    { id: 'weather', label: 'Weather Alerts', icon: CloudSun, path: '/admin/weather' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'ml', label: 'ML Models', icon: Brain, path: '/ml-demo' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside
      className={cn(
        'sidebar fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-expo-out',
        'bg-[#0f172a] backdrop-blur-xl border-r border-white/10',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow bg-gradient-to-br from-purple-600 to-cyan-500">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white whitespace-nowrap">Policy Pilot AI</h1>
              <p className="text-xs font-medium text-white/60 whitespace-nowrap">Admin Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'ml-auto p-1.5 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/70" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'sidebar-item relative',
                isActive && 'active bg-primary/20 text-white border-l-2 border-primary',
                !isActive && 'text-white/70 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
                <Icon className={cn("w-5 h-5 relative z-10 flex-shrink-0", isActive ? "text-white" : "text-white/60")} />
                {!collapsed && (
                  <span className="relative z-10 flex-1 font-medium whitespace-nowrap">{item.label}</span>
                )}

              {/* Tooltip for collapsed state */}
              {collapsed && isActive && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover backdrop-blur-md rounded-lg text-sm text-foreground whitespace-nowrap z-50 border border-border shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-white/10">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-purple-500 to-cyan-500">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-white/60 truncate">Administrator</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={logout}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
