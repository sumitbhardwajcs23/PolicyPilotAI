import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/utils'
import type { Notification } from '@shared/types'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications - in real app, fetch from API
  const notifications: Notification[] = [
    {
      id: '1',
      userId: user?.id || '',
      title: 'Claim Approved',
      message: 'Your claim of ₹450 for heavy rainfall has been approved',
      type: 'claim_approved',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      userId: user?.id || '',
      title: 'Policy Expiring Soon',
      message: 'Your policy expires in 2 days. Renew now to stay protected.',
      type: 'policy_expiring',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-gray-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <button className="text-xs text-brand-600 hover:text-brand-700">
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.read ? 'bg-brand-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-sm font-medium text-brand-600">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
