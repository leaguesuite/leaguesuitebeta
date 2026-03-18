import { useState } from "react";
import { Plus, Search, Trophy, Star, Award, Medal, Crown, Target, Zap, Edit, Trash2, ArrowLeft, X, Users, UserCheck, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type RecipientType = "player" | "team";

interface Accolade {
  id: string;
  title: string;
  description: string;
  icon: string;
  recipientType: RecipientType;
  recipientName: string;
  season: string;
  division: string;
  awardedAt: string;
  category: string;
}

interface AwardTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  recipientType: RecipientType;
  category: string;
}

const iconOptions = [
  { value: "trophy", label: "Trophy", Icon: Trophy },
  { value: "star", label: "Star", Icon: Star },
  { value: "award", label: "Award", Icon: Award },
  { value: "medal", label: "Medal", Icon: Medal },
  { value: "crown", label: "Crown", Icon: Crown },
  { value: "target", label: "Target", Icon: Target },
  { value: "zap", label: "Lightning", Icon: Zap },
];

const getIcon = (value: string) => iconOptions.find(i => i.value === value)?.Icon || Trophy;

const awardCategories = ["Season MVP", "Performance", "Sportsmanship", "Championship", "Statistical Leader", "Special Recognition"];

const initialTemplates: AwardTemplate[] = [
  { id: "t1", title: "Season MVP", description: "Most Valuable Player of the season", icon: "trophy", recipientType: "player", category: "Season MVP" },
  { id: "t2", title: "Offensive Player of the Year", description: "Top offensive performer", icon: "zap", recipientType: "player", category: "Performance" },
  { id: "t3", title: "Defensive Player of the Year", description: "Top defensive performer", icon: "target", recipientType: "player", category: "Performance" },
  { id: "t4", title: "Rookie of the Year", description: "Outstanding first-year player", icon: "star", recipientType: "player", category: "Performance" },
  { id: "t5", title: "Championship Winner", description: "Season championship team", icon: "crown", recipientType: "team", category: "Championship" },
  { id: "t6", title: "Sportsmanship Award", description: "Exemplary sportsmanship on and off the field", icon: "award", recipientType: "player", category: "Sportsmanship" },
  { id: "t7", title: "Best Record", description: "Team with the best regular season record", icon: "medal", recipientType: "team", category: "Statistical Leader" },
  { id: "t8", title: "Passing Leader", description: "Most passing yards in the season", icon: "target", recipientType: "player", category: "Statistical Leader" },
];

const initialAccolades: Accolade[] = [
  { id: "a1", title: "Season MVP", description: "Most Valuable Player of the season", icon: "trophy", recipientType: "player", recipientName: "Marcus Johnson", season: "Fall 2024", division: "Men's D1", awardedAt: "Dec 15, 2024", category: "Season MVP" },
  { id: "a2", title: "Championship Winner", description: "Season championship team", icon: "crown", recipientType: "team", recipientName: "Thunder Hawks", season: "Fall 2024", division: "Men's D1", awardedAt: "Dec 15, 2024", category: "Championship" },
  { id: "a3", title: "Offensive Player of the Year", description: "Top offensive performer", icon: "zap", recipientType: "player", recipientName: "Jake Williams", season: "Fall 2024", division: "Men's D1", awardedAt: "Dec 15, 2024", category: "Performance" },
  { id: "a4", title: "Defensive Player of the Year", description: "Top defensive performer", icon: "target", recipientType: "player", recipientName: "David Kim", season: "Fall 2024", division: "Men's D2", awardedAt: "Dec 15, 2024", category: "Performance" },
  { id: "a5", title: "Sportsmanship Award", description: "Exemplary sportsmanship", icon: "award", recipientType: "player", recipientName: "Emily Torres", season: "Fall 2024", division: "Women's D1", awardedAt: "Dec 15, 2024", category: "Sportsmanship" },
  { id: "a6", title: "Best Record", description: "Best regular season record", icon: "medal", recipientType: "team", recipientName: "Iron Eagles", season: "Fall 2024", division: "Co-Ed Open", awardedAt: "Dec 15, 2024", category: "Statistical Leader" },
  { id: "a7", title: "Rookie of the Year", description: "Outstanding first-year player", icon: "star", recipientType: "player", recipientName: "Chris Lee", season: "Fall 2024", division: "Men's D1", awardedAt: "Dec 15, 2024", category: "Performance" },
  { id: "a8", title: "Season MVP", description: "Most Valuable Player", icon: "trophy", recipientType: "player", recipientName: "Sarah Chen", season: "Summer 2024", division: "Women's D1", awardedAt: "Aug 30, 2024", category: "Season MVP" },
  { id: "a9", title: "Passing Leader", description: "Most passing yards", icon: "target", recipientType: "player", recipientName: "Carlos Rivera", season: "Summer 2024", division: "Men's D1", awardedAt: "Aug 30, 2024", category: "Statistical Leader" },
];

