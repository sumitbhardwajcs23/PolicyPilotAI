import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Bell, 
  ChevronDown,
  Menu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface UserHeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/policies': 'My Policies',
  '/dashboard/policies/new': 'Buy New Policy',
  '/dashboard/claims': 'My Claims',
  '/dashboard/claims/new': 'File a Claim',
  '/dashboard/history': 'History',
  '/dashboard/profile': 'Profile',
  '/dashboard/gps': 'GPS Tracking',
  '/dashboard/weather': 'Weather Alerts',
};

export function UserHeader({ sidebarCollapsed, onMenuClick }: UserHeaderProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Claim Approved', message: 'Your claim CLM002 has been approved', time: '5 min ago', unread: true },
    { id: 2, title: 'Policy Renewal', message: 'Your health policy expires in 30 days', time: '1 hour ago', unread: true },
    { id: 3, title: 'Payment Received', message: 'Premium payment of ₹2,500 received', time: '2 hours ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header
      className={cn(
        'header fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-6',
        'bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300',
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
        
        <div>
          <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>
          <p className="text-xs text-muted-foreground/70">Welcome back, {user?.name?.split(' ')[0]}</p>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40',
              'bg-accent/5 border border-border transition-all duration-200',
              'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
              searchFocused && 'bg-accent/10 border-primary/30'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-white">{user?.avatar || 'U'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover backdrop-blur-xl border-border"
          >
            <DropdownMenuItem className="text-foreground focus:bg-accent cursor-pointer" asChild>
              <a href="/dashboard/profile">Profile</a>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground focus:bg-accent cursor-pointer" asChild>
              <a href="/dashboard/history">History</a>
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
