import { Fragment, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Search, Smartphone, Monitor, Trophy } from "lucide-react";

type Module = "games" | "rosters" | "standings" | "access" | "registration";
type Platform = "web" | "mobile" | "captain";

interface Change { field: string; before: string; after: string; }
interface ActivityEntry {
  id: string;
  when: string;
  date: string;
  actor: string;
  role: string;
  platform: Platform;
  module: Module;
  summary: string;
  target: string;
  changes: Change[];
  note?: string;
}

const MODULE_LABEL: Record<Module, string> = {
  games: "Games & Scoring",
  rosters: "Rosters",
  standings: "Standings & Playoffs",
  access: "Access & Security",
  registration: "Registration & Payments",
};

const PLATFORM: Record<Platform, { label: string; icon: typeof Monitor }> = {
  web: { label: "Admin site", icon: Monitor },
  mobile: { label: "Scorekeeper app", icon: Smartphone },
  captain: { label: "Captain's portal", icon: Trophy },
};

const ENTRIES: ActivityEntry[] = [
  { id: "a1", when: "10:42 AM", date: "Today", actor: "David Kim", role: "Statistician", platform: "web", module: "games",
    summary: "changed the final score", target: "Game #G-104 · Eagles vs Tigers",
    changes: [{ field: "Eagles score", before: "21", after: "28" }, { field: "Q4 Eagles", before: "7", after: "14" }],
    note: "Missed touchdown corrected from the scoresheet." },
  { id: "a2", when: "9:15 AM", date: "Today", actor: "Mike Torres", role: "Scorekeeper", platform: "mobile", module: "games",
    summary: "submitted the final score", target: "Game #G-103 · Hawks vs Wolves",
    changes: [{ field: "Status", before: "Live", after: "Final" }, { field: "Score", before: "—", after: "14–20" }] },
  { id: "a3", when: "8:02 AM", date: "Today", actor: "Kevin Garcia", role: "Captain", platform: "captain", module: "rosters",
    summary: "added a player", target: "Lions roster",
    changes: [{ field: "Player", before: "—", after: "Sarah Connor" }, { field: "Jersey #", before: "—", after: "7" }] },
  { id: "a4", when: "4:30 PM", date: "Yesterday", actor: "Emily Watson", role: "Manager", platform: "web", module: "standings",
    summary: "applied a standings override", target: "Division A standings",
    changes: [{ field: "Tigers point differential", before: "+12", after: "+14" }],
    note: "Forfeit adjustment approved by the league committee." },
  { id: "a5", when: "2:11 PM", date: "Yesterday", actor: "Kevin Garcia", role: "Captain", platform: "captain", module: "rosters",
    summary: "marked a player inactive", target: "Lions roster · Tom Becker",
    changes: [{ field: "Status", before: "Active", after: "Inactive" }] },
  { id: "a6", when: "11:20 AM", date: "Yesterday", actor: "John Doe", role: "Owner", platform: "web", module: "access",
    summary: "invited a user", target: "kevin.garcia@example.com",
    changes: [{ field: "Role", before: "—", after: "Captain" }, { field: "Team", before: "—", after: "Lions" }] },
  { id: "a7", when: "3:45 PM", date: "Oct 24", actor: "Emily Watson", role: "Manager", platform: "web", module: "registration",
    summary: "recorded an offline payment", target: "Eagles registration",
    changes: [{ field: "Paid", before: "$0", after: "$150 (cash)" }, { field: "Balance", before: "$150", after: "$0" }] },
  { id: "a8", when: "1:05 PM", date: "Oct 24", actor: "John Doe", role: "Owner", platform: "web", module: "access",
    summary: "changed a user's role", target: "Sarah Chen",
    changes: [{ field: "Role", before: "Statistician", after: "CMS" }] },
  { id: "a9", when: "9:30 AM", date: "Oct 23", actor: "Emily Watson", role: "Manager", platform: "web", module: "standings",
    summary: "changed a playoff seed", target: "Fall Playoffs bracket",
    changes: [{ field: "Hawks seed", before: "4", after: "3" }, { field: "Wolves seed", before: "3", after: "4" }] },
];

export default function ActivityLog() {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState<"all" | Module>("all");
  const [actor, setActor] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const actors = useMemo(() => Array.from(new Set(ENTRIES.map(e => e.actor))), []);
  const q = search.toLowerCase();
  const rows = ENTRIES.filter(e =>
    (module === "all" || e.module === module) &&
    (actor === "all" || e.actor === actor) &&
    (`${e.actor} ${e.summary} ${e.target}`.toLowerCase().includes(q))
  );

  const selectCls = "h-9 rounded-lg border border-border bg-card px-3 text-sm";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity..." className="pl-9 w-64" />
        </div>
        <select className={selectCls} value={module} onChange={e => setModule(e.target.value as "all" | Module)}>
          <option value="all">All areas</option>
          {(Object.keys(MODULE_LABEL) as Module[]).map(m => <option key={m} value={m}>{MODULE_LABEL[m]}</option>)}
        </select>
        <select className={selectCls} value={actor} onChange={e => setActor(e.target.value)}>
          <option value="all">All people</option>
          {actors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">Visible to Owner and Managers only · entries can't be edited or deleted</span>
      </div>

      <div className="section-card overflow-hidden">
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No activity matches these filters.</p>}
        {rows.map((e, i) => {
          const P = PLATFORM[e.platform];
          const isOpen = open === e.id;
          const showDate = i === 0 || rows[i - 1].date !== e.date;
          return (
            <Fragment key={e.id}>
              {showDate && <div className="table-header px-5 py-2 bg-secondary/40 border-b border-border">{e.date}</div>}
              <button onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen}
                className="w-full flex items-center gap-4 px-5 py-3 border-b border-border text-left hover:bg-secondary/40 transition-colors">
                <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                <span className="tabular text-xs text-muted-foreground w-16 shrink-0">{e.when}</span>
                <div className="flex-1 min-w-0 text-sm truncate">
                  <span className="font-medium text-foreground">{e.actor}</span>{" "}
                  <span className="text-muted-foreground">{e.summary}</span>{" "}
                  <span className="text-foreground">· {e.target}</span>
                </div>
                <Badge variant="soft" className="shrink-0">{e.role}</Badge>
                <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-32"><P.icon className="h-3.5 w-3.5" />{P.label}</span>
              </button>
              {isOpen && (
                <div className="px-5 py-4 pl-14 bg-secondary/20 border-b border-border space-y-3">
                  <table className="text-sm">
                    <thead>
                      <tr><th className="table-header text-left pr-8 pb-1">Field</th><th className="table-header text-left pr-8 pb-1">Before</th><th className="table-header text-left pb-1">After</th></tr>
                    </thead>
                    <tbody>
                      {e.changes.map(c => (
                        <tr key={c.field}>
                          <td className="pr-8 py-1 text-muted-foreground">{c.field}</td>
                          <td className="pr-8 py-1 tabular text-destructive line-through">{c.before}</td>
                          <td className="py-1 tabular text-success font-medium">{c.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {e.note && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Reason:</span> {e.note}</p>}
                  <p className="text-xs text-muted-foreground">{MODULE_LABEL[e.module]} · {e.date}, {e.when} · via {P.label}</p>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
