import { LeaguePageTitle } from "@/components/layout/LeaguePageTitle";
import { useState } from "react";
import { Plus, Edit, Trash2, Trophy, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type Round = {
  id: number;
  name: string;
  bracket: "main" | "consolation" | "medal";
};

const initial: Round[] = [
  { id: 1, name: "Wild-Card Round", bracket: "main" },
  { id: 2, name: "Divisional Round", bracket: "main" },
  { id: 3, name: "Quarterfinals", bracket: "main" },
  { id: 4, name: "Semifinals", bracket: "main" },
  { id: 5, name: "Championship Finals", bracket: "main" },
  { id: 6, name: "Consolation Semifinals", bracket: "consolation" },
  { id: 7, name: "Consolation Finals", bracket: "consolation" },
  { id: 8, name: "Bronze Medal Game", bracket: "medal" },
  { id: 9, name: "Gold Medal Game", bracket: "medal" },
];

const bracketLabel: Record<Round["bracket"], string> = {
  main: "Main Bracket",
  consolation: "Consolation",
  medal: "Medal Game",
};

export default function PlayoffRoundsPage() {
  const [items, setItems] = useState<Round[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Round | null>(null);
  const [form, setForm] = useState<{ name: string; bracket: Round["bracket"] }>({ name: "", bracket: "main" });

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", bracket: "main" });
    setOpen(true);
  };

  const openEdit = (r: Round) => {
    setEditing(r);
    setForm({ name: r.name, bracket: r.bracket });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast({ title: "Round name is required", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(r => r.id === editing.id ? { ...r, ...form } : r));
      toast({ title: "Playoff round updated" });
    } else {
      const id = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { id, ...form }]);
      toast({ title: "Playoff round added" });
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    setItems(prev => prev.filter(r => r.id !== id));
    toast({ title: "Round removed" });
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <LeaguePageTitle title="Playoff Rounds" />
          <p className="text-sm text-muted-foreground mt-1">
            Configure the rounds available when creating playoff games. Order determines display sequence.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Round
        </Button>
      </div>

      <div className="section-card">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">All Rounds</h2>
          </div>
          <Badge variant="outline" className="text-xs">{items.length} total</Badge>
        </div>
        <div className="divide-y divide-border">
          {items.map((r, idx) => (
            <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                  <Badge variant="outline" className="text-[10px]">{bracketLabel[r.bracket]}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={idx === 0} onClick={() => move(idx, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => remove(r.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Playoff Round" : "New Playoff Round"}</DialogTitle>
            <DialogDescription>
              These rounds appear in the Add Game dialog when "Playoffs" is selected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Round Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Quarterfinals" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bracket</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.bracket}
                onChange={e => setForm(f => ({ ...f, bracket: e.target.value as Round["bracket"] }))}
              >
                <option value="main">Main Bracket</option>
                <option value="consolation">Consolation</option>
                <option value="medal">Medal Game</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
