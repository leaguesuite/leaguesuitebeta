import { useMemo, useState } from "react";
import { Plus, Trash2, Layers, ChevronDown, ChevronRight, Library, Calendar, X, Check, Info, Users, ArrowRight } from "lucide-react";

/**
 * Conferences & Subgroups
 *
 * Concept:
 *  - League maintains a LIBRARY of reusable conferences (AFC, NFC, ...).
 *  - Each conference has its own library of optional subgroups (East, West, ...).
 *  - When setting up a season, an admin assigns conferences to a Division,
 *    then optionally enables subgroups within each assigned conference.
 *  - Team placement into conferences/subgroups happens in the Teams section.
 */

// ----- Mock types -----
type Subgroup = { id: string; name: string };
type Conference = { id: string; name: string; abbrev: string; subgroups: Subgroup[] };

type Division = {
  id: string;
  name: string;
  category: string;
  teamCount: number;
  conferenceIds: string[];
  // per-conference list of active subgroup IDs in this division/season
  subgroupIdsByConference: Record<string, string[]>;
};

// ----- Mock seed data -----
const initialLibrary: Conference[] = [
  { id: "c-afc", name: "American Football Conference", abbrev: "AFC", subgroups: [
    { id: "sg-afc-e", name: "East" }, { id: "sg-afc-w", name: "West" },
    { id: "sg-afc-n", name: "North" }, { id: "sg-afc-s", name: "South" },
  ]},
  { id: "c-nfc", name: "National Football Conference", abbrev: "NFC", subgroups: [
    { id: "sg-nfc-e", name: "East" }, { id: "sg-nfc-w", name: "West" },
    { id: "sg-nfc-n", name: "North" }, { id: "sg-nfc-s", name: "South" },
  ]},
  { id: "c-eastern", name: "Eastern Conference", abbrev: "Eastern", subgroups: [] },
  { id: "c-western", name: "Western Conference", abbrev: "Western", subgroups: [] },
  { id: "c-american", name: "American League", abbrev: "AL", subgroups: [
    { id: "sg-al-e", name: "East" }, { id: "sg-al-c", name: "Central" }, { id: "sg-al-w", name: "West" },
  ]},
  { id: "c-national", name: "National League", abbrev: "NL", subgroups: [
    { id: "sg-nl-e", name: "East" }, { id: "sg-nl-c", name: "Central" }, { id: "sg-nl-w", name: "West" },
  ]},
];

const initialDivisions: Division[] = [
  {
    id: "d-mens-1", name: "Men's Division 1", category: "Men's", teamCount: 8,
    conferenceIds: ["c-afc", "c-nfc"],
    subgroupIdsByConference: {
      "c-afc": ["sg-afc-e", "sg-afc-w"],
      "c-nfc": ["sg-nfc-e", "sg-nfc-w"],
    },
  },
  {
    id: "d-womens-1", name: "Women's Division 1", category: "Women's", teamCount: 4,
    conferenceIds: ["c-eastern", "c-western"],
    subgroupIdsByConference: {},
  },
  {
    id: "d-coed-open", name: "Co-Ed Open", category: "Co-Ed", teamCount: 4,
    conferenceIds: [],
    subgroupIdsByConference: {},
  },
];

export default function ConferencesPage() {
  const [tab, setTab] = useState<"library" | "season">("season");
  const [library, setLibrary] = useState<Conference[]>(initialLibrary);
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <LeaguePageTitle title="Conferences & Subgroups" />
          <p className="text-sm text-muted-foreground mt-1">
            Optional groupings inside a division. Maintain a reusable library at the league level, then enable conferences and subgroups per season.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {[
          { id: "season", label: "Season Assignment", icon: Calendar },
          { id: "library", label: "League Library", icon: Library },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "library" ? (
        <LibraryTab library={library} setLibrary={setLibrary} />
      ) : (
        <SeasonTab library={library} divisions={divisions} setDivisions={setDivisions} />
      )}
    </div>
  );
}

// ============================================================
// LIBRARY TAB
// ============================================================

