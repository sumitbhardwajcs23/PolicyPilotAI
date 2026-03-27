import type { LucideIcon } from 'lucide-react'
import { cn, formatCurrency } from '@/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  formatAsCurrency?: boolean
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className,
  formatAsCurrency = false
}: StatsCardProps) {
  const displayValue = formatAsCurrency && typeof value === 'number' 
    ? formatCurrency(value) 
    : value

  return (
    <div className={cn("card p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{displayValue}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success-600" : "text-danger-600"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-400">vs last week</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-brand-50 rounded-xl">
          <Icon className="w-6 h-6 text-brand-600" />
        </div>
      </div>
    </div>
  )
}
