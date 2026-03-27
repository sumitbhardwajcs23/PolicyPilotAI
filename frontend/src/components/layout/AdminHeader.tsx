import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Bell, 
  ChevronDown,
  Menu,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/policies': 'Policy Approvals',
  '/admin/claims': 'Claim Approvals',
  '/admin/users': 'User Management',
  '/admin/admins': 'Admin Management',
  '/admin/settings': 'Settings',
  '/admin/gps': 'GPS Tracking',
  '/admin/weather': 'Weather Alerts',
  '/admin/fraud': 'Fraud Detection',
  '/admin/payments': 'Payments',
  '/admin/analytics': 'Analytics',
};

export function AdminHeader({ sidebarCollapsed, onMenuClick }: AdminHeaderProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New Policy Application', message: 'Health insurance application from Rahul Sharma', time: '2 min ago', unread: true },
    { id: 2, title: 'Claim Filed', message: 'Vehicle claim CLM005 requires review', time: '10 min ago', unread: true },
    { id: 3, title: 'Payment Processed', message: '₹25,000 paid for claim CLM001', time: '1 hour ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header
      className={cn(
        'header fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-6',
        'bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-72'
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">{pageTitle}</h2>
            <span className="hidden sm:flex px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div
          className={cn(
            'relative transition-all duration-200 hidden md:block',
            searchFocused ? 'w-72' : 'w-56'
          )}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/50',
              'bg-white/5 border border-white/10 transition-all duration-200',
              'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
              searchFocused && 'bg-white/10 border-primary/30'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-popover backdrop-blur-xl border-border"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Notifications</span>
              <span className="text-xs text-primary cursor-pointer hover:underline">
                Mark all read
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 hover:bg-accent cursor-pointer transition-colors',
                    notification.unread && 'bg-accent/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {notification.unread && (
                      <span className="w-2 h-2 mt-1.5 bg-primary rounded-full flex-shrink-0" />
                    )}
                    <div className={cn('flex-1', !notification.unread && 'pl-5')}>
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer focus:bg-accent">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs font-medium text-white/60">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/60 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover backdrop-blur-xl border-border"
          >
            <DropdownMenuItem className="text-foreground focus:bg-accent cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground focus:bg-accent cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              className="text-destructive focus:bg-accent cursor-pointer"
              onClick={logout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
