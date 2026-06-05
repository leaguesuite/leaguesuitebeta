import { useState } from "react";
import { Plus, Edit, Trash2, Tag, ArrowUp, ArrowDown, CalendarDays, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type EventType = "season" | "tournament";

type GroupingTag = {
  id: number;
  name: string;
  eventType: EventType;
  phase: string;
};

const initial: GroupingTag[] = [
  // Season › Regular Season
  { id: 1, name: "Week 1", eventType: "season", phase: "Regular Season" },
  { id: 2, name: "Week 2", eventType: "season", phase: "Regular Season" },
  { id: 3, name: "Week 3", eventType: "season", phase: "Regular Season" },
  // Season › Playoffs
  { id: 4, name: "Quarterfinals", eventType: "season", phase: "Playoffs" },
  { id: 5, name: "Semifinals", eventType: "season", phase: "Playoffs" },
  { id: 6, name: "Finals", eventType: "season", phase: "Playoffs" },
  // Tournament › Opening Round
  { id: 7, name: "Matchday 1", eventType: "tournament", phase: "Opening Round" },
  { id: 8, name: "Matchday 2", eventType: "tournament", phase: "Opening Round" },
  // Tournament › Knockout Round
  { id: 9, name: "Semifinals", eventType: "tournament", phase: "Knockout Round" },
  { id: 10, name: "Gold-Medal Game", eventType: "tournament", phase: "Knockout Round" },
  { id: 11, name: "Bronze-Medal Game", eventType: "tournament", phase: "Knockout Round" },
];

const eventTypeLabel: Record<EventType, string> = {
  season: "Season",
  tournament: "Tournament",
};

const phasesByType: Record<EventType, string[]> = {
  season: ["Regular Season", "Playoffs"],
  tournament: ["Opening Round", "Knockout Round"],
};

export default function GroupingTagsPage() {
  const [items, setItems] = useState<GroupingTag[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GroupingTag | null>(null);
  const [form, setForm] = useState<{ name: string; eventType: EventType; phase: string }>({
    name: "", eventType: "season", phase: "Regular Season",
  });

  const openNew = (eventType: EventType, phase: string) => {
    setEditing(null);
    setForm({ name: "", eventType, phase });
    setOpen(true);
  };

  const openEdit = (t: GroupingTag) => {
    setEditing(t);
    setForm({ name: t.name, eventType: t.eventType, phase: t.phase });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast({ title: "Tag name is required", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t));
      toast({ title: "Grouping tag updated" });
    } else {
      const id = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { id, ...form }]);
      toast({ title: "Grouping tag added" });
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    setItems(prev => prev.filter(t => t.id !== id));
    toast({ title: "Tag removed" });
  };

  const move = (id: number, dir: -1 | 1) => {
    const idx = items.findIndex(i => i.id === id);
    const target = items[idx];
    // find siblings (same eventType + phase) for ordering
    const sibIdxs = items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.eventType === target.eventType && it.phase === target.phase)
      .map(({ i }) => i);
    const localPos = sibIdxs.indexOf(idx);
    const swapWith = sibIdxs[localPos + dir];
    if (swapWith === undefined) return;
    const next = [...items];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setItems(next);
  };

  const eventTypes: EventType[] = ["season", "tournament"];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grouping Tags</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tags used to group games within each phase. Defaults are provided per event type.
          </p>
        </div>
      </div>

      {eventTypes.map(et => (
        <div key={et} className="space-y-3">
          <div className="flex items-center gap-2">
            {et === "season"
              ? <CalendarDays className="h-4 w-4 text-primary" />
              : <Trophy className="h-4 w-4 text-primary" />}
            <h2 className="text-base font-semibold text-foreground">{eventTypeLabel[et]} Event Type</h2>
          </div>

          {phasesByType[et].map(phase => {
            const phaseItems = items.filter(t => t.eventType === et && t.phase === phase);
            return (
              <div key={phase} className="section-card">
                <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{phase}</h3>
                    <Badge variant="outline" className="text-xs">{phaseItems.length}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => openNew(et, phase)}>
                    <Plus className="h-3.5 w-3.5" /> Add Tag
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {phaseItems.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-muted-foreground text-center">
                      No tags yet.
                    </div>
                  ) : phaseItems.map((t, i) => (
                    <div key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{t.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        disabled={i === 0} onClick={() => move(t.id, -1)}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        disabled={i === phaseItems.length - 1} onClick={() => move(t.id, 1)}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => remove(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Grouping Tag" : "New Grouping Tag"}</DialogTitle>
            <DialogDescription>
              Tags appear in the Add Game dialog to group games within a phase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tag Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Week 4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Event Type</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.eventType}
                onChange={e => {
                  const eventType = e.target.value as EventType;
                  setForm(f => ({ ...f, eventType, phase: phasesByType[eventType][0] }));
                }}
              >
                <option value="season">Season</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phase</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.phase}
                onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}
              >
                {phasesByType[form.eventType].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
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
