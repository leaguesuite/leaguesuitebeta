import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Upload, Lock, Plus, Trash2, UserX, UserCheck, Send, LogOut, Clock } from "lucide-react";

type Status = "active" | "inactive";
interface Player { id: number; name: string; email: string; jersey: string; label: string; gp: number; status: Status; }

// Demo data: the signed-in captain and their registered team.
const CAPTAIN = { name: "Kevin Garcia", email: "kevin.garcia@example.com" };
const TEAM = { name: "Lions", division: "Division B", event: "Fall 2026 Season" };
const ROSTER_LOCK = { enabled: true, date: "Nov 15, 2026", locked: false };
const ROSTER_CAP = 14;

const INITIAL: Player[] = [
  { id: 1, name: "Kevin Garcia", email: "kevin.garcia@example.com", jersey: "1", label: "QB", gp: 6, status: "active" },
  { id: 2, name: "Tom Becker", email: "tom.b@example.com", jersey: "12", label: "", gp: 3, status: "inactive" },
  { id: 3, name: "Sarah Connor", email: "sarah.c@example.com", jersey: "7", label: "", gp: 0, status: "active" },
  { id: 4, name: "Andre Lewis", email: "andre.l@example.com", jersey: "22", label: "RB", gp: 6, status: "active" },
  { id: 5, name: "Priya Shah", email: "priya.s@example.com", jersey: "9", label: "", gp: 5, status: "active" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CaptainPortalPage() {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>(INITIAL);
  const [logo, setLogo] = useState<string | null>(null);
  const [primary, setPrimary] = useState("#C8102E");
  const [secondary, setSecondary] = useState("#F2A900");
  const [addOpen, setAddOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const locked = ROSTER_LOCK.enabled && ROSTER_LOCK.locked;
  const activeCount = players.filter(p => p.status === "active").length;
  const jerseyTaken = (j: string, id?: number) => !!j && players.some(p => p.jersey === j && p.id !== id);

  const update = (id: number, patch: Partial<Player>) => setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));

  const onLogo = (f?: File) => {
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(f.type)) return toast({ title: "Use a PNG, JPG or SVG file", variant: "destructive" });
    if (f.size > 2 * 1024 * 1024) return toast({ title: "Logo must be under 2 MB", variant: "destructive" });
    setLogo(URL.createObjectURL(f));
    toast({ title: "Logo updated" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold">Captain's Portal</span>
          <span className="text-sm text-muted-foreground">· Metro Flag League</span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{CAPTAIN.email}</span>
            <Button variant="ghost" size="sm"><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Team header */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-border" style={{ background: logo ? undefined : primary }}>
            {logo ? <img src={logo} alt="Team logo" className="h-full w-full object-contain bg-card" /> : <span className="font-display text-xl font-bold" style={{ color: secondary }}>{TEAM.name.slice(0, 2).toUpperCase()}</span>}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{TEAM.name}</h1>
            <p className="text-sm text-muted-foreground">{TEAM.division} · {TEAM.event}</p>
          </div>
        </div>

        {ROSTER_LOCK.enabled && (
          <div className={`rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${locked ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
            {locked ? <Lock className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-warning" />}
            {locked ? "The roster is locked. Contact the league to make changes." : `Roster changes close on ${ROSTER_LOCK.date}.`}
          </div>
        )}

        {/* Team identity */}
        <section className="section-card">
          <div className="section-card-header"><h2 className="font-semibold">Team Identity</h2></div>
          <div className="p-5 grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Team name</Label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-secondary/40 text-sm">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />{TEAM.name}
              </div>
              {pendingName
                ? <p className="text-xs text-muted-foreground">Change to “{pendingName}” requested. Waiting for league approval.</p>
                : <button className="text-xs text-primary hover:underline" onClick={() => setRenameOpen(true)}>Request a name change</button>}
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={e => onLogo(e.target.files?.[0])} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Upload logo</Button>
                {logo && <Button variant="ghost" onClick={() => setLogo(null)}>Remove</Button>}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG or SVG, up to 2 MB.</p>
            </div>
            <div className="space-y-2">
              <Label>Team colors</Label>
              <div className="flex gap-4">
                {[["Primary", primary, setPrimary], ["Secondary", secondary, setSecondary]].map(([l, v, set]) => (
                  <label key={l as string} className="flex items-center gap-2 text-sm">
                    <input type="color" value={v as string} onChange={e => (set as (s: string) => void)(e.target.value)} className="h-9 w-9 rounded-md border border-border cursor-pointer bg-card" />
                    <span><span className="block">{l as string}</span><span className="tabular text-xs text-muted-foreground">{(v as string).toUpperCase()}</span></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roster */}
        <section className="section-card overflow-hidden">
          <div className="section-card-header flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Roster</h2>
              <p className="text-xs text-muted-foreground"><span className="tabular">{activeCount}/{ROSTER_CAP}</span> active players</p>
            </div>
            <Button size="sm" disabled={locked || activeCount >= ROSTER_CAP} onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add player</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="table-header text-left px-5 py-2 w-20">#</th>
                <th className="table-header text-left px-5 py-2">Player</th>
                <th className="table-header text-left px-5 py-2 w-24">Label</th>
                <th className="table-header text-right px-5 py-2 w-16">GP</th>
                <th className="table-header text-left px-5 py-2 w-24">Status</th>
                <th className="table-header text-right px-5 py-2 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className={`border-b border-border last:border-0 ${p.status === "inactive" ? "opacity-60" : ""}`}>
                  <td className="px-5 py-2">
                    <Input value={p.jersey} disabled={locked} inputMode="numeric" maxLength={3}
                      onChange={e => update(p.id, { jersey: e.target.value.replace(/\D/g, "") })}
                      className={`h-8 w-14 tabular ${jerseyTaken(p.jersey, p.id) ? "border-destructive" : ""}`} aria-label={`Jersey for ${p.name}`} />
                  </td>
                  <td className="px-5 py-2"><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.email}</div></td>
                  <td className="px-5 py-2"><Input value={p.label} disabled={locked} maxLength={5} onChange={e => update(p.id, { label: e.target.value.toUpperCase() })} className="h-8 w-16" aria-label={`Label for ${p.name}`} /></td>
                  <td className="px-5 py-2 text-right tabular">{p.gp}</td>
                  <td className="px-5 py-2">{p.status === "active" ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td>
                  <td className="px-5 py-2 text-right">
                    {p.gp === 0 ? (
                      <Button variant="ghost" size="sm" disabled={locked} onClick={() => { setPlayers(prev => prev.filter(x => x.id !== p.id)); toast({ title: `${p.name} removed` }); }}>
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    ) : p.status === "active" ? (
                      p.email === CAPTAIN.email
                        ? <Badge variant="soft">Captain</Badge>
                        : <Button variant="ghost" size="sm" disabled={locked} onClick={() => update(p.id, { status: "inactive" })}><UserX className="h-4 w-4" /> Set inactive</Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled={locked || activeCount >= ROSTER_CAP} onClick={() => update(p.id, { status: "active" })}><UserCheck className="h-4 w-4" /> Reactivate</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-3 text-xs text-muted-foreground border-t border-border bg-secondary/20">Players who have played a game can't be removed. Set them inactive instead, and their stats stay with the team.</p>
        </section>
      </main>

      <AddPlayerDialog open={addOpen} onOpenChange={setAddOpen} jerseyTaken={j => jerseyTaken(j)}
        onAdd={pl => { setPlayers(prev => [...prev, { ...pl, id: Date.now(), gp: 0, status: "active" }]); toast({ title: `${pl.name} added` }); }} />
      <RenameDialog open={renameOpen} onOpenChange={setRenameOpen} current={TEAM.name}
        onSubmit={n => { setPendingName(n); toast({ title: "Request sent", description: "League admins will review your name change." }); }} />
    </div>
  );
}

function AddPlayerDialog({ open, onOpenChange, onAdd, jerseyTaken }: {
  open: boolean; onOpenChange: (o: boolean) => void; jerseyTaken: (j: string) => boolean;
  onAdd: (p: { name: string; email: string; jersey: string; label: string }) => void;
}) {
  const [f, setF] = useState({ name: "", email: "", jersey: "", label: "" });
  const [tried, setTried] = useState(false);
  const errs = {
    name: !f.name.trim() ? "Name is required" : "",
    email: !EMAIL_RE.test(f.email) ? "Enter a valid email" : "",
    jersey: jerseyTaken(f.jersey) ? "That number is already taken" : "",
  };
  const valid = !errs.name && !errs.email && !errs.jersey;
  const close = (o: boolean) => { if (!o) { setF({ name: "", email: "", jersey: "", label: "" }); setTried(false); } onOpenChange(o); };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add player</DialogTitle><DialogDescription>They'll get an email to confirm they're on your team.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          {([["name", "Full name"], ["email", "Email"]] as const).map(([k, l]) => (
            <div key={k} className="space-y-1">
              <Label>{l}</Label>
              <Input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
              {tried && errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Jersey #</Label><Input value={f.jersey} maxLength={3} onChange={e => setF({ ...f, jersey: e.target.value.replace(/\D/g, "") })} />
              {tried && errs.jersey && <p className="text-xs text-destructive">{errs.jersey}</p>}</div>
            <div className="space-y-1"><Label>Label (optional)</Label><Input value={f.label} maxLength={5} onChange={e => setF({ ...f, label: e.target.value.toUpperCase() })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>Cancel</Button>
          <Button onClick={() => { setTried(true); if (valid) { onAdd(f); close(false); } }}>Add player</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameDialog({ open, onOpenChange, current, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; current: string; onSubmit: (n: string) => void;
}) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const ok = name.trim() && name.trim().toLowerCase() !== current.toLowerCase();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Request a name change</DialogTitle><DialogDescription>League admins approve all team name changes.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>New team name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder={current} /></div>
          <div className="space-y-1"><Label>Reason (optional)</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!ok} onClick={() => { onSubmit(name.trim()); setName(""); setReason(""); onOpenChange(false); }}><Send className="h-4 w-4" /> Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