const mockPlayers = ["Marcus Johnson", "Jake Williams", "David Kim", "Emily Torres", "Chris Lee", "Sarah Chen", "Carlos Rivera", "Aisha Brown", "Mike Torres", "Rachel Adams"];
const mockTeams = ["Thunder Hawks", "Iron Eagles", "Storm Riders", "Blaze FC", "Phoenix Rising", "Steel Wolves", "Night Owls", "Golden Bears"];
const seasons = ["Spring 2025", "Fall 2024", "Summer 2024", "Spring 2024"];
const divisions = ["All Divisions", "Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];

type View = "awarded" | "templates" | "give";

export default function AccoladesPage() {
  const [accolades, setAccolades] = useState(initialAccolades);
  const [templates, setTemplates] = useState(initialTemplates);
  const [view, setView] = useState<View>("awarded");
  const [search, setSearch] = useState("");
  const [filterSeason, setFilterSeason] = useState("All Seasons");
  const [filterDivision, setFilterDivision] = useState("All Divisions");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  // Give award state
  const [giveTemplate, setGiveTemplate] = useState<AwardTemplate | null>(null);
  const [giveRecipient, setGiveRecipient] = useState("");
  const [giveSeason, setGiveSeason] = useState(seasons[0]);
  const [giveDivision, setGiveDivision] = useState(divisions[1]);

  // Create template state
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("trophy");
  const [newType, setNewType] = useState<RecipientType>("player");
  const [newCategory, setNewCategory] = useState(awardCategories[0]);

  const handleGiveAward = () => {
    if (!giveTemplate || !giveRecipient) return;
    const accolade: Accolade = {
      id: `a-${Date.now()}`,
      title: giveTemplate.title,
      description: giveTemplate.description,
      icon: giveTemplate.icon,
      recipientType: giveTemplate.recipientType,
      recipientName: giveRecipient,
      season: giveSeason,
      division: giveDivision,
      awardedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: giveTemplate.category,
    };
    setAccolades([accolade, ...accolades]);
    setGiveTemplate(null);
    setGiveRecipient("");
    setView("awarded");
  };

  const handleCreateTemplate = () => {
    if (!newTitle.trim()) return;
    setTemplates([...templates, {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      icon: newIcon,
      recipientType: newType,
      category: newCategory,
    }]);
    setNewTitle("");
    setNewDesc("");
    setNewIcon("trophy");
    setNewType("player");
    setNewCategory(awardCategories[0]);
    setShowCreateTemplate(false);
  };

  const deleteAccolade = (id: string) => setAccolades(accolades.filter(a => a.id !== id));
  const deleteTemplate = (id: string) => setTemplates(templates.filter(t => t.id !== id));

  const filteredAccolades = accolades.filter(a => {
    if (filterSeason !== "All Seasons" && a.season !== filterSeason) return false;
    if (filterDivision !== "All Divisions" && a.division !== filterDivision) return false;
    if (filterCategory !== "All Categories" && a.category !== filterCategory) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.recipientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group accolades by season
  const groupedBySeason = filteredAccolades.reduce<Record<string, Accolade[]>>((acc, a) => {
    (acc[a.season] = acc[a.season] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground">Accolades Hub</h1>
            <Badge variant="secondary" className="text-xs font-semibold">League Suite</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Award and track achievements for players and teams across seasons.</p>
        </div>
        <button
          onClick={() => { setGiveTemplate(null); setGiveRecipient(""); setView("give"); }}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Award className="h-4 w-4" /> Give Award
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "awarded" as View, label: `Awarded (${accolades.length})` },
          { key: "templates" as View, label: `Award Templates (${templates.length})` },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              view === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Give Award View ─── */}
      {view === "give" && (
        <div className="space-y-5 max-w-3xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("awarded")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold text-foreground">Give an Award</h2>
          </div>

          {!giveTemplate ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select an award template to give.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map(tmpl => {
                  const IconComp = getIcon(tmpl.icon);
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setGiveTemplate(tmpl)}
                      className="section-card p-4 text-left hover:shadow-md hover:border-primary/30 transition-all border-2 border-transparent"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                          <IconComp className="h-5 w-5 text-warning" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{tmpl.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[11px]">{tmpl.recipientType === "player" ? "Player" : "Team"}</Badge>
                            <Badge variant="secondary" className="text-[11px]">{tmpl.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="section-card p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  {(() => { const I = getIcon(giveTemplate.icon); return <I className="h-5 w-5 text-warning" />; })()}
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">{giveTemplate.title}</div>
                  <button onClick={() => setGiveTemplate(null)} className="text-xs text-primary hover:underline">Change award</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    {giveTemplate.recipientType === "player" ? "Select Player" : "Select Team"}
                  </label>
                  <select
                    value={giveRecipient}
                    onChange={e => setGiveRecipient(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">Choose {giveTemplate.recipientType === "player" ? "a player" : "a team"}...</option>
                    {(giveTemplate.recipientType === "player" ? mockPlayers : mockTeams).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Season</label>
                  <select value={giveSeason} onChange={e => setGiveSeason(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20">
                    {seasons.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Division</label>
                  <select value={giveDivision} onChange={e => setGiveDivision(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20">
                    {divisions.filter(d => d !== "All Divisions").map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setView("awarded")} className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
                <button
                  onClick={handleGiveAward}
                  disabled={!giveRecipient}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Award className="h-4 w-4" /> Award
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Awarded View ─── */}
      {view === "awarded" && (
        <>
          <div className="section-card p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search awards or recipients..." className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
                <option>All Seasons</option>
                {seasons.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterDivision} onChange={e => setFilterDivision(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
                {divisions.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
                <option>All Categories</option>
                {awardCategories.map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="ml-auto text-sm text-muted-foreground">{filteredAccolades.length} award{filteredAccolades.length !== 1 ? "s" : ""}</div>
            </div>
          </div>

          {Object.entries(groupedBySeason).length > 0 ? (
            Object.entries(groupedBySeason).map(([season, awards]) => (
              <div key={season} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  {season}
                  <Badge variant="secondary" className="text-[11px]">{awards.length} awards</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {awards.map(accolade => {
                    const IconComp = getIcon(accolade.icon);
                    return (
                      <div key={accolade.id} className="section-card p-4 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                            <IconComp className="h-5 w-5 text-warning" />
                          </div>
                          <button
                            onClick={() => deleteAccolade(accolade.id)}
                            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{accolade.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{accolade.description}</p>
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            {accolade.recipientType === "player" ? <UserCheck className="h-3.5 w-3.5 text-primary" /> : <Users className="h-3.5 w-3.5 text-accent" />}
                            <span className="text-sm font-semibold text-foreground">{accolade.recipientName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="secondary" className="text-[11px]">{accolade.division}</Badge>
                            <span className="text-[11px] text-muted-foreground">{accolade.awardedAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="section-card p-12 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center mb-3">
                <Trophy className="h-6 w-6 text-warning" />
              </div>
              <h2 className="text-base font-semibold text-foreground">No awards found</h2>
              <p className="text-sm text-muted-foreground mt-1">Start giving awards to recognize outstanding players and teams.</p>
              <button onClick={() => setView("give")} className="mt-4 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Award className="h-4 w-4" /> Give Award
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── Templates View ─── */}
      {view === "templates" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Reusable award templates that can be given each season.</p>
            <button onClick={() => setShowCreateTemplate(true)} className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Template
            </button>
          </div>

          {showCreateTemplate && (
            <div className="section-card p-5 space-y-4 border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">New Award Template</h3>
                <button onClick={() => setShowCreateTemplate(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Award Title</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Most Improved Player" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20">
                    {awardCategories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief description of this award" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Icon</label>
                  <div className="flex gap-1.5 mt-1.5">
                    {iconOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setNewIcon(opt.value)}
                        className={`p-2 rounded-lg border transition-colors ${newIcon === opt.value ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}
                        title={opt.label}
                      >
                        <opt.Icon className={`h-4 w-4 ${newIcon === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Recipient Type</label>
                  <div className="flex gap-2 mt-1.5">
                    {(["player", "team"] as RecipientType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${newType === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                      >
                        {t === "player" ? "Player" : "Team"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setShowCreateTemplate(false)} className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
                <button onClick={handleCreateTemplate} disabled={!newTitle.trim()} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Create Template</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map(tmpl => {
              const IconComp = getIcon(tmpl.icon);
              const timesAwarded = accolades.filter(a => a.title === tmpl.title).length;
              return (
                <div key={tmpl.id} className="section-card p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                      <IconComp className="h-5 w-5 text-warning" />
                    </div>
                    <button onClick={() => deleteTemplate(tmpl.id)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{tmpl.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[11px]">{tmpl.recipientType === "player" ? "Player" : "Team"}</Badge>
                      <Badge variant="secondary" className="text-[11px]">{tmpl.category}</Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{timesAwarded}x awarded</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
