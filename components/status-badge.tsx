'use client';

import { cn } from '@/lib/utils';

type Status = 'stable' | 'recovering' | 'critical';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const statusConfig = {
  stable: {
    label: 'Stable',
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/50',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500'
  },
  recovering: {
    label: 'Recovering',
    bgClass: 'bg-amber-100 dark:bg-amber-950/50',
    textClass: 'text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500'
  },
  critical: {
    label: 'Critical',
    bgClass: 'bg-red-100 dark:bg-red-950/50',
    textClass: 'text-red-700 dark:text-red-400',
    dotClass: 'bg-red-500'
  }
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    badge: 'px-2.5 py-1 text-sm',
    dot: 'w-2 h-2'
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    dot: 'w-2.5 h-2.5'
  }
};

export function StatusBadge({ status, size = 'md', showPulse = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
        config.bgClass,
        config.textClass,
        sizeStyles.badge
      )}
    >
      <span
        className={cn(
          'rounded-full',
          config.dotClass,
          sizeStyles.dot,
          showPulse && status === 'critical' && 'animate-pulse-soft'
        )}
      />
      {config.label}
    </span>
  );
}
