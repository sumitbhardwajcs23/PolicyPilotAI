import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CloudRain, 
  MapPin, 
  ShieldAlert, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut
} from 'lucide-react';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'weather', label: 'Weather Monitor', icon: 'CloudRain', path: '/weather' },
  { id: 'gps', label: 'GPS Tracking', icon: 'MapPin', path: '/gps' },
  { id: 'fraud', label: 'Fraud Detection', icon: 'ShieldAlert', path: '/fraud', badge: 3 },
  { id: 'payments', label: 'Payments', icon: 'CreditCard', path: '/payments' },
  { id: 'claims', label: 'Claims', icon: 'FileText', path: '/claims' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
];

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CloudRain,
  MapPin,
  ShieldAlert,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className={cn(
        'sidebar fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-expo-out',
        'bg-black/95 backdrop-blur-xl border-r border-white/10',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white whitespace-nowrap">
                Policy Pilot AI
              </h1>
              <p className="text-xs text-white/50 whitespace-nowrap">Insurance Dashboard</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'ml-auto p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-white/60" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/60" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.id;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'sidebar-item relative',
                isActive && 'active bg-white/10 text-white',
                collapsed && 'justify-center px-2'
              )}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Hover background slide */}
              <div
                className={cn(
                  'absolute inset-0 bg-white/5 rounded-lg transition-transform duration-200 origin-left',
                  isHovered && !isActive ? 'scale-x-100' : 'scale-x-0'
                )}
              />
              
              <Icon className="w-5 h-5 relative z-10 flex-shrink-0" />
              
              {!collapsed && (
                <>
                  <span className="relative z-10 flex-1 whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-10 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (isHovered || isActive) && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-sm text-white whitespace-nowrap z-50 border border-white/10">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-white">AD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-white/50 truncate">admin@Policy Pilot AI.com</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
