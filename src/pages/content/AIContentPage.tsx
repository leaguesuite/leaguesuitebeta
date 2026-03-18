import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles, FileText, Trophy, BarChart3, TrendingUp, Zap,
  Settings, DollarSign, Calendar, Clock, CheckCircle2, Eye,
  PenTool, ArrowRight, Info, Newspaper, Star, Target, AlertCircle,
} from "lucide-react";

// ─── Content Type Definitions ────────────────────────────────────────────────

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: "automated" | "on-demand";
  isPriced: boolean;
  pricePerUnit: number; // $ per article/piece per week
  defaultFrequency: string;
  frequencies: { label: string; value: string; multiplier: number }[];
  example: string;
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: "post-game",
    name: "Post-Game Recaps",
    description: "Automated write-ups after each completed game covering scores, key plays, and standout performers.",
    icon: FileText,
    category: "automated",
    isPriced: false,
    pricePerUnit: 0,
    defaultFrequency: "per-game",
    frequencies: [{ label: "After every game", value: "per-game", multiplier: 1 }],
    example: "Thunder Hawks dominate Iron Eagles 28-14 behind a stellar defensive performance, recording 5 interceptions in the shutout second half...",
  },
  {
    id: "power-rankings",
    name: "Weekly Power Rankings",
    description: "AI-generated power rankings with analysis, trend arrows, and narrative breakdown by division.",
    icon: TrendingUp,
    category: "automated",
    isPriced: true,
    pricePerUnit: 3.50,
    defaultFrequency: "weekly",
    frequencies: [
      { label: "Weekly", value: "weekly", multiplier: 1 },
      { label: "Bi-weekly", value: "biweekly", multiplier: 0.5 },
    ],
    example: "1. Hawks (6-1) ↑2 — The Hawks' defense has been suffocating, allowing just 8.3 points over their last three games...",
  },
  {
    id: "statlines",
    name: "Notable Statlines",
    description: "Highlights of standout individual and team statistical performances each week.",
    icon: BarChart3,
    category: "automated",
    isPriced: true,
    pricePerUnit: 2.00,
    defaultFrequency: "weekly",
    frequencies: [
      { label: "Weekly", value: "weekly", multiplier: 1 },
      { label: "Bi-weekly", value: "biweekly", multiplier: 0.5 },
    ],
    example: "🔥 Kevin Garcia: 4 TD, 285 passing yards, 0 INT — the best single-game performance this season...",
  },
  {
    id: "thematic",
    name: "Thematic Articles",
    description: "In-depth feature articles on rivalries, player spotlights, season storylines, historical comparisons, and more.",
    icon: PenTool,
    category: "on-demand",
    isPriced: true,
    pricePerUnit: 5.00,
    defaultFrequency: "2-per-week",
    frequencies: [
      { label: "1 per week", value: "1-per-week", multiplier: 1 },
      { label: "2 per week", value: "2-per-week", multiplier: 2 },
      { label: "5 per week", value: "5-per-week", multiplier: 5 },
      { label: "10 per week", value: "10-per-week", multiplier: 10 },
    ],
    example: "The Eagles-Tigers rivalry has defined Division A for three seasons. But with both squads retooled this spring, the dynamic has shifted...",
  },
  {
    id: "previews",
    name: "Game Previews",
    description: "Pre-game analysis with matchup breakdowns, key players to watch, and prediction picks.",
    icon: Target,
    category: "automated",
    isPriced: true,
    pricePerUnit: 2.50,
    defaultFrequency: "per-game",
    frequencies: [
      { label: "Every game", value: "per-game", multiplier: 1 },
      { label: "Featured games only", value: "featured", multiplier: 0.4 },
    ],
    example: "PREVIEW: Thunder Hawks vs Storm Riders — Both teams sit at 4-2 heading into this pivotal Week 9 clash...",
  },
  {
    id: "weekly-wrap",
    name: "Weekly Wrap-Up",
    description: "A comprehensive weekly digest summarizing all results, standings movement, and upcoming matchups.",
    icon: Newspaper,
    category: "automated",
    isPriced: true,
    pricePerUnit: 4.00,
    defaultFrequency: "weekly",
    frequencies: [{ label: "Weekly", value: "weekly", multiplier: 1 }],
    example: "WEEK 9 WRAP: A wild week saw three upsets, two overtime finishes, and the Hawks clinch the Division B regular season title...",
  },
];

