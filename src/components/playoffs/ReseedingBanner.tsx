import { Info } from "lucide-react";

export const ReseedingBanner = ({ round, remaining }: { round: string; remaining: number }) => (
  <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
    <Info className="h-3.5 w-3.5" />
    <span>
      Awaiting <span className="font-semibold">{remaining}</span> {round} result{remaining === 1 ? "" : "s"} before reseeding the next round.
    </span>
  </div>
);
