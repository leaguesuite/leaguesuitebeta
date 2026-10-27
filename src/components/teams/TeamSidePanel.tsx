import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockMembers } from "@/data/mockMembers";
import { Trash2, UserX, UserCheck, Upload, UserPlus, Check, X, ArrowRightLeft, History, ImageIcon } from "lucide-react";
import { PaymentStatus, RosterEntry, RosterRole, Team, today } from "./teamsData";

interface Props {
  team: Team | null;
  roster: RosterEntry[];
  allTeams: Team[];
  initialTab?: string;
  onClose: () => void;
  onUpdateTeam: (t: Team) => void;
  onUpdateRoster: (list: RosterEntry[]) => void;
  onMovePlayers: (playerIds: number[], toTeamId: string) => void;
  onImport: () => void;
  onMoveDivision: () => void;
}

export function TeamLogo({ team, size = "h-8 w-8 text-[10px]" }: { team: Team; size?: string }) {
  return (
    <div className={`${size} shrink-0 rounded-md overflow-hidden flex items-center justify-center font-display font-bold ring-1 ring-border`}
      style={team.logoUrl ? undefined : { background: team.primaryColor, color: team.secondaryColor }}>
      {team.logoUrl ? <img src={team.logoUrl} alt="" className="h-full w-full object-contain bg-card" /> : team.abbr}
    </div>
  );
}

