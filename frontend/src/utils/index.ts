import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return formatDate(date)
}

export function getTriggerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    heavy_rain: 'Heavy Rainfall',
    extreme_heat: 'Extreme Heat',
    severe_pollution: 'Severe Pollution',
    flooding: 'Flooding',
    social_disruption: 'Zone Closure',
  }
  return labels[type] || type
}

export function getTriggerIcon(type: string): string {
  const icons: Record<string, string> = {
    heavy_rain: 'CloudRain',
    extreme_heat: 'Sun',
    severe_pollution: 'Wind',
    flooding: 'Waves',
    social_disruption: 'AlertTriangle',
  }
  return icons[type] || 'AlertCircle'
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    severe: 'danger',
  }
  return colors[level] || 'gray'
}

export function calculateTimeRemaining(targetDate: string): string {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h remaining`
}
