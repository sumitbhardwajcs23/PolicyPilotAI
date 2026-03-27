import { useState } from 'react';
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

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function Header({ sidebarCollapsed, onMenuClick }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New fraud alert', message: 'High risk claim detected', time: '2 min ago', unread: true },
    { id: 2, title: 'Payment processed', message: '₹2,500 paid to Rahul Sharma', time: '5 min ago', unread: true },
    { id: 3, title: 'Weather alert', message: 'Heavy rainfall in Andheri West', time: '10 min ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header
      className={cn(
        'header fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-6',
        'bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-72'
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-white/70" />
        </button>
        
        <div>
          <h2 className="text-lg font-semibold text-white">Dashboard Overview</h2>
          <p className="text-xs text-white/50">Welcome back, Admin</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div
          className={cn(
            'relative transition-all duration-200',
            searchFocused ? 'w-72' : 'w-56'
          )}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search claims, workers..."
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-white/40',
              'bg-white/5 border border-white/10 transition-all duration-200',
              'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30',
              searchFocused && 'bg-white/10 border-purple-500/30'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-white/70" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-black/95 backdrop-blur-xl border-white/10"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-medium text-white">Notifications</span>
              <span className="text-xs text-purple-400 cursor-pointer hover:underline">
                Mark all read
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors',
                    notification.unread && 'bg-white/[0.02]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {notification.unread && (
                      <span className="w-2 h-2 mt-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                    )}
                    <div className={cn('flex-1', !notification.unread && 'pl-5')}>
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="text-xs text-white/60 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-white/40 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-center text-sm text-purple-400 cursor-pointer focus:bg-white/5">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">AD</span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/60 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-black/95 backdrop-blur-xl border-white/10"
          >
            <DropdownMenuItem className="text-white focus:bg-white/5 cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white focus:bg-white/5 cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-red-400 focus:bg-white/5 cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
