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
    bgClass: 'bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-950/60 dark:to-emerald-900/40',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-200/50 dark:border-emerald-800/50'
  },
  recovering: {
    label: 'Recovering',
    bgClass: 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/40',
    textClass: 'text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-200/50 dark:border-amber-800/50'
  },
  critical: {
    label: 'Critical',
    bgClass: 'bg-gradient-to-r from-red-100 to-red-50 dark:from-red-950/60 dark:to-red-900/40',
    textClass: 'text-red-700 dark:text-red-400',
    dotClass: 'bg-red-500',
    borderClass: 'border-red-200/50 dark:border-red-800/50'
  }
};

const sizeConfig = {
  sm: {
    badge: 'px-2.5 py-1 text-xs',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    dot: 'w-2 h-2'
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    dot: 'w-2.5 h-2.5'
  }
};

export function StatusBadge({ status, size = 'md', showPulse = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-300 border shadow-sm',
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeStyles.badge
      )}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={cn(
            'rounded-full',
            config.dotClass,
            sizeStyles.dot,
            showPulse && status === 'critical' && 'animate-blink'
          )}
        />
        {showPulse && status === 'critical' && (
          <span
            className={cn(
              'absolute rounded-full opacity-40 animate-ping',
              config.dotClass,
              sizeStyles.dot
            )}
          />
        )}
      </span>
      {config.label}
    </span>
  );
}
