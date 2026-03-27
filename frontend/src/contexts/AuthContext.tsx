import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@shared/types'

export type UserRole = 'worker' | 'admin' | 'insurer'

// Extended User type that includes avatar for layout components
export interface ExtendedUser extends User {
  avatar?: string;
}

interface AuthContextType {
  user: ExtendedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isMasterAdmin: boolean
  hasPermission: (permission: string) => boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        // Generate avatar from name initials if not present
        if (!parsed.avatar && parsed.name) {
          const parts = parsed.name.split(' ')
          parsed.avatar = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2)
        }
        setUser(parsed)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, userData: User) => {
    const extended: ExtendedUser = {
      ...userData,
      avatar: userData.name ? userData.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'U'
    }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(extended))
    setUser(extended)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    }
  }

  const isMasterAdmin = user?.role === 'admin'

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    // Admin role has full permissions
    if (user.role === 'admin') return true
    // Insurer role has limited permissions
    if (user.role === 'insurer') {
      const insurerPermissions = ['canApprovePolicies', 'canApproveClaims', 'canViewReports']
      return insurerPermissions.includes(permission)
    }
    return false
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isMasterAdmin,
      hasPermission,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
