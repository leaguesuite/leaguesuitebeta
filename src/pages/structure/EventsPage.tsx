import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CalendarDays, Trophy, Pencil, Trash2, Search, Eye, Play,
  CheckCircle2, Clock, Archive, Users, MapPin, GitBranch,
} from "lucide-react";

type EventType = "season" | "tournament";
type EventStatus = "draft" | "registration" | "active" | "completed" | "archived";

interface EventItem {
  id: string;
  name: string;
  type: EventType;
  league: string;
  status: EventStatus;
  year: number;
  // Season-specific
  startDate?: string;
  endDate?: string;
  divisions?: number;
  teams?: number;
  games?: number;
  gamesCompleted?: number;
  // Tournament-specific
  date?: string;
  location?: string;
  format?: string;
  champion?: string;
}

const INITIAL: EventItem[] = [
  // Seasons
  {
    id: "s1", name: "Spring 2026", type: "season", league: "Adult Flag Football League",
    status: "active", year: 2026, startDate: "2026-03-01", endDate: "2026-06-15",
    divisions: 4, teams: 24, games: 96, gamesCompleted: 32,
  },
  {
    id: "s2", name: "Winter 2025-26", type: "season", league: "Adult Flag Football League",
    status: "completed", year: 2026, startDate: "2025-11-01", endDate: "2026-02-15",
    divisions: 3, teams: 18, games: 72, gamesCompleted: 72,
  },
  {
    id: "s3", name: "Fall 2025", type: "season", league: "Adult Flag Football League",
    status: "completed", year: 2025, startDate: "2025-09-01", endDate: "2025-11-30",
    divisions: 4, teams: 24, games: 96, gamesCompleted: 96,
  },
  {
    id: "s4", name: "Summer 2025", type: "season", league: "Adult Flag Football League",
    status: "archived", year: 2025, startDate: "2025-06-01", endDate: "2025-08-31",
    divisions: 3, teams: 16, games: 64, gamesCompleted: 64,
  },
  {
    id: "s5", name: "5v5 Season 12", type: "season", league: "5v5 League",
    status: "completed", year: 2024, startDate: "2024-09-01", endDate: "2024-12-15",
    divisions: 2, teams: 12, games: 48, gamesCompleted: 48,
  },
  {
    id: "s6", name: "Winter 2026", type: "season", league: "Adult Flag Football League",
    status: "registration", year: 2026, startDate: "2026-11-01", endDate: "2027-02-15",
    divisions: 3, teams: 0, games: 0, gamesCompleted: 0,
  },
  // Tournaments
  {
    id: "t1", name: "Spring Showdown 2026", type: "tournament", league: "Adult Flag Football League",
    status: "active", year: 2026, date: "2026-04-12", location: "Central Sports Complex",
    format: "Single Elimination", teams: 16, divisions: 2,
  },
  {
    id: "t2", name: "Midnight Madness 2024", type: "tournament", league: "Adult Flag Football League",
    status: "completed", year: 2024, date: "2024-12-06", location: "Metro Stadium",
    format: "Double Elimination", teams: 8, divisions: 1, champion: "Thunder Hawks",
  },
  {
    id: "t3", name: "Elite Flag 2024", type: "tournament", league: "Adult Flag Football League",
    status: "completed", year: 2024, date: "2024-07-19", location: "Riverside Fields",
    format: "Round Robin + Bracket", teams: 12, divisions: 2, champion: "Iron Eagles",
  },
  {
    id: "t4", name: "Montreal Games IV", type: "tournament", league: "Adult Flag Football League",
    status: "archived", year: 2023, date: "2023-08-25", location: "Parc Jarry",
    format: "Single Elimination", teams: 8, divisions: 1, champion: "Lightning Bolts",
  },
];

