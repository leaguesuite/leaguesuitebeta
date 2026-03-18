import { Badge } from "@/components/ui/badge";
import type { Member } from "@/types/member";

interface MemberStatusBadgeProps {
  status: Member['status'];
}

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  const variants = {
    active: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    inactive: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  };

  return (
    <Badge variant="outline" className={`text-xs font-medium ${variants[status]}`}>
      {status}
    </Badge>
  );
}
