import { useState } from "react";
import { Plus, Edit, Trash2, Trophy, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type Competition = {
  id: number;
  name: string;
  description: string;
  status: "active" | "archived";
};

const initial: Competition[] = [
  { id: 1, name: "Regular Season", description: "Standard weekly league play used for standings.", status: "active" },
  { id: 2, name: "Playoffs", description: "Post-season elimination rounds.", status: "active" },
];

export default function CompetitionNamesPage() {
  const [items, setItems] = useState<Competition[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setOpen(true);
  };

  const openEdit = (c: Competition) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      toast({ title: "Competition updated" });
    } else {
      const id = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { id, name: form.name, description: form.description, status: "active" }]);
      toast({ title: "Competition added" });
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    setItems(prev => prev.filter(c => c.id !== id));
    toast({ title: "Competition removed" });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Competition Names</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define the competitions available when scheduling games (e.g. Regular Season, Playoffs, Cup).
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Competition
        </Button>
      </div>

      <div className="section-card">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">All Competitions</h2>
          </div>
          <Badge variant="outline" className="text-xs">{items.length} total</Badge>
        </div>
        <div className="divide-y divide-border">
          {items.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              No competitions yet. Click "New Competition" to add one.
            </div>
          )}
          {items.map(c => (
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Competition" : "New Competition"}</DialogTitle>
            <DialogDescription>
              Competitions appear as filters and labels on Games & Schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
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
