import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays, Trophy, Plus, Pencil, Trash2, Search,
} from "lucide-react";

type EventType = "season" | "tournament";

interface EventItem {
  id: string;
  name: string;
  type: EventType;
  year: number;
  league?: string;
}

const INITIAL: EventItem[] = [
  { id: "e1", name: "Winter 2026", type: "season", year: 2026, league: "Adult Flag Football League" },
  { id: "e2", name: "Summer 2024", type: "season", year: 2024, league: "Adult Flag Football League" },
  { id: "e3", name: "5v5 Season 12", type: "season", year: 2024, league: "5v5 League" },
  { id: "e4", name: "Spring 2025", type: "season", year: 2025, league: "Adult Flag Football League" },
  { id: "e5", name: "Midnight Madness 2024", type: "tournament", year: 2024 },
  { id: "e6", name: "Elite Flag 2024", type: "tournament", year: 2024 },
  { id: "e7", name: "Montreal Games IV", type: "tournament", year: 2023 },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<{ name: string; type: EventType; year: number; league: string }>({
    name: "", type: "season", year: new Date().getFullYear(), league: "",
  });

  const openNew = (type: EventType) => {
    setEditing(null);
    setForm({ name: "", type, year: new Date().getFullYear(), league: "" });
    setDialogOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditing(ev);
    setForm({ name: ev.name, type: ev.type, year: ev.year, league: ev.league ?? "" });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setEvents(prev => prev.map(e => e.id === editing.id ? { ...editing, ...form, league: form.league || undefined } : e));
    } else {
      setEvents(prev => [...prev, { id: crypto.randomUUID(), ...form, league: form.league || undefined }]);
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const seasons = filtered.filter(e => e.type === "season").sort((a, b) => b.year - a.year);
  const tournaments = filtered.filter(e => e.type === "tournament").sort((a, b) => b.year - a.year);

  const renderGroup = (
    title: string,
    icon: React.ElementType,
    items: EventItem[],
    type: EventType,
  ) => {
    const Icon = icon;
    return (
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{title}</h2>
                <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "event" : "events"}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openNew(type)}>
              <Plus className="h-3.5 w-3.5" /> Add Event
            </Button>
          </div>

          <div className="divide-y divide-border border border-border rounded-md">
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No events yet.</div>
            )}
            {items.map(ev => (
              <div key={ev.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{ev.name}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">{ev.year}</Badge>
                  </div>
                  {ev.league && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.league}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ev)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(ev.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All past and upcoming events, grouped by type. Seasons run on a recurring schedule; tournaments are one-off competitions.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5" onClick={() => openNew("season")}>
              <Plus className="h-4 w-4" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update the event details." : "Add a new season or tournament event."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Winter 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={form.type} onValueChange={(v: EventType) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="season">Season</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>League (optional)</Label>
                <Input
                  value={form.league}
                  onChange={e => setForm({ ...form, league: e.target.value })}
                  placeholder="e.g. Adult Flag Football League"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {renderGroup("Seasons", CalendarDays, seasons, "season")}
        {renderGroup("Tournaments", Trophy, tournaments, "tournament")}
      </div>
    </div>
  );
}
