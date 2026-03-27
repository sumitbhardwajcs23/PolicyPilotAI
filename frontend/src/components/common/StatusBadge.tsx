import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const statusConfig: Record<StatusType, { bg: string; text: string; border: string; dot: string }> = {
  success: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  danger: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  info: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  pending: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
  neutral: {
    bg: 'bg-white/5',
    text: 'text-white/60',
    border: 'border-white/10',
    dot: 'bg-white/40',
  },
};

export function StatusBadge({ status, children, className, dot = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      )}
      {children}
    </span>
  );
}