function LibraryTab({ library, setLibrary }: { library: Conference[]; setLibrary: (c: Conference[]) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", abbrev: "" });

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addConference = () => {
    if (!draft.name.trim()) return;
    setLibrary([
      ...library,
      { id: `c-${Date.now()}`, name: draft.name.trim(), abbrev: draft.abbrev.trim() || draft.name.trim().slice(0, 3).toUpperCase(), subgroups: [] },
    ]);
    setDraft({ name: "", abbrev: "" });
    setAdding(false);
  };

  const removeConference = (id: string) => setLibrary(library.filter(c => c.id !== id));

  const addSubgroup = (cid: string, name: string) => {
    if (!name.trim()) return;
    setLibrary(library.map(c => c.id === cid ? { ...c, subgroups: [...c.subgroups, { id: `sg-${Date.now()}`, name: name.trim() }] } : c));
  };
  const removeSubgroup = (cid: string, sid: string) =>
    setLibrary(library.map(c => c.id === cid ? { ...c, subgroups: c.subgroups.filter(s => s.id !== sid) } : c));

  return (
    <div className="space-y-4">
      <div className="section-card p-4 bg-primary/5 border-primary/20 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground">
          The library is league-wide. Conferences and their subgroups defined here can be re-used across multiple seasons without re-creating them each time.
        </p>
      </div>

      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">League Conferences</h2>
            <p className="text-xs text-muted-foreground">{library.length} conferences defined</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New conference
          </button>
        </div>

        {adding && (
          <div className="p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 mb-3 flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">Conference name</label>
              <input
                autoFocus value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. American Football Conference"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="w-32">
              <label className="text-xs font-medium text-muted-foreground">Abbreviation</label>
              <input
                value={draft.abbrev} onChange={e => setDraft({ ...draft, abbrev: e.target.value })}
                placeholder="AFC"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <button onClick={addConference} className="h-9 px-3 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 flex items-center gap-2"><Check className="h-4 w-4" /> Save</button>
            <button onClick={() => { setAdding(false); setDraft({ name: "", abbrev: "" }); }} className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary">Cancel</button>
          </div>
        )}

        <div className="space-y-2">
          {library.map(c => (
            <div key={c.id} className="rounded-xl border border-border">
              <div className="flex items-center justify-between p-3">
                <button onClick={() => toggle(c.id)} className="flex items-center gap-3 flex-1 text-left">
                  {expanded[c.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{c.abbrev}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.subgroups.length} subgroup{c.subgroups.length === 1 ? "" : "s"}</div>
                  </div>
                </button>
                <button onClick={() => removeConference(c.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {expanded[c.id] && (
                <SubgroupEditor
                  subgroups={c.subgroups}
                  onAdd={(n) => addSubgroup(c.id, n)}
                  onRemove={(sid) => removeSubgroup(c.id, sid)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubgroupEditor({ subgroups, onAdd, onRemove }: { subgroups: Subgroup[]; onAdd: (n: string) => void; onRemove: (id: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="border-t border-border bg-secondary/30 p-3 space-y-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subgroups</div>
      <div className="flex flex-wrap gap-2">
        {subgroups.length === 0 && <span className="text-xs text-muted-foreground italic">No subgroups — conference will operate flat.</span>}
        {subgroups.map(s => (
          <span key={s.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-md bg-card border border-border text-xs">
            {s.name}
            <button onClick={() => onRemove(s.id)} className="h-5 w-5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { onAdd(name); setName(""); }}}
          placeholder="Add subgroup (e.g. East, West)"
          className="h-8 flex-1 max-w-xs rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        />
        <button onClick={() => { onAdd(name); setName(""); }} className="h-8 px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SEASON TAB — assign conferences & subgroups to a division
// ============================================================

function SeasonTab({ library, divisions, setDivisions }: { library: Conference[]; divisions: Division[]; setDivisions: (d: Division[]) => void }) {
  const [activeDivId, setActiveDivId] = useState(divisions[0]?.id ?? "");
  const active = divisions.find(d => d.id === activeDivId)!;

  const updateActive = (patch: Partial<Division>) =>
    setDivisions(divisions.map(d => d.id === active.id ? { ...d, ...patch } : d));

  const toggleConference = (cid: string) => {
    const has = active.conferenceIds.includes(cid);
    if (has) {
      const next = { ...active.subgroupIdsByConference };
      delete next[cid];
      updateActive({
        conferenceIds: active.conferenceIds.filter(x => x !== cid),
        subgroupIdsByConference: next,
      });
    } else {
      updateActive({ conferenceIds: [...active.conferenceIds, cid] });
    }
  };

  const toggleSubgroup = (cid: string, sid: string) => {
    const current = active.subgroupIdsByConference[cid] ?? [];
    const has = current.includes(sid);
    const next = {
      ...active.subgroupIdsByConference,
      [cid]: has ? current.filter(x => x !== sid) : [...current, sid],
    };
    updateActive({ subgroupIdsByConference: next });
  };

  const assignedConfs = useMemo(
    () => active.conferenceIds.map(id => library.find(c => c.id === id)).filter(Boolean) as Conference[],
    [active.conferenceIds, library]
  );

  const totalSubgroups = Object.values(active.subgroupIdsByConference).reduce((n, arr) => n + arr.length, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
      {/* Division list */}
      <aside className="section-card p-3 h-fit">
        <div className="px-2 pt-1 pb-2 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Divisions</div>
          <span className="text-[10px] text-muted-foreground">Spring 2026</span>
        </div>
        <div className="space-y-1">
          {divisions.map(d => {
            const sgCount = Object.values(d.subgroupIdsByConference).reduce((n, arr) => n + arr.length, 0);
            return (
              <button
                key={d.id}
                onClick={() => setActiveDivId(d.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  d.id === activeDivId ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                }`}
              >
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{d.teamCount} teams</span>
                  <span>·</span>
                  <span>{d.conferenceIds.length === 0 ? "No conferences" : `${d.conferenceIds.length} conf.`}</span>
                  {sgCount > 0 && <><span>·</span><span>{sgCount} subgroups</span></>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Detail */}
      <section className="space-y-5">
        {/* Info banner about team placement */}
        <div className="section-card p-4 bg-primary/5 border-primary/20 flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              Define the segments for <span className="font-semibold">{active.name}</span> here. Teams are placed into conferences and subgroups from the Teams section.
            </p>
          </div>
          <a href="/season/teams" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline shrink-0">
            <Users className="h-3.5 w-3.5" /> Go to Teams <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        {/* Conferences box */}
        <div className="section-card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Conferences in {active.name}
            </h2>
            <span className="text-xs text-muted-foreground">
              {active.conferenceIds.length === 0 ? "Optional — leave empty to run flat" : `${active.conferenceIds.length} active`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Pick conferences from the league library to enable in this season.</p>

          <div className="flex flex-wrap gap-2">
            {library.map(c => {
              const on = active.conferenceIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleConference(c.id)}
                  className={`inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border-2 text-sm transition-all ${
                    on ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/30"
                  }`}
                >
                  <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {c.abbrev}
                  </span>
                  {c.name}
                  {on && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subgroups box */}
        <div className="section-card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Subgroups
            </h2>
            <span className="text-xs text-muted-foreground">
              {assignedConfs.length === 0
                ? "Add a conference first"
                : totalSubgroups === 0 ? "Optional — leave empty to skip" : `${totalSubgroups} active`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Within each conference, pick which subgroups (from its library) are in play this season.
          </p>

          {assignedConfs.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <Layers className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No conferences selected</p>
              <p className="text-xs text-muted-foreground mt-1">Enable a conference above to choose its subgroups.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedConfs.map(conf => {
                const active_sgs = active.subgroupIdsByConference[conf.id] ?? [];
                return (
                  <div key={conf.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">{conf.abbrev}</span>
                        </div>
                        <div className="text-sm font-semibold text-foreground">{conf.name}</div>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {conf.subgroups.length === 0
                          ? "No subgroups in library"
                          : `${active_sgs.length} of ${conf.subgroups.length} active`}
                      </span>
                    </div>

                    {conf.subgroups.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic px-1">
                        This conference has no subgroups defined in the library. Add some in the League Library tab.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {conf.subgroups.map(sg => {
                          const on = active_sgs.includes(sg.id);
                          return (
                            <button
                              key={sg.id}
                              onClick={() => toggleSubgroup(conf.id, sg.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 text-xs transition-all ${
                                on ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/30"
                              }`}
                            >
                              {sg.name}
                              {on && <Check className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
