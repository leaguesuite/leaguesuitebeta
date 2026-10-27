import { LeaguePageTitle } from "@/components/layout/LeaguePageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Layers, Edit, Trash2, ArrowRight, LayoutGrid, List, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  initialCategories, initialDivisions, defaultRules, defaultConfig, periodLabel, isCustomDowns,
  type Category, type CategoryRules, type CategoryConfig, type ToGain, type PeriodType,
} from "@/data/structureData";

type View = "cards" | "list";
const VIEW_KEY = "categories:view";
const TO_GAIN: ToGain[] = ["10 yards", "15 yards", "Midfield & Goal Line", "Goal Line"];

function specialTags(c: CategoryConfig): string[] {
  const t: string[] = [];
  if (c.allowKickoffs) t.push("Kickoffs");
  if (c.allowPunts) t.push("Punts");
  if (c.allowFieldGoals) t.push("Field Goals");
  if (c.allowRouge) t.push("Rouge (single)");
  if (c.allowOnsideFlag) t.push("Onside (flag)");
  if (c.allowPuntFlag) t.push("Punt (flag)");
  if (c.allowFumbles) t.push("Fumbles");
  if (c.allowLaterals) t.push("Laterals");
  c.specialScoring.forEach(s => t.push(`+${s.points} ${s.label}`));
  return t;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>(() => (localStorage.getItem(VIEW_KEY) as View) || "cards");
  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [rules, setRules] = useState<CategoryRules>(defaultRules);
  const [config, setConfig] = useState<CategoryConfig>(defaultConfig);

  const setR = <K extends keyof CategoryRules>(k: K, v: CategoryRules[K]) => setRules(p => ({ ...p, [k]: v }));
  const setC = <K extends keyof CategoryConfig>(k: K, v: CategoryConfig[K]) => setConfig(p => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditingId(null); setName(""); setDesc("");
    setRules({ ...defaultRules }); setConfig({ ...defaultConfig, specialScoring: [] });
    setOpen(true);
  };
  const openEdit = (cat: Category) => {
    setEditingId(cat.id); setName(cat.name);
    setDesc(cat.description === "—" ? "" : cat.description);
    setRules({ ...cat.rules }); setConfig({ ...cat.config, specialScoring: cat.config.specialScoring.map(s => ({ ...s })) });
    setOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Category name is required"); return; }
    if (config.specialScoring.some(s => !s.label.trim())) { toast.error("Each special scoring rule needs a label"); return; }
    const data = { name: name.trim(), description: desc.trim() || "—", rules, config };
    if (editingId !== null) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...data } : c));
      toast.success(`Category "${data.name}" updated`);
    } else {
      setCategories(prev => [...prev, { id: Date.now(), ...data }]);
      toast.success(`Category "${data.name}" created`);
    }
    setOpen(false);
  };

  const handleDelete = (cat: Category) => {
    setCategories(prev => prev.filter(c => c.id !== cat.id));
    toast.success(`Category "${cat.name}" removed`);
  };

  const divisionCount = (id: number) => initialDivisions.filter(d => d.categoryId === id).length;
  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const DivLink = ({ id }: { id: number }) => (
    <Link to="/structure/divisions" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
      {divisionCount(id)} division{divisionCount(id) !== 1 ? "s" : ""} <ArrowRight className="h-3 w-3" />
    </Link>
  );
  const Actions = ({ cat }: { cat: Category }) => (
    <div className="flex items-center gap-1">
      <button aria-label="Edit" onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
      <button aria-label="Delete" onClick={() => handleDelete(cat)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );

  const ruleChips = (c: Category) => [
    ["Field Length", `${c.rules.fieldLength} yds`],
    ["Downs", String(c.rules.downs)],
    ["To Gain", c.rules.toGain],
    ["Players / Side", `${c.rules.playersPerSide}v${c.rules.playersPerSide}`],
    ["Periods", c.rules.periods === "none" ? `Continuous · ${c.rules.periodLength} min` : `${periodLabel(c.rules.periods)} · ${c.rules.periodLength} min`],
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <LeaguePageTitle title="Categories" />
          <p className="text-sm text-muted-foreground mt-1">
            Game rules and scorekeeper settings for each category. These are also sent to the Scorekeeper app.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New Category</Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
            className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {([["cards", LayoutGrid, "Cards"], ["list", List, "List"]] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
              className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="section-card px-5 py-10 text-center text-sm text-muted-foreground">No categories found.</div>
      ) : view === "cards" ? (
        <div className="space-y-4">
          {filtered.map(cat => (
            <div key={cat.id} className="section-card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Layers className="h-5 w-5 text-primary" /></div>
                  <div>
                    <div className="text-base font-semibold text-foreground">{cat.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3"><DivLink id={cat.id} /><Actions cat={cat} /></div>
              </div>
              <div className="border-t border-border px-5 py-4 bg-secondary/30 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {ruleChips(cat).map(([k, v]) => (
                    <div key={k} className="bg-card rounded-lg border border-border px-3 py-2.5">
                      <div className="text-xs text-muted-foreground">{k}</div>
                      <div className="text-sm font-semibold text-foreground mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">Special rules:</span>
                  {specialTags(cat.config).length === 0
                    ? <span className="text-xs text-muted-foreground">None</span>
                    : specialTags(cat.config).map(t => <Badge key={t} variant="soft">{t}</Badge>)}
                  <span className="text-xs text-muted-foreground ml-2">Possession starts at the {cat.config.possessionStart}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Name", "Field", "Downs", "To Gain", "Players", "Periods", "Special Rules", "Divisions", ""].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3"><div className="font-medium text-foreground">{c.name}</div><div className="text-xs text-muted-foreground">{c.description}</div></td>
                  <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">{c.rules.fieldLength} yds</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{c.rules.downs}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.rules.toGain}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{c.rules.playersPerSide}v{c.rules.playersPerSide}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{periodLabel(c.rules.periods)} · {c.rules.periodLength}m</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{specialTags(c.config).map(t => <Badge key={t} variant="soft">{t}</Badge>)}</div></td>
                  <td className="px-4 py-3 whitespace-nowrap"><DivLink id={c.id} /></td>
                  <td className="px-4 py-3"><Actions cat={c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>Game rules and scorekeeper settings used by every division in this category.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="cat-name">Name</Label><Input id="cat-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Masters 40+" /></div>
              <div className="space-y-2"><Label htmlFor="cat-desc">Description</Label><Input id="cat-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" /></div>
            </div>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Game Rules</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label htmlFor="r-field">Field Length (yds)</Label><Input id="r-field" type="number" min={10} value={rules.fieldLength} onChange={e => setR("fieldLength", Number(e.target.value))} /></div>
                <div className="space-y-2">
                  <Label>Downs</Label>
                  <Select value={isCustomDowns(rules.downs) ? "custom" : String(rules.downs)} onValueChange={v => setR("downs", v === "3" ? 3 : v === "4" ? 4 : (isCustomDowns(rules.downs) ? rules.downs : 5))}>
                    <SelectTrigger aria-label="Downs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomDowns(rules.downs) && (
                    <Input type="number" min={1} max={20} value={rules.downs} onChange={e => setR("downs", Number(e.target.value))} aria-label="Custom number of downs" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>To Gain</Label>
                  <Select value={rules.toGain} onValueChange={v => setR("toGain", v as ToGain)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TO_GAIN.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="r-players">Players per Side</Label><Input id="r-players" type="number" min={1} max={15} value={rules.playersPerSide} onChange={e => setR("playersPerSide", Number(e.target.value))} /></div>
                <div className="space-y-2">
                  <Label>Periods</Label>
                  <Select value={rules.periods} onValueChange={v => setR("periods", v as PeriodType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="halves">Halves</SelectItem>
                      <SelectItem value="quarters">Quarters</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="r-len">{rules.periods === "none" ? "Game Length (min)" : "Period Length (min)"}</Label><Input id="r-len" type="number" min={1} value={rules.periodLength} onChange={e => setR("periodLength", Number(e.target.value))} /></div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Special Configs</h3>
              <div className="grid grid-cols-2 gap-3">
                {([["allowKickoffs", "Allow kickoffs"], ["allowPunts", "Allow punts"], ["allowFieldGoals", "Allow field goals"], ["allowRouge", "Allow rouge (single)"], ["allowOnsideFlag", "Allow onside attempt (flag)"], ["allowPuntFlag", "Allow punt (flag)"], ["allowFumbles", "Allow fumbles"], ["allowLaterals", "Allow laterals"], ["allowLiveScoring", "Live scoring"]] as const).map(([k, l]) => (
                  <label key={k} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                    {l}<Switch checked={config[k]} onCheckedChange={v => setC(k, v)} />
                  </label>
                ))}
                <div className="space-y-2"><Label htmlFor="c-pos">Default possession start (yd line)</Label><Input id="c-pos" type="number" min={0} value={config.possessionStart} onChange={e => setC("possessionStart", Number(e.target.value))} /></div>
                <div className="space-y-2"><Label htmlFor="c-rz">Red zone (yds)</Label><Input id="c-rz" type="number" min={0} value={config.redZoneYards} onChange={e => setC("redZoneYards", Number(e.target.value))} /></div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scoring</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label htmlFor="c-td">Touchdown points</Label><Input id="c-td" type="number" min={0} value={config.touchdownPoints} onChange={e => setC("touchdownPoints", Number(e.target.value))} /></div>
              </div>
              <div className="space-y-2">
                <Label>Special scoring</Label>
                {config.specialScoring.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Input value={s.label} placeholder="e.g. Female TD" onChange={e => setC("specialScoring", config.specialScoring.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                    <span className="text-sm text-muted-foreground">+</span>
                    <Input className="w-20" type="number" min={0} value={s.points} onChange={e => setC("specialScoring", config.specialScoring.map((x, j) => j === i ? { ...x, points: Number(e.target.value) } : x))} />
                    <span className="text-sm text-muted-foreground">pts</span>
                    <button aria-label="Remove rule" onClick={() => setC("specialScoring", config.specialScoring.filter((_, j) => j !== i))} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5"
                  onClick={() => setC("specialScoring", [...config.specialScoring, { id: String(Date.now()), label: "", points: 2 }])}>
                  <Plus className="h-3.5 w-3.5" /> Add special scoring rule
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scorekeeper Tracking</h3>
              <div className="grid grid-cols-3 gap-3">
                {([["trackAirYards", "Air yards"], ["trackYAC", "Yards after catch"], ["trackPassDirection", "Pass direction"]] as const).map(([k, l]) => (
                  <label key={k} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                    {l}<Switch checked={config[k]} onCheckedChange={v => setC(k, v)} />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId !== null ? "Save Changes" : "Create Category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