const ALL_DIVISIONS = ["Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];

interface ContentConfig {
  enabled: boolean;
  divisions: string[];
  frequency: string;
}

// ─── Recent Generated Content ────────────────────────────────────────────────

const recentContent = [
  { title: "Thunder Hawks dominate Iron Eagles 28-14", type: "Post-Game Recap", date: "Mar 15", status: "published", division: "Men's D1" },
  { title: "Week 8 Power Rankings: Hawks soar to #1", type: "Power Rankings", date: "Mar 14", status: "published", division: "All Divisions" },
  { title: "Storm Riders & Blaze FC battle to 21-21 draw", type: "Post-Game Recap", date: "Mar 15", status: "published", division: "Co-Ed Open" },
  { title: "The rise of Kevin Garcia: From rookie to MVP candidate", type: "Thematic Article", date: "Mar 13", status: "published", division: "Division B" },
  { title: "Notable Statlines: Week 8's top performers", type: "Notable Statlines", date: "Mar 14", status: "draft", division: "All Divisions" },
  { title: "PREVIEW: Phoenix Rising vs Steel Wolves", type: "Game Preview", date: "Mar 17", status: "scheduled", division: "Women's D1" },
];

export default function AIContentPage() {
  const [configs, setConfigs] = useState<Record<string, ContentConfig>>(() => {
    const init: Record<string, ContentConfig> = {};
    CONTENT_TYPES.forEach(ct => {
      init[ct.id] = {
        enabled: ct.id === "post-game",
        divisions: [...ALL_DIVISIONS],
        frequency: ct.defaultFrequency,
      };
    });
    return init;
  });

  const [configDialogType, setConfigDialogType] = useState<ContentType | null>(null);
  const [tempConfig, setTempConfig] = useState<ContentConfig | null>(null);
  const [previewType, setPreviewType] = useState<ContentType | null>(null);

  const openConfig = (ct: ContentType) => {
    setConfigDialogType(ct);
    setTempConfig({ ...configs[ct.id] });
  };

  const saveConfig = () => {
    if (!configDialogType || !tempConfig) return;
    setConfigs(prev => ({ ...prev, [configDialogType.id]: tempConfig }));
    setConfigDialogType(null);
    toast({ title: "Configuration saved", description: `${configDialogType.name} settings updated.` });
  };

  const toggleEnabled = (id: string) => {
    setConfigs(prev => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }));
  };

  // ─── Pricing Calculation ────────────────────────────────────────────────────

  const calculateWeeklyCost = () => {
    let total = 0;
    CONTENT_TYPES.forEach(ct => {
      const cfg = configs[ct.id];
      if (!cfg.enabled || !ct.isPriced) return;
      const freq = ct.frequencies.find(f => f.value === cfg.frequency);
      if (!freq) return;
      // For per-game, estimate ~8 games/week
      const base = cfg.frequency === "per-game" ? 8 : cfg.frequency === "featured" ? 3 : 1;
      total += ct.pricePerUnit * freq.multiplier * base;
    });
    return total;
  };

  const calculateMonthlyCost = () => calculateWeeklyCost() * 4.33;

  const enabledCount = Object.values(configs).filter(c => c.enabled).length;
  const pricedEnabledCount = CONTENT_TYPES.filter(ct => ct.isPriced && configs[ct.id].enabled).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Content</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Automate articles, recaps, and rankings. Set it and forget it.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Summary Bar */}
      <div className="section-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{enabledCount} active</span>
              <span className="text-xs text-muted-foreground">content types</span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                ${calculateWeeklyCost().toFixed(2)}/week
              </span>
              <span className="text-xs text-muted-foreground">
                (~${calculateMonthlyCost().toFixed(0)}/month)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Post-game recaps always free
            </Badge>
          </div>
        </div>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CONTENT_TYPES.map(ct => {
          const cfg = configs[ct.id];
          const freq = ct.frequencies.find(f => f.value === cfg.frequency);
          const isActive = cfg.enabled;

          return (
            <div
              key={ct.id}
              className={`section-card overflow-hidden transition-all ${isActive ? "ring-1 ring-primary/20" : "opacity-75"}`}
            >
              {/* Top accent */}
              <div className={`h-1 ${isActive ? "bg-primary" : "bg-muted"}`} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                      <ct.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{ct.name}</h3>
                      {!ct.isPriced && (
                        <Badge variant="secondary" className="text-[10px] mt-0.5 gap-0.5">
                          <Star className="h-2.5 w-2.5" /> Included free
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Switch checked={isActive} onCheckedChange={() => toggleEnabled(ct.id)} />
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{ct.description}</p>

                {/* Config summary */}
                {isActive && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground font-medium">{freq?.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {cfg.divisions.length === ALL_DIVISIONS.length ? "All divisions" : cfg.divisions.join(", ")}
                      </span>
                    </div>
                    {ct.isPriced && (
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground font-medium">
                          ${ct.pricePerUnit.toFixed(2)}/article
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => openConfig(ct)}>
                    <Settings className="h-3.5 w-3.5 mr-1" /> Configure
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPreviewType(ct)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Breakdown */}
      {pricedEnabledCount > 0 && (
        <div className="section-card">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Pricing Estimate</h2>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-2.5 table-header">Content Type</th>
                    <th className="text-center px-4 py-2.5 table-header">Frequency</th>
                    <th className="text-center px-4 py-2.5 table-header">Unit Price</th>
                    <th className="text-right px-4 py-2.5 table-header">Weekly Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {CONTENT_TYPES.filter(ct => configs[ct.id].enabled).map(ct => {
                    const cfg = configs[ct.id];
                    const freq = ct.frequencies.find(f => f.value === cfg.frequency);
                    const base = cfg.frequency === "per-game" ? 8 : cfg.frequency === "featured" ? 3 : 1;
                    const weeklyEst = ct.isPriced ? ct.pricePerUnit * (freq?.multiplier || 1) * base : 0;
                    return (
                      <tr key={ct.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground flex items-center gap-2">
                          <ct.icon className="h-4 w-4 text-muted-foreground" />
                          {ct.name}
                          {!ct.isPriced && <Badge variant="secondary" className="text-[10px]">Free</Badge>}
                        </td>
                        <td className="px-4 py-2.5 text-center text-muted-foreground">{freq?.label}</td>
                        <td className="px-4 py-2.5 text-center">
                          {ct.isPriced ? `$${ct.pricePerUnit.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                          {ct.isPriced ? `$${weeklyEst.toFixed(2)}` : "Free"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-muted/30 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right text-foreground">Weekly Total</td>
                    <td className="px-4 py-3 text-right text-primary text-base">${calculateWeeklyCost().toFixed(2)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground text-xs">Estimated Monthly</td>
                    <td className="px-4 py-2 text-right text-muted-foreground text-xs">${calculateMonthlyCost().toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Estimates based on ~8 games/week. Actual costs may vary. Post-game recaps are always included at no extra cost.</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent AI Content */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recently Generated</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            View all <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recentContent.map((item, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                  <span className="text-xs text-muted-foreground">{item.division}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground">{item.date}</span>
                <Badge
                  variant={item.status === "published" ? "default" : "secondary"}
                  className={`text-[10px] ${item.status === "scheduled" ? "border-warning/30 text-warning bg-warning/10" : ""}`}
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configure Dialog */}
      <Dialog open={!!configDialogType} onOpenChange={(v) => !v && setConfigDialogType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configDialogType && <configDialogType.icon className="h-5 w-5 text-primary" />}
              Configure {configDialogType?.name}
            </DialogTitle>
            <DialogDescription>{configDialogType?.description}</DialogDescription>
          </DialogHeader>
          {tempConfig && configDialogType && (
            <div className="space-y-5 py-2">
              {/* Enabled */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enabled</Label>
                <Switch checked={tempConfig.enabled} onCheckedChange={v => setTempConfig({ ...tempConfig, enabled: v })} />
              </div>

              {/* Frequency */}
              {configDialogType.frequencies.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-sm">Frequency</Label>
                  <Select value={tempConfig.frequency} onValueChange={v => setTempConfig({ ...tempConfig, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {configDialogType.frequencies.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Divisions */}
              <div className="space-y-2">
                <Label className="text-sm">Divisions</Label>
                <div className="space-y-2">
                  {ALL_DIVISIONS.map(div => (
                    <label key={div} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.divisions.includes(div)}
                        onChange={e => {
                          setTempConfig({
                            ...tempConfig,
                            divisions: e.target.checked
                              ? [...tempConfig.divisions, div]
                              : tempConfig.divisions.filter(d => d !== div),
                          });
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{div}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price estimate */}
              {configDialogType.isPriced && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated cost</span>
                    <span className="font-semibold text-foreground">
                      ${configDialogType.pricePerUnit.toFixed(2)}/article
                    </span>
                  </div>
                </div>
              )}
              {!configDialogType.isPriced && (
                <div className="rounded-lg bg-accent/10 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm text-foreground">This content type is included free with your plan.</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogType(null)}>Cancel</Button>
            <Button onClick={saveConfig}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewType} onOpenChange={(v) => !v && setPreviewType(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Example: {previewType?.name}
            </DialogTitle>
          </DialogHeader>
          {previewType && (
            <div className="py-2">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <p className="text-sm text-foreground leading-relaxed italic">"{previewType.example}"</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                This is a sample of AI-generated content. Actual output will use your league's real data.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewType(null)}>Close</Button>
            <Button onClick={() => { setPreviewType(null); openConfig(previewType!); }}>
              Configure <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
