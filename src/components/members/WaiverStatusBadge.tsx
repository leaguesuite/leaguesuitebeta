import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { WaiverStatus, WaiverRecord } from '@/types/member';

interface WaiverStatusBadgeProps {
  waivers: WaiverRecord[];
  showTooltip?: boolean;
  onClick?: () => void;
}

export function WaiverStatusBadge({ waivers, showTooltip = true, onClick }: WaiverStatusBadgeProps) {
  const currentWaiver = waivers.find(w => w.waiver_type === 'Liability Waiver') || waivers[0];
  const status: WaiverStatus = currentWaiver?.status || 'unsigned';

  const statusConfig = {
    signed: { icon: CheckCircle, label: 'Signed', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
    expired: { icon: Clock, label: 'Expired', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    unsigned: { icon: XCircle, label: 'Unsigned', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const isClickable = (status !== 'signed') && onClick;

  const badge = (
    <Badge
      variant="outline"
      className={`gap-1 ${config.className} ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? (e) => { e.stopPropagation(); onClick(); } : undefined}
    >
      <Icon className="h-3 w-3" />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );

  if (!showTooltip || !currentWaiver) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-medium">{currentWaiver.waiver_type}</p>
            {currentWaiver.signed_date && <p>Signed: {new Date(currentWaiver.signed_date).toLocaleDateString()}</p>}
            {currentWaiver.expiry_date && <p>Expires: {new Date(currentWaiver.expiry_date).toLocaleDateString()}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
