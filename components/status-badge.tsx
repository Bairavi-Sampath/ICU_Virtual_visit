'use client';

import { cn } from '@/lib/utils';

type Status = 'stable' | 'recovering' | 'critical' | 'recovered' | 'discharged';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const statusConfig = {
  stable: {
    label: 'Stable',
    bgClass: 'bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-950/60 dark:to-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    shadowClass: 'shadow-emerald-500/20',
    borderClass: 'border-emerald-200/50 dark:border-emerald-800/50'
  },
  recovering: {
    label: 'Recovering',
    bgClass: 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    shadowClass: 'shadow-amber-500/20',
    borderClass: 'border-amber-200/50 dark:border-amber-800/50'
  },
  critical: {
    label: 'Critical',
    bgClass: 'bg-gradient-to-r from-red-100 to-red-50 dark:from-red-950/60 dark:to-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    dotClass: 'bg-red-500',
    shadowClass: 'shadow-red-500/30',
    borderClass: 'border-red-200/50 dark:border-red-800/50'
  },
  recovered: {
    label: 'Recovered',
    bgClass: 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-950/60 dark:to-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    dotClass: 'bg-blue-500',
    shadowClass: 'shadow-blue-500/20',
    borderClass: 'border-blue-200/50 dark:border-blue-800/50'
  },
  discharged: {
    label: 'Discharged',
    bgClass: 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-950/60 dark:to-gray-900/30',
    textClass: 'text-gray-700 dark:text-gray-400',
    dotClass: 'bg-gray-500',
    shadowClass: 'shadow-gray-500/20',
    borderClass: 'border-gray-200/50 dark:border-gray-800/50'
  }
};

const sizeConfig = {
  sm: {
    badge: 'px-2.5 py-1 text-xs gap-1.5',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    badge: 'px-3 py-1.5 text-sm gap-2',
    dot: 'w-2 h-2'
  },
  lg: {
    badge: 'px-4 py-2 text-base gap-2.5',
    dot: 'w-2.5 h-2.5'
  }
};

export function StatusBadge({ status, size = 'md', showPulse = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-300 border shadow-sm',
        config.bgClass,
        config.textClass,
        config.borderClass,
        config.shadowClass,
        sizeStyles.badge
      )}
    >
      <span className="relative flex">
        {showPulse && status === 'critical' && (
          <span className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            config.dotClass
          )} />
        )}
        <span
          className={cn(
            'relative rounded-full shadow-sm',
            config.dotClass,
            sizeStyles.dot,
            showPulse && status === 'critical' && 'animate-pulse'
          )}
        />
      </span>
      {config.label}
    </span>
  );
}