export default function TeamSidePanel({ team, roster, allTeams, initialTab = "roster", onClose, onUpdateTeam, onUpdateRoster, onMovePlayers, onImport, onMoveDivision }: Props) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [team?.id, initialTab]);
  return (
    <Sheet open={!!team} onOpenChange={o => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {team && (
          <>
            <SheetHeader className="mb-4">
              <div className="flex items-center gap-3">
                <TeamLogo team={team} size="h-11 w-11 text-xs" />
                <div className="text-left">
                  <SheetTitle className="font-display">{team.name}</SheetTitle>
                  <SheetDescription>{team.division}{team.conference ? ` · ${team.conference}` : ""}{team.subdivision ? ` · ${team.subdivision}` : ""} · <span className="tabular">{team.wins}-{team.losses}</span></SheetDescription>
                </div>
                <Button variant="outline" size="sm" className="ml-auto mr-6" onClick={onMoveDivision}><ArrowRightLeft className="h-3.5 w-3.5" /> Move</Button>
              </div>
            </SheetHeader>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="roster">Roster ({roster.length})</TabsTrigger>
                <TabsTrigger value="identity">Identity{team.nameRequest ? " •" : ""}</TabsTrigger>
                <TabsTrigger value="captain">Captain</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="roster"><RosterTab key={team.id} team={team} roster={roster} allTeams={allTeams} onUpdate={onUpdateRoster} onMovePlayers={onMovePlayers} onImport={onImport} /></TabsContent>
              <TabsContent value="identity"><IdentityTab key={team.id} team={team} onUpdate={onUpdateTeam} /></TabsContent>
              <TabsContent value="captain"><CaptainTab team={team} onUpdate={onUpdateTeam} /></TabsContent>
              <TabsContent value="history">
                <ol className="space-y-3 mt-4">
                  {[...team.history].reverse().map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <History className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div><p>{h.text}</p><p className="text-xs text-muted-foreground">{h.date}</p></div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function RosterTab({ team, roster, allTeams, onUpdate, onMovePlayers, onImport }: {
  team: Team; roster: RosterEntry[]; allTeams: Team[]; onUpdate: (l: RosterEntry[]) => void; onMovePlayers: (ids: number[], to: string) => void; onImport: () => void;
}) {
  const { toast } = useToast();
  const [sel, setSel] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const set = (id: number, patch: Partial<RosterEntry>) => onUpdate(roster.map(p => p.player_id === id ? { ...p, ...patch } : p));
  const dupes = useMemo(() => {
    const c: Record<string, number> = {};
    roster.forEach(p => { if (p.jersey) c[p.jersey] = (c[p.jersey] ?? 0) + 1; });
    return c;
  }, [roster]);
  const selected = roster.filter(p => sel.includes(p.player_id));
  const allSel = roster.length > 0 && sel.length === roster.length;

  const bulk = (patch: Partial<RosterEntry>, msg: string) => { onUpdate(roster.map(p => sel.includes(p.player_id) ? { ...p, ...patch } : p)); toast({ title: msg }); setSel([]); };
  const candidates = mockMembers.filter(m => !roster.some(r => r.member_id === m.member_id) && `${m.first_name} ${m.last_name}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setAdding(a => !a)}><UserPlus className="h-4 w-4" /> Add players</Button>
        <Button size="sm" variant="outline" onClick={onImport}><Upload className="h-4 w-4" /> Import</Button>
        <span className="ml-auto text-xs text-muted-foreground"><span className="tabular">{roster.filter(p => p.status === "active").length}</span> active</span>
      </div>

      {adding && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <Input autoFocus placeholder="Search members by name..." value={q} onChange={e => setQ(e.target.value)} />
          {candidates.map(m => (
            <button key={m.member_id} className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-md hover:bg-secondary/60"
              onClick={() => { onUpdate([...roster, { player_id: Date.now(), member_id: m.member_id, player_name: `${m.first_name} ${m.last_name}`, jersey: "", label: "", role: "player", gp: 0, status: "active" }]); toast({ title: `${m.first_name} ${m.last_name} added` }); }}>
              <span>{m.first_name} {m.last_name}</span><span className="text-xs text-muted-foreground tabular">#{m.member_id}</span>
            </button>
          ))}
          {candidates.length === 0 && <p className="text-xs text-muted-foreground px-2">No matching members.</p>}
        </div>
      )}

      {sel.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
          <span className="font-medium">{sel.length} selected</span>
          <Select onValueChange={v => bulk({ role: v as RosterRole }, `Role set to ${v}`)}>
            <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Set role" /></SelectTrigger>
            <SelectContent><SelectItem value="player">Player</SelectItem><SelectItem value="coach">Coach</SelectItem></SelectContent>
          </Select>
          <Button size="sm" variant="outline" disabled={!selected.some(p => p.status === "active")} onClick={() => bulk({ status: "inactive" }, "Players set inactive")}><UserX className="h-3.5 w-3.5" /> Set inactive</Button>
          <Select onValueChange={to => { onMovePlayers(sel, to); toast({ title: `Moved ${sel.length} player(s) to ${allTeams.find(t => t.id === to)?.name}` }); setSel([]); }}>
            <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Move to team" /></SelectTrigger>
            <SelectContent>{allTeams.filter(t => t.id !== team.id).map(t => <SelectItem key={t.id} value={t.id}>{t.name} · {t.division}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSel([])}>Clear</Button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr>
              <th className="px-3 py-2 w-8"><Checkbox checked={allSel} onCheckedChange={c => setSel(c ? roster.map(p => p.player_id) : [])} aria-label="Select all players" /></th>
              <th className="table-header text-left px-2 py-2 w-16">#</th>
              <th className="table-header text-left px-2 py-2">Player</th>
              <th className="table-header text-left px-2 py-2 w-20">Label</th>
              <th className="table-header text-left px-2 py-2 w-28">Role</th>
              <th className="table-header text-right px-2 py-2 w-10">GP</th>
              <th className="table-header text-right px-3 py-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {roster.map(p => (
              <tr key={p.player_id} className={`border-t border-border ${p.status === "inactive" ? "opacity-60" : ""}`}>
                <td className="px-3 py-1.5"><Checkbox checked={sel.includes(p.player_id)} onCheckedChange={c => setSel(s => c ? [...s, p.player_id] : s.filter(x => x !== p.player_id))} aria-label={`Select ${p.player_name}`} /></td>
                <td className="px-2 py-1.5"><Input value={p.jersey} maxLength={3} inputMode="numeric" onChange={e => set(p.player_id, { jersey: e.target.value.replace(/\D/g, "") })} className={`h-8 w-12 tabular px-2 ${p.jersey && dupes[p.jersey] > 1 ? "border-destructive" : ""}`} aria-label={`Jersey for ${p.player_name}`} /></td>
                <td className="px-2 py-1.5">
                  <div className="font-medium leading-tight">{p.player_name}</div>
                  <div className="text-xs text-muted-foreground tabular">ID {p.member_id}{p.status === "inactive" && " · Inactive"}</div>
                </td>
                <td className="px-2 py-1.5"><Input value={p.label} maxLength={5} placeholder="—" onChange={e => set(p.player_id, { label: e.target.value.toUpperCase() })} className="h-8 w-16 px-2" aria-label={`Label for ${p.player_name}`} /></td>
                <td className="px-2 py-1.5">
                  <Select value={p.role} onValueChange={v => set(p.player_id, { role: v as RosterRole })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="player">Player</SelectItem><SelectItem value="coach">Coach</SelectItem></SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1.5 text-right tabular">{p.gp}</td>
                <td className="px-3 py-1.5 text-right">
                  {p.gp === 0 ? (
                    <Button size="sm" variant="ghost" title="Remove (no games played)" onClick={() => { onUpdate(roster.filter(x => x.player_id !== p.player_id)); toast({ title: `${p.player_name} removed` }); }}><Trash2 className="h-4 w-4" /></Button>
                  ) : p.status === "active" ? (
                    <Button size="sm" variant="ghost" title="Set inactive" onClick={() => set(p.player_id, { status: "inactive" })}><UserX className="h-4 w-4" /></Button>
                  ) : (
                    <Button size="sm" variant="ghost" title="Reactivate" onClick={() => set(p.player_id, { status: "active" })}><UserCheck className="h-4 w-4" /></Button>
                  )}
                </td>
              </tr>
            ))}
            {roster.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">No players yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Players who have played a game can't be removed. Set them inactive instead to keep their stats.</p>
    </div>
  );
}

function IdentityTab({ team, onUpdate }: { team: Team; onUpdate: (t: Team) => void }) {
  const { toast } = useToast();
  const [f, setF] = useState(team);
  const logoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const abbrOk = /^[A-Z0-9]{3}$/.test(f.abbr);
  const nameOk = f.name.trim().length > 0;

  const pick = (file: File | undefined, key: "logoUrl" | "teamPhotoUrl") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Please choose an image file", variant: "destructive" });
    setF(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const resolveRequest = (approve: boolean) => {
    const req = team.nameRequest!;
    const next: Team = approve
      ? { ...team, name: req.name, nameRequest: undefined, history: [...team.history, { date: today(), text: `Name changed from ${team.name} to ${req.name} (captain request approved)` }] }
      : { ...team, nameRequest: undefined, history: [...team.history, { date: today(), text: `Name change to "${req.name}" declined` }] };
    onUpdate(next); setF(next);
    toast({ title: approve ? "Name change approved" : "Name change declined" });
  };

  return (
    <div className="space-y-5 mt-4">
      {team.nameRequest && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-2">
          <p className="text-sm"><span className="font-medium">Captain requested a new name:</span> “{team.nameRequest.name}”</p>
          {team.nameRequest.reason && <p className="text-xs text-muted-foreground">Reason: {team.nameRequest.reason}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => resolveRequest(true)}><Check className="h-3.5 w-3.5" /> Approve</Button>
            <Button size="sm" variant="outline" onClick={() => resolveRequest(false)}><X className="h-3.5 w-3.5" /> Decline</Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5"><Label>Team name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          {!nameOk && <p className="text-xs text-destructive">Team name is required</p>}</div>
        <div className="space-y-1.5"><Label>Short name</Label><Input value={f.abbr} maxLength={3} onChange={e => setF({ ...f, abbr: e.target.value.toUpperCase() })} className="tabular" />
          {!abbrOk && <p className="text-xs text-destructive">Use exactly 3 letters or numbers</p>}</div>
      </div>
      <div className="flex gap-6">
        {(["primaryColor", "secondaryColor"] as const).map(k => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="color" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className="h-9 w-9 rounded-md border border-border cursor-pointer bg-card" />
            <span><span className="block">{k === "primaryColor" ? "Primary" : "Secondary"}</span><span className="tabular text-xs text-muted-foreground">{f[k].toUpperCase()}</span></span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            <TeamLogo team={f} size="h-16 w-16 text-base" />
            <div className="space-y-1">
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files?.[0], "logoUrl")} />
              <Button size="sm" variant="outline" onClick={() => logoRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload</Button>
              {f.logoUrl && <Button size="sm" variant="ghost" onClick={() => setF({ ...f, logoUrl: undefined })}>Remove</Button>}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Team photo</Label>
          <div className="aspect-video rounded-lg border border-dashed border-border bg-secondary/30 overflow-hidden flex items-center justify-center">
            {f.teamPhotoUrl ? <img src={f.teamPhotoUrl} alt="Team" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files?.[0], "teamPhotoUrl")} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => photoRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload</Button>
            {f.teamPhotoUrl && <Button size="sm" variant="ghost" onClick={() => setF({ ...f, teamPhotoUrl: undefined })}>Remove</Button>}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button disabled={!nameOk || !abbrOk} onClick={() => {
          const renamed = f.name.trim() !== team.name;
          onUpdate({ ...f, name: f.name.trim(), history: renamed ? [...f.history, { date: today(), text: `Renamed from ${team.name} to ${f.name.trim()}` }] : f.history });
          toast({ title: "Team saved" });
        }}>Save changes</Button>
      </div>
    </div>
  );
}

function CaptainTab({ team, onUpdate }: { team: Team; onUpdate: (t: Team) => void }) {
  const [name, setName] = useState(team.captain);
  const [email, setEmail] = useState(team.captainEmail);
  useEffect(() => { setName(team.captain); setEmail(team.captainEmail); }, [team.id, team.captain, team.captainEmail]);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const payBadge: Record<PaymentStatus, JSX.Element> = {
    paid: <Badge variant="success">Paid</Badge>, partial: <Badge variant="warning">Partial</Badge>, unpaid: <Badge variant="destructive">Unpaid</Badge>,
  };
  return (
    <div className="space-y-5 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Captain name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Captain email</Label><Input value={email} onChange={e => setEmail(e.target.value)} />
          {!emailOk && <p className="text-xs text-destructive">Enter a valid email</p>}</div>
      </div>
      <p className="text-xs text-muted-foreground">The captain signs in to the Captain's Portal with this email.</p>
      <div className="flex justify-end">
        <Button size="sm" disabled={!emailOk || !name.trim() || (name === team.captain && email === team.captainEmail)}
          onClick={() => onUpdate({ ...team, captain: name.trim(), captainEmail: email.trim(), history: [...team.history, { date: today(), text: `Captain changed to ${name.trim()} (${email.trim()})` }] })}>Save captain</Button>
      </div>
      <div className="rounded-lg border border-border divide-y divide-border">
        <div className="flex items-center justify-between p-4">
          <div><p className="text-sm font-medium">Registration payment</p><div className="mt-1">{payBadge[team.payment]}</div></div>
          <Select value={team.payment} onValueChange={v => onUpdate({ ...team, payment: v as PaymentStatus })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4">
          <div><p className="text-sm font-medium">Allow roster changes after lock</p><p className="text-xs text-muted-foreground">Lets this captain keep editing the roster after the league's lock date.</p></div>
          <Switch checked={team.rosterLockOverride} onCheckedChange={c => onUpdate({ ...team, rosterLockOverride: c })} />
        </div>
      </div>
    </div>
  );
}
