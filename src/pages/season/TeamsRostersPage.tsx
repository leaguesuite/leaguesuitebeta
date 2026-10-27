import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Plus, Search, Upload, Users, Edit, ArrowRightLeft, Layers, Trash2 } from "lucide-react";
import { LeaguePageTitle } from "@/components/layout/LeaguePageTitle";
import TeamRosterImportDialog from "@/components/teams/TeamRosterImportDialog";
import MoveTeamDialog, { MoveResult } from "@/components/teams/MoveTeamDialog";
import TeamSidePanel, { TeamLogo } from "@/components/teams/TeamSidePanel";
import { CONFERENCES, DIVISIONS, INITIAL_TEAMS, PaymentStatus, RosterEntry, Team, buildInitialRosters, today } from "@/components/teams/teamsData";

const PAY: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  paid: { label: "Paid", variant: "success" }, partial: { label: "Partial", variant: "warning" }, unpaid: { label: "Unpaid", variant: "destructive" },
};
const SCHEDULED_TEXT = { cancel: "remaining games cancelled", cross: "remaining games kept as cross-division", flag: "remaining games flagged for rescheduling" };

/** Group key encodes where a team sits inside a division: "" | "Conf" | "Conf/Sub". */
const groupKey = (t: Team) => t.conference ? (t.subdivision ? `${t.conference}/${t.subdivision}` : t.conference) : "";

