import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from "lucide-react";

interface Props {
  label: string;
  tooltip?: string;
}

export const PendingFeederSlot = ({ label, tooltip }: Props) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm italic text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono text-xs">{label}</span>
        </div>
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);