function statusBadge(status: EventStatus) {
  switch (status) {
    case "active":
      return <Badge className="gap-1 bg-primary text-primary-foreground"><Play className="h-3 w-3" /> Active</Badge>;
    case "completed":
      return <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
    case "registration":
      return <Badge variant="outline" className="gap-1 border-primary/30 text-primary"><Users className="h-3 w-3" /> Registration</Badge>;
    case "draft":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Draft</Badge>;
    case "archived":
      return <Badge variant="outline" className="gap-1 text-muted-foreground"><Archive className="h-3 w-3" /> Archived</Badge>;
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<{
    name: string; type: EventType; league: string; status: EventStatus; year: number;
    startDate: string; endDate: string; date: string; location: string; format: string;
  }>({
    name: "", type: "season", league: "", status: "draft", year: new Date().getFullYear(),
    startDate: "", endDate: "", date: "", location: "", format: "",
  });

  const leagues = [...new Set(events.map(e => e.league))];


  const openEdit = (ev: EventItem) => {
    setEditing(ev);
    setForm({
      name: ev.name, type: ev.type, league: ev.league, status: ev.status, year: ev.year,
      startDate: ev.startDate ?? "", endDate: ev.endDate ?? "",
      date: ev.date ?? "", location: ev.location ?? "", format: ev.format ?? "",
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    const base: EventItem = {
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name, type: form.type, league: form.league,
      status: form.status, year: form.year,
    };
    if (form.type === "season") {
      base.startDate = form.startDate || undefined;
      base.endDate = form.endDate || undefined;
      base.divisions = editing?.divisions;
      base.teams = editing?.teams;
      base.games = editing?.games;
      base.gamesCompleted = editing?.gamesCompleted;
    } else {
      base.date = form.date || undefined;
      base.location = form.location || undefined;
      base.format = form.format || undefined;
      base.teams = editing?.teams;
      base.divisions = editing?.divisions;
      base.champion = editing?.champion;
    }
    if (editing) {
      setEvents(prev => prev.map(e => e.id === editing.id ? base : e));
    } else {
      setEvents(prev => [...prev, base]);
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const filtered = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchLeague = leagueFilter === "all" || e.league === leagueFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchLeague && matchStatus;
  });

  const seasons = filtered.filter(e => e.type === "season").sort((a, b) => b.year - a.year);
  const tournaments = filtered.filter(e => e.type === "tournament").sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every event belongs to one of two <span className="font-medium text-foreground">Event Types</span>: <span className="font-medium text-foreground">Season</span> (recurring, multi-week league play) or <span className="font-medium text-foreground">Tournament</span> (one-off competition). Individual events like <span className="italic">Summer 2026</span> or <span className="italic">Midnight Madness 2</span> are created under their respective type below.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: EventStatus) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>League</Label>
                  <Input
                    value={form.league}
                    onChange={e => setForm({ ...form, league: e.target.value })}
                    placeholder="e.g. Adult Flag Football League"
                  />
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
              {form.type === "season" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Event Format</Label>
                      <Input value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} placeholder="e.g. Single Elimination" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Central Sports Complex" />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="All Leagues" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="registration">Registration</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seasons */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground">Seasons</h2>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">Event Type</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{seasons.length} {seasons.length === 1 ? "event" : "events"} · recurring multi-week league play</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Season</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Dates</TableHead>
                  <TableHead className="text-center">Divisions</TableHead>
                  <TableHead className="text-center">Teams</TableHead>
                  <TableHead className="text-center">Games</TableHead>
                  <TableHead className="text-right w-[110px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.league}</TableCell>
                    <TableCell className="text-center">{statusBadge(s.status)}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {s.startDate && s.endDate
                        ? `${new Date(s.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} – ${new Date(s.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center">{s.divisions ?? "—"}</TableCell>
                    <TableCell className="text-center">{s.teams ?? "—"}</TableCell>
                    <TableCell className="text-center text-sm">
                      {s.games != null ? `${s.gamesCompleted ?? 0}/${s.games}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {seasons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      No seasons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Tournaments</h2>
                <p className="text-xs text-muted-foreground">{tournaments.length} {tournaments.length === 1 ? "event" : "events"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Tournament</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Event Format</TableHead>
                  <TableHead className="text-center">Teams</TableHead>
                  <TableHead>Champion</TableHead>
                  <TableHead className="text-right w-[110px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map(t => (
                  <TableRow key={t.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{t.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{t.league}</TableCell>
                    <TableCell className="text-center">{statusBadge(t.status)}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      {t.location ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {t.location}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {t.format ? (
                        <Badge variant="outline" className="text-xs font-normal">
                          <GitBranch className="h-3 w-3 mr-1" />
                          {t.format}
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">{t.teams ?? "—"}</TableCell>
                    <TableCell>
                      {t.champion ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Trophy className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium">{t.champion}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">TBD</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(t.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tournaments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                      No tournaments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
