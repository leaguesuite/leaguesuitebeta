import { useState } from "react";
import { Plus, Edit, Trash2, Trophy, GripVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type PhaseGroup = "season" | "tournament";

type Phase = {
  id: number;
  name: string;
  description: string;
  group: PhaseGroup;
  status: "active" | "archived";
};

const initial: Phase[] = [
  { id: 1, name: "Regular Season", description: "Standard weekly league play used for standings.", group: "season", status: "active" },
  { id: 2, name: "Pre-Season", description: "Warm-up games before the regular season.", group: "season", status: "active" },
  { id: 3, name: "Playoffs", description: "Post-season elimination rounds.", group: "season", status: "active" },
  { id: 4, name: "Opening Round", description: "Initial tournament games.", group: "tournament", status: "active" },
  { id: 5, name: "Round Robin", description: "Pool play where teams face each opponent.", group: "tournament", status: "active" },
  { id: 6, name: "Elimination Round", description: "Knockout stage to determine champion.", group: "tournament", status: "active" },
];

export default function CompetitionNamesPage() {
  const [items, setItems] = useState<Phase[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Phase | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; group: PhaseGroup }>({ name: "", description: "", group: "season" });

  const openNew = (group: PhaseGroup) => {
    setEditing(null);
    setForm({ name: "", description: "", group });
    setOpen(true);
  };

  const openEdit = (p: Phase) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, group: p.group });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      toast({ title: "Phase updated" });
    } else {
      const id = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { id, name: form.name, description: form.description, group: form.group, status: "active" }]);
      toast({ title: "Phase added" });
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    setItems(prev => prev.filter(c => c.id !== id));
    toast({ title: "Phase removed" });
  };

  const renderGroup = (group: PhaseGroup, title: string, Icon: typeof Calendar) => {
    const list = items.filter(i => i.group === group);
    return (
      <div className="section-card">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
            <Badge variant="outline" className="text-[10px] ml-1">{list.length}</Badge>
          </div>
          <Button size="sm" variant="outline" onClick={() => openNew(group)} className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" /> Add Phase
          </Button>
        </div>
        <div className="divide-y divide-border">
          {list.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No phases yet. Click "Add Phase" to create one.
            </div>
          )}
          {list.map(c => (
            <div key={c.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <Badge variant={c.status === "active" ? "default" : "outline"} className="text-[10px]">{c.status}</Badge>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => remove(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Phases</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define the phases used when scheduling games. Each phase can be renamed to match your league's terminology.
        </p>
      </div>

      {renderGroup("season", "Season", Calendar)}
      {renderGroup("tournament", "Tournaments", Trophy)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Phase" : "New Phase"}</DialogTitle>
            <DialogDescription>
              Phases appear as filters and labels on Games & Schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Group</Label>
              <div className="flex gap-2">
                <Button type="button" variant={form.group === "season" ? "default" : "outline"} size="sm"
                  onClick={() => setForm(f => ({ ...f, group: "season" }))} className="flex-1">Season</Button>
                <Button type="button" variant={form.group === "tournament" ? "default" : "outline"} size="sm"
                  onClick={() => setForm(f => ({ ...f, group: "tournament" }))} className="flex-1">Tournaments</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Regular Season" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description" />
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
