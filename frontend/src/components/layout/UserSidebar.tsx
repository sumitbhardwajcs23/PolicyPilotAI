import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Shield, 
  FileText, 
  PlusCircle,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CloudSun
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'policies', label: 'My Policies', icon: Shield, path: '/dashboard/policies' },
  { id: 'claims', label: 'My Claims', icon: FileText, path: '/dashboard/claims' },
  { id: 'gps', label: 'GPS Tracking', icon: MapPin, path: '/dashboard/gps' },
  { id: 'weather', label: 'Weather Alerts', icon: CloudSun, path: '/dashboard/weather' },
  { id: 'new-policy', label: 'Buy New Policy', icon: PlusCircle, path: '/dashboard/policies/new' },
  { id: 'new-claim', label: 'File a Claim', icon: PlusCircle, path: '/dashboard/claims/new' },
  { id: 'history', label: 'History', icon: History, path: '/dashboard/history' },
  { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
];

export function UserSidebar({ collapsed, onToggle }: UserSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'sidebar fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-expo-out',
        'bg-background backdrop-blur-xl border-r border-border',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-foreground whitespace-nowrap">Policy Pilot AI</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">User Portal</p>
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
            <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground/60" />
          )}
        </button>
      </div>

      {/* Navigation */}
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
                isActive && 'active bg-primary/10 text-primary border-l-2 border-primary',
                !isActive && 'text-muted-foreground hover:bg-accent' ,
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn("w-5 h-5 relative z-10 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              {!collapsed && (
                <span className="relative z-10 flex-1 whitespace-nowrap">{item.label}</span>
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

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
            <span className="text-sm font-medium text-white">{user?.avatar || 'U'}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={logout}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <LogOut className="w-4 h-4 text-muted-foreground/60" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
