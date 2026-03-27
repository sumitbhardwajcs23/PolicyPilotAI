import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Shield, 
  FileText, 
  Bell, 
  Settings, 
  Users, 
  AlertTriangle,
  BarChart3,
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils'

interface SidebarProps {
  isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const workerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/policy', label: 'My Policy', icon: Shield },
    { path: '/claims', label: 'Claims', icon: FileText },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const adminNavItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/policies', label: 'Policies', icon: Shield },
    { path: '/admin/claims', label: 'Claims', icon: FileText },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/events', label: 'Events', icon: AlertTriangle },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/zones', label: 'Zones', icon: MapPin },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const navItems = isAdmin ? adminNavItems : workerNavItems

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/logo.svg" alt="GigShield" className="w-8 h-8 flex-shrink-0" />
            {!collapsed && (
              <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
                GigShield
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-brand-50 text-brand-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-brand-600")} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-100 p-3">
          <div 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-brand-600">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 mt-2 w-full text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")} />
    </>
  )
}
