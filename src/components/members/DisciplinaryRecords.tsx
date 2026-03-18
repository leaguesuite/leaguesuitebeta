import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Ban, AlertCircle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DisciplinaryRecord } from '@/types/member';
import { format, parseISO } from 'date-fns';

interface DisciplinaryBadgeProps {
  records: DisciplinaryRecord[];
}

export function DisciplinaryBadge({ records }: DisciplinaryBadgeProps) {
  const activeRecords = records.filter(r => r.is_active);
  if (activeRecords.length === 0) return null;

  const mostSevere = activeRecords.find(r => r.type === 'ban') || activeRecords.find(r => r.type === 'suspension') || activeRecords[0];
  const typeConfig = {
    warning: { icon: AlertCircle, label: 'Warning', className: 'bg-amber-100 text-amber-700' },
    suspension: { icon: AlertTriangle, label: 'Suspended', className: 'bg-red-100 text-red-700' },
    ban: { icon: Ban, label: 'Banned', className: 'bg-red-200 text-red-800' },
  };
  const config = typeConfig[mostSevere.type];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 ${config.className}`}>
            <Icon className="h-3 w-3" /><span className="text-xs">{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1 max-w-xs">
            <p className="font-medium">{mostSevere.reason}</p>
            <p>From: {format(parseISO(mostSevere.start_date), 'MMM d, yyyy')}</p>
            {mostSevere.end_date && <p>Until: {format(parseISO(mostSevere.end_date), 'MMM d, yyyy')}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DisciplinaryRecordsList({ records }: { records: DisciplinaryRecord[] }) {
  if (records.length === 0) {
    return <div className="text-center py-8 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No disciplinary records</p></div>;
  }
  const sorted = [...records].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  const typeConfig = {
    warning: { icon: AlertCircle, color: 'text-amber-600' },
    suspension: { icon: AlertTriangle, color: 'text-red-600' },
    ban: { icon: Ban, color: 'text-red-800' },
  };

  return (
    <div className="space-y-3">
      {sorted.map(record => {
        const config = typeConfig[record.type];
        const Icon = config.icon;
        return (
          <div key={record.id} className={`border rounded-lg p-3 ${record.is_active ? 'border-red-300 bg-red-50' : 'border-border'}`}>
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium capitalize">{record.type}</span>
                  {record.is_active && <Badge variant="destructive" className="text-xs">Active</Badge>}
                </div>
                <p className="text-sm">{record.reason}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(parseISO(record.start_date), 'MMM d, yyyy')}{record.end_date && <> — {format(parseISO(record.end_date), 'MMM d, yyyy')}</>}</span>
                </div>
                {record.notes && <p className="text-xs text-muted-foreground mt-2 italic">{record.notes}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
