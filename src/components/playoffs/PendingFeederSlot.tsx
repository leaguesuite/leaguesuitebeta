import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from "lucide-react";

export const PendingFeederSlot = ({ label, gameId }: { label: string; gameId: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm italic text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>Awaiting result of {gameId}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
