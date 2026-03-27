import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function useCountUp({
  start = 0,
  end,
  duration = 1000,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
}: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
        
        // Easing function (ease-out-expo)
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        
        const currentValue = start + (end - start) * easeOutExpo;
        setValue(Number(currentValue.toFixed(decimals)));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setIsComplete(true);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, delay, decimals]);

  const formattedValue = `${prefix}${value.toLocaleString()}${suffix}`;

  return { value, formattedValue, isComplete };
}
