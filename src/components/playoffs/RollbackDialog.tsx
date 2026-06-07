import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { MockPlayoffGame } from "@/data/mockPlayoffs";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  games: MockPlayoffGame[];
}

export const RollbackDialog = ({ open, onOpenChange, games }: Props) => {
  const finals = games.filter((g) => g.status === "final");
  const [selected, setSelected] = useState<string>(finals[0]?.id ?? "");
  const target = games.find((g) => g.id === selected);

  // Mock cascade: any game whose team1/team2 references this winner label.
  const cascadeOf = (g?: MockPlayoffGame) => {
    if (!g) return [];
    const tag = `Winner ${g.matchLabel}`;
    return games.filter((x) => x.team1 === tag || x.team2 === tag);
  };
  const cascade = cascadeOf(target);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Rollback advancement</DialogTitle>
          <DialogDescription>
            Undoes a winner's advancement and clears downstream matchups that depend on it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Game to rollback</label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue placeholder="Select a completed game" /></SelectTrigger>
              <SelectContent>
                {finals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.id} · {g.matchLabel} · {g.team1} vs {g.team2}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {target && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />Cascade impact
              </div>
              {cascade.length === 0 ? (
                <p className="text-xs text-muted-foreground">No downstream matchups affected.</p>
              ) : (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {cascade.map((c) => (
                    <li key={c.id}>• {c.id} ({c.matchLabel}) — slot will revert to "{`Winner ${target.matchLabel}`}"</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!target}
            onClick={() => {
              toast.success(`Rolled back ${target?.id}. ${cascade.length} downstream slot(s) reverted.`);
              onOpenChange(false);
            }}
          >
            <Undo2 className="h-4 w-4" />Confirm rollback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
