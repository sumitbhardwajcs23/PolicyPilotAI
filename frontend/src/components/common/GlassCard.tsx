import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: 'none' | 'primary' | 'success' | 'warning' | 'danger';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = true, glow = 'none', padding = 'md', ...props }, ref) => {
    const glowClasses = {
      none: '',
      primary: 'shadow-glow',
      success: 'shadow-glow-success',
      warning: 'shadow-glow-warning',
      danger: 'shadow-glow-danger',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'glass-card',
          hover && 'glass-card-hover',
          glowClasses[glow],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
