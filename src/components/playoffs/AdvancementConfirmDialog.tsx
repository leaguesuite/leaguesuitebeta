import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { MockPlayoffGame } from "@/data/mockPlayoffs";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  finalGames: MockPlayoffGame[];
}

export const AdvancementConfirmDialog = ({ open, onOpenChange, finalGames }: Props) => {
  const advancers = finalGames.map((g) => ({
    game: g,
    winner: g.score && g.score.t1 >= g.score.t2 ? g.team1 : g.team2,
    nextSlot: g.matchLabel.startsWith("QF") ? `SF (${g.matchLabel} winner)` : g.matchLabel.startsWith("SF") ? `Final` : "—",
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review advancement</DialogTitle>
          <DialogDescription>
            These winners will be moved into the next round. Bracket and scorekeeper app will update immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {advancers.length === 0 && (
            <p className="text-sm text-muted-foreground">No completed games to advance.</p>
          )}
          {advancers.map((a) => (
            <div key={a.game.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2 text-sm">
              <Badge variant="outline" className="font-mono">{a.game.id}</Badge>
              <span className="font-medium">{a.winner}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{a.nextSlot}</span>
              <Badge className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                Final {a.game.score?.t1}–{a.game.score?.t2}
              </Badge>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              toast.success(`Advanced ${advancers.length} winners`);
              onOpenChange(false);
            }}
            disabled={advancers.length === 0}
          >
            <CheckCircle2 className="h-4 w-4" />Apply advancement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
