import { RatingRunStatus } from '@/ratings-engine/types/ratings';
import { cn } from '@/lib/utils';
import { Circle, Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface StatusBadgeProps {
  status: RatingRunStatus;
  className?: string;
}

const statusConfig: Record<RatingRunStatus, { 
  label: string; 
  className: string; 
  icon: React.ComponentType<{ className?: string }> 
}> = {
  draft: {
    label: 'Draft',
    className: 'status-draft',
    icon: Circle,
  },
  running: {
    label: 'Running',
    className: 'status-running animate-pulse-subtle',
    icon: Loader2,
  },
  completed: {
    label: 'Completed',
    className: 'status-completed',
    icon: CheckCircle,
  },
  committed: {
    label: 'Committed',
    className: 'status-committed',
    icon: CheckCircle,
  },
  rolled_back: {
    label: 'Rolled Back',
    className: 'status-rolled-back',
    icon: RotateCcw,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.className, className)}>
      <Icon className={cn('h-3 w-3', status === 'running' && 'animate-spin')} />
      {config.label}
    </span>
  );
}
