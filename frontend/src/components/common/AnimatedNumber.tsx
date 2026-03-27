import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1500,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const { formattedValue } = useCountUp({
    end: value,
    duration,
    delay,
    decimals,
    prefix,
    suffix,
  });

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formattedValue}
    </span>
  );
}
