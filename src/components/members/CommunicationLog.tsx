import { Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CommunicationRecord } from '@/types/member';
import { format, parseISO } from 'date-fns';

export function CommunicationLog({ communications }: { communications: CommunicationRecord[] }) {
  if (communications.length === 0) {
    return <div className="text-center py-8 text-muted-foreground"><Mail className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No communications sent</p></div>;
  }

  const sorted = [...communications].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  const statusConfig = {
    sent: { icon: CheckCircle, label: 'Sent', className: 'bg-emerald-100 text-emerald-700' },
    failed: { icon: XCircle, label: 'Failed', className: 'bg-red-100 text-red-700' },
    pending: { icon: Clock, label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  };

  return (
    <div className="space-y-3">
      {sorted.map(comm => {
        const status = statusConfig[comm.status];
        const StatusIcon = status.icon;
        return (
          <div key={comm.id} className="border rounded-lg p-3">
            <div className="flex items-start gap-3">
              {comm.channel === 'email' ? <Mail className="h-4 w-4 mt-1 text-muted-foreground" /> : <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{comm.channel}</Badge>
                    {comm.subject && <span className="font-medium text-sm">{comm.subject}</span>}
                  </div>
                  <Badge variant="outline" className={`text-xs gap-1 ${status.className}`}><StatusIcon className="h-3 w-3" />{status.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{comm.message}</p>
                <div className="mt-2 text-xs text-muted-foreground">{format(parseISO(comm.sent_at), 'MMM d, yyyy h:mm a')}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