export default function TeamsRostersPage() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [rosters, setRosters] = useState<Record<string, RosterEntry[]>>(() => buildInitialRosters(INITIAL_TEAMS));
  const [search, setSearch] = useState("");
  const [divFilter, setDivFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [panel, setPanel] = useState<{ id: string; tab: string } | null>(null);
  const [moveIds, setMoveIds] = useState<string[] | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const q = search.toLowerCase();
  const visible = teams.filter(t => (divFilter === "all" || t.division === divFilter) && (t.name.toLowerCase().includes(q) || t.captain.toLowerCase().includes(q)));
  const panelTeam = panel ? teams.find(t => t.id === panel.id) ?? null : null;

  const updateTeam = (next: Team) => setTeams(prev => prev.map(t => t.id === next.id ? next : t));

  const assign = (id: string, conference?: string, subdivision?: string) => {
    const t = teams.find(x => x.id === id)!;
    if (t.conference === conference && t.subdivision === subdivision) return;
    const where = conference ? (subdivision ? `${conference} › ${subdivision}` : conference) : "Unassigned";
    updateTeam({ ...t, conference, subdivision, history: [...t.history, { date: today(), text: `Assigned to ${where}` }] });
    toast({ title: `${t.name} → ${where}` });
  };

  const onDrop = (division: string, conference?: string, subdivision?: string) => {
    const id = dragId; setDragId(null); setDropTarget(null);
    if (!id) return;
    const t = teams.find(x => x.id === id)!;
    if (t.division !== division) { setMoveIds([id]); toast({ title: "Moving to another division", description: "Confirm how games should be handled." }); return; }
    assign(id, conference, subdivision);
  };

  const confirmMove = (r: MoveResult) => {
    const ids = moveIds ?? [];
    setTeams(prev => prev.map(t => {
      if (!ids.includes(t.id) || t.division === r.division) return t;
      const text = `Moved from ${t.division} to ${r.division} · played games ${r.played === "keep" ? "kept in old division" : "moved"}, ${SCHEDULED_TEXT[r.scheduled]}. Reason: ${r.reason}`;
      return { ...t, division: r.division, conference: r.conference, subdivision: undefined,
        wins: r.played === "move" ? t.wins : 0, losses: r.played === "move" ? t.losses : 0,
        history: [...t.history, { date: today(), text }] };
    }));
    toast({ title: `Moved to ${r.division}`, description: "Added to the team history." });
    setSelected([]);
  };

  const confirmDelete = () => {
    const ids = deleteIds ?? [];
    setTeams(prev => prev.filter(t => !ids.includes(t.id)));
    setSelected(s => s.filter(x => !ids.includes(x)));
    toast({ title: `${ids.length} team${ids.length > 1 ? "s" : ""} deleted` });
    setDeleteIds(null);
  };

  const movePlayers = (fromId: string, ids: number[], toId: string) => setRosters(prev => {
    const moving = (prev[fromId] ?? []).filter(p => ids.includes(p.player_id));
    return { ...prev, [fromId]: (prev[fromId] ?? []).filter(p => !ids.includes(p.player_id)), [toId]: [...(prev[toId] ?? []), ...moving] };
  });

  const toggleSel = (id: string, on: boolean) => setSelected(s => on ? [...s, id] : s.filter(x => x !== id));

  const renderRow = (t: Team) => {
    const roster = rosters[t.id] ?? [];
    const confs = CONFERENCES[t.division] ?? [];
    return (
      <div key={t.id} draggable onDragStart={e => { setDragId(t.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { setDragId(null); setDropTarget(null); }}
        className={`group flex items-center gap-3 px-3 py-2 border-t border-border bg-card hover:bg-secondary/30 ${dragId === t.id ? "opacity-40" : ""}`}>
        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
        <Checkbox checked={selected.includes(t.id)} onCheckedChange={c => toggleSel(t.id, !!c)} aria-label={`Select ${t.name}`} />
        <TeamLogo team={t} />
        <button className="flex-1 min-w-0 text-left" onClick={() => setPanel({ id: t.id, tab: "roster" })}>
          <span className="font-medium text-sm hover:text-primary">{t.name}</span>
          <span className="ml-2 text-xs text-muted-foreground tabular">{t.abbr}</span>
          {t.nameRequest && <Badge variant="warning" className="ml-2">Name request</Badge>}
          <span className="block text-xs text-muted-foreground truncate">{t.captain} · {t.captainEmail}</span>
        </button>
        <span className="hidden md:block w-20 text-xs text-muted-foreground"><span className="tabular text-foreground">{roster.length}</span> {roster.length === 1 ? "player" : "players"}</span>
        <span className="w-12 text-sm tabular text-right">{t.wins}-{t.losses}</span>
        <span className="w-16 hidden sm:block"><Badge variant={PAY[t.payment].variant}>{PAY[t.payment].label}</Badge></span>
        <Select value={groupKey(t) || "__none"} disabled={!confs.length}
          onValueChange={v => { if (v === "__none") assign(t.id); else { const [c, s] = v.split("/"); assign(t.id, c, s); } }}>
          <SelectTrigger className="h-8 w-36 text-xs" aria-label={`Conference for ${t.name}`}><SelectValue placeholder="No conferences" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Unassigned</SelectItem>
            {confs.flatMap(c => [
              <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>,
              ...c.subdivisions.map(s => <SelectItem key={`${c.name}/${s}`} value={`${c.name}/${s}`}>{c.name} › {s}</SelectItem>),
            ])}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Actions for ${t.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => setPanel({ id: t.id, tab: "roster" })}><Users className="h-4 w-4 mr-2" /> Roster</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPanel({ id: t.id, tab: "identity" })}><Edit className="h-4 w-4 mr-2" /> Edit team</DropdownMenuItem>
            {confs.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><Layers className="h-4 w-4 mr-2" /> Change conference</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => assign(t.id)}>Unassigned</DropdownMenuItem>
                  {confs.flatMap(c => [
                    <DropdownMenuItem key={c.name} onClick={() => assign(t.id, c.name)}>{c.name}</DropdownMenuItem>,
                    ...c.subdivisions.map(s => <DropdownMenuItem key={s} className="pl-6" onClick={() => assign(t.id, c.name, s)}>{s}</DropdownMenuItem>),
                  ])}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem onClick={() => setMoveIds([t.id])}><ArrowRightLeft className="h-4 w-4 mr-2" /> Move to division</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteIds([t.id])}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const Group = ({ division, title, conference, subdivision, list, indent }: { division: string; title: string; conference?: string; subdivision?: string; list: Team[]; indent?: boolean }) => {
    const key = `${division}|${conference ?? ""}|${subdivision ?? ""}`;
    return (
      <div onDragOver={e => { if (dragId) { e.preventDefault(); setDropTarget(key); } }} onDragLeave={() => setDropTarget(d => d === key ? null : d)}
        onDrop={e => { e.preventDefault(); onDrop(division, conference, subdivision); }}
        className={`${indent ? "ml-6 border-l border-border" : ""} ${dropTarget === key ? "bg-primary/5 ring-1 ring-inset ring-primary/40" : ""}`}>
        <div className="px-3 py-1.5 flex items-center gap-2 bg-secondary/40 border-t border-border">
          <span className={`table-header ${!conference ? "text-warning" : ""}`}>{title}</span>
          <span className="text-xs text-muted-foreground tabular">{list.length}</span>
        </div>
        {list.map(renderRow)}
        {list.length === 0 && <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground italic">Drop a team here</div>}
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <LeaguePageTitle title="Teams & Rosters" />
          <p className="text-sm text-muted-foreground mt-1">Drag teams into conferences, move them between divisions, and open a team to manage its roster.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Import CSV</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add team</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search teams or captains..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
        <Select value={divFilter} onValueChange={setDivFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All divisions</SelectItem>{DIVISIONS.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(c => c.length ? [] : DIVISIONS.map(d => d.name))}>{collapsed.length ? "Expand all" : "Collapse all"}</Button>
      </div>

      {selected.length > 0 && (
        <div className="section-card p-3 flex items-center justify-between bg-primary/5 border-primary/30">
          <span className="text-sm font-medium">{selected.length} team{selected.length > 1 ? "s" : ""} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected([])}>Cancel</Button>
            <Button variant="outline" size="sm" onClick={() => setMoveIds(selected)}><ArrowRightLeft className="h-3.5 w-3.5" /> Move to division</Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteIds(selected)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
          </div>
        </div>
      )}

      {DIVISIONS.filter(d => divFilter === "all" || d.name === divFilter).map(d => {
        const list = visible.filter(t => t.division === d.name);
        const count = teams.filter(t => t.division === d.name).length;
        const isCollapsed = collapsed.includes(d.name);
        const confs = CONFERENCES[d.name] ?? [];
        const ids = list.map(t => t.id);
        const allSel = ids.length > 0 && ids.every(id => selected.includes(id));
        return (
          <section key={d.name} className="section-card overflow-hidden">
            <div className="section-card-header flex items-center !justify-start gap-3"
              onDragOver={e => { if (dragId && teams.find(t => t.id === dragId)?.division !== d.name) { e.preventDefault(); setDropTarget(d.name); } }}
              onDrop={e => { e.preventDefault(); onDrop(d.name); }}>
              <button onClick={() => setCollapsed(c => isCollapsed ? c.filter(x => x !== d.name) : [...c, d.name])} className="flex items-center gap-2" aria-expanded={!isCollapsed}>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <h2 className="font-display font-semibold">{d.name}</h2>
              </button>
              <Checkbox checked={allSel} onCheckedChange={c => setSelected(s => c ? Array.from(new Set([...s, ...ids])) : s.filter(x => !ids.includes(x)))} aria-label={`Select all in ${d.name}`} />
              <span className={`text-xs tabular ${count > d.cap ? "text-warning font-medium" : "text-muted-foreground"}`}>{count}/{d.cap} teams</span>
              <Badge variant={d.status === "active" ? "success" : "secondary"}>{d.status === "active" ? "Active" : "Setup"}</Badge>
              {confs.length === 0 && <span className="text-xs text-muted-foreground">No conferences</span>}
              {dropTarget === d.name && <span className="ml-auto text-xs text-primary">Drop to move to {d.name}</span>}
            </div>
            {!isCollapsed && (
              confs.length === 0 ? (
                <div onDragOver={e => { if (dragId) e.preventDefault(); }} onDrop={e => { e.preventDefault(); onDrop(d.name); }}>
                  {list.map(renderRow)}
                  {list.length === 0 && <p className="px-5 py-6 text-center text-sm text-muted-foreground border-t border-border">No teams in this division.</p>}
                </div>
              ) : (
                <>
                  <Group division={d.name} title="Unassigned" list={list.filter(t => !t.conference)} />
                  {confs.map(c => (
                    <div key={c.name}>
                      <Group division={d.name} title={`${c.name} Conference`} conference={c.name} list={list.filter(t => t.conference === c.name && !t.subdivision)} />
                      {c.subdivisions.map(s => <Group key={s} indent division={d.name} title={`${s} subdivision`} conference={c.name} subdivision={s} list={list.filter(t => t.conference === c.name && t.subdivision === s)} />)}
                    </div>
                  ))}
                </>
              )
            )}
          </section>
        );
      })}

      <TeamSidePanel team={panelTeam} roster={panelTeam ? rosters[panelTeam.id] ?? [] : []} allTeams={teams} initialTab={panel?.tab}
        onClose={() => setPanel(null)} onUpdateTeam={updateTeam}
        onUpdateRoster={list => panelTeam && setRosters(prev => ({ ...prev, [panelTeam.id]: list }))}
        onMovePlayers={(ids, to) => panelTeam && movePlayers(panelTeam.id, ids, to)}
        onImport={() => setImportOpen(true)} onMoveDivision={() => panelTeam && setMoveIds([panelTeam.id])} />

      <MoveTeamDialog open={!!moveIds} onOpenChange={o => !o && setMoveIds(null)} teams={teams.filter(t => moveIds?.includes(t.id))} allTeams={teams} onConfirm={confirmMove} />

      <AlertDialog open={!!deleteIds} onOpenChange={o => !o && setDeleteIds(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteIds?.length === 1 ? teams.find(t => t.id === deleteIds[0])?.name : `${deleteIds?.length} teams`}?</AlertDialogTitle>
            <AlertDialogDescription>This removes the team and its roster from this event. It can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddTeamDialog open={addOpen} onOpenChange={setAddOpen} existing={teams} onAdd={t => { setTeams(prev => [...prev, t]); toast({ title: `${t.name} added to ${t.division}` }); }} />

      <TeamRosterImportDialog open={importOpen} onOpenChange={setImportOpen} existingTeams={teams}
        onImport={rows => {
          const lc = (s: string) => s.trim().toLowerCase();
          const created: Team[] = [];
          const matched = new Set<string>();
          const added: Record<string, RosterEntry[]> = {};
          let seq = Date.now();
          rows.forEach(r => {
            const key = `${lc(r.team_name)}|${lc(r.division)}`;
            let team = teams.find(t => `${lc(t.name)}|${lc(t.division)}` === key) ?? created.find(t => `${lc(t.name)}|${lc(t.division)}` === key);
            if (team && teams.includes(team)) matched.add(team.id);
            if (!team) {
              const name = r.team_name.trim();
              team = { id: `${seq++}`, name, abbr: name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X"), division: r.division.trim(),
                captain: r.captain, captainEmail: r.captain_email, coach: r.coach || "N/A", primaryColor: "#334155", secondaryColor: "#f1f5f9",
                wins: 0, losses: 0, payment: "unpaid", rosterLockOverride: false, history: [{ date: today(), text: "Created by CSV import" }] };
              created.push(team);
            }
            const role = lc(r.role);
            const id = seq++;
            (added[team.id] ??= []).push({ player_id: id, member_id: id, player_name: `${r.first_name} ${r.last_name}`.trim(), jersey: r.jersey_number,
              label: role && role !== "player" && role !== "coach" ? r.role.toUpperCase().slice(0, 5) : "", role: role === "coach" ? "coach" : "player", gp: 0, status: "active" });
          });
          if (created.length) setTeams(prev => [...prev, ...created]);
          setRosters(prev => { const next = { ...prev }; Object.entries(added).forEach(([id, l]) => { next[id] = [...(next[id] ?? []), ...l]; }); return next; });
          return { teamsCreated: created.length, teamsMatched: matched.size, playersAdded: rows.length };
        }} />
    </div>
  );
}

function AddTeamDialog({ open, onOpenChange, existing, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; existing: Team[]; onAdd: (t: Team) => void }) {
  const blank = { name: "", abbr: "", division: DIVISIONS[0].name, captain: "", captainEmail: "" };
  const [f, setF] = useState(blank);
  const [tried, setTried] = useState(false);
  const dup = existing.some(t => t.division === f.division && t.name.trim().toLowerCase() === f.name.trim().toLowerCase());
  const errs = useMemo(() => ({
    name: !f.name.trim() ? "Team name is required" : dup ? "A team with this name already exists in this division" : "",
    abbr: !/^[A-Z0-9]{3}$/.test(f.abbr) ? "Use exactly 3 letters or numbers" : "",
    captainEmail: f.captainEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.captainEmail) ? "Enter a valid email" : "",
  }), [f, dup]);
  const valid = !errs.name && !errs.abbr && !errs.captainEmail;
  const close = (o: boolean) => { if (!o) { setF(blank); setTried(false); } onOpenChange(o); };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add team</DialogTitle><DialogDescription>You can set colours, logo and roster after creating it.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1"><Label>Team name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value, abbr: f.abbr || "" })} />{tried && errs.name && <p className="text-xs text-destructive">{errs.name}</p>}</div>
            <div className="space-y-1"><Label>Short name</Label><Input value={f.abbr} maxLength={3} onChange={e => setF({ ...f, abbr: e.target.value.toUpperCase() })} />{tried && errs.abbr && <p className="text-xs text-destructive">{errs.abbr}</p>}</div>
          </div>
          <div className="space-y-1"><Label>Division</Label>
            <Select value={f.division} onValueChange={v => setF({ ...f, division: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DIVISIONS.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Captain name</Label><Input value={f.captain} onChange={e => setF({ ...f, captain: e.target.value })} /></div>
            <div className="space-y-1"><Label>Captain email</Label><Input value={f.captainEmail} onChange={e => setF({ ...f, captainEmail: e.target.value })} />{tried && errs.captainEmail && <p className="text-xs text-destructive">{errs.captainEmail}</p>}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>Cancel</Button>
          <Button onClick={() => { setTried(true); if (!valid) return;
            onAdd({ id: `${Date.now()}`, name: f.name.trim(), abbr: f.abbr, division: f.division, captain: f.captain || "TBD", captainEmail: f.captainEmail, coach: "N/A",
              primaryColor: "#334155", secondaryColor: "#f1f5f9", wins: 0, losses: 0, payment: "unpaid", rosterLockOverride: false, history: [{ date: today(), text: `Created in ${f.division}` }] });
            close(false); }}>Add team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
