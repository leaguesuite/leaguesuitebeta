import { useState } from "react";
import { Check, ChevronRight, Trophy, Layers, MapPin, Settings, BarChart3, Eye, CalendarDays, Zap, ListOrdered, Plus, X } from "lucide-react";

const steps = [
  { id: 1, label: "Select League", icon: Trophy },
  { id: 2, label: "Name & Event Format", icon: CalendarDays },
  { id: 3, label: "Categories & Divisions", icon: Layers },
  { id: 4, label: "Phases", icon: ListOrdered },
  { id: 5, label: "Conferences", icon: Zap },
  { id: 6, label: "Locations & Fields", icon: MapPin },
  { id: 7, label: "Rules & Stats", icon: Settings },
  { id: 8, label: "Review & Launch", icon: Eye },
];

type PhaseOption = { id: string; name: string; numbering: "weeks" | "rounds"; group: "season" | "tournament" };
const SEASON_PHASES: PhaseOption[] = [
  { id: "regular", name: "Regular Season", numbering: "weeks", group: "season" },
  { id: "pre", name: "Pre-Season", numbering: "weeks", group: "season" },
  { id: "playoffs", name: "Playoffs", numbering: "rounds", group: "season" },
];
const TOURNAMENT_PHASES: PhaseOption[] = [
  { id: "opening", name: "Opening Round", numbering: "rounds", group: "tournament" },
  { id: "roundrobin", name: "Round Robin", numbering: "rounds", group: "tournament" },
  { id: "elimination", name: "Elimination Round", numbering: "rounds", group: "tournament" },
];

export default function NewSeasonWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventFormat, setEventFormat] = useState<"season" | "tournament">("season");
  const [selectedPhases, setSelectedPhases] = useState<PhaseOption[]>([
    SEASON_PHASES[0], SEASON_PHASES[2],
  ]);
  const [customPhaseName, setCustomPhaseName] = useState("");

  const togglePhase = (p: PhaseOption) => {
    setSelectedPhases(prev =>
      prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]
    );
  };
  const addCustomPhase = () => {
    if (!customPhaseName.trim()) return;
    setSelectedPhases(prev => [...prev, {
      id: `custom-${Date.now()}`, name: customPhaseName.trim(), numbering: "rounds", group: eventFormat,
    }]);
    setCustomPhaseName("");
  };
  const removePhase = (id: string) => setSelectedPhases(prev => prev.filter(p => p.id !== id));
  const movePhase = (idx: number, dir: -1 | 1) => {
    setSelectedPhases(prev => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Season Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">Follow the guided steps to configure and launch a new season.</p>
      </div>

      {/* Stepper */}
      <div className="section-card p-5">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  step.id < currentStep ? "bg-success text-success-foreground" :
                  step.id === currentStep ? "bg-primary text-primary-foreground" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {step.id < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className={`text-[11px] font-medium text-center max-w-[80px] ${
                  step.id === currentStep ? "text-primary" : "text-muted-foreground"
                }`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 mt-[-18px] ${
                  step.id < currentStep ? "bg-success" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="section-card p-6">
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Select League</h2>
            <p className="text-sm text-muted-foreground">Choose which league this season belongs to.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {["Metro Flag Football League", "East Coast Flag League"].map((league, i) => (
                <button
                  key={league}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    i === 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? "bg-primary/10" : "bg-secondary"}`}>
                      <Trophy className={`h-5 w-5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{league}</div>
                      <div className="text-xs text-muted-foreground">{i === 0 ? "4 categories · 8 divisions" : "2 categories · 4 divisions"}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Name & Event Format</h2>
            <p className="text-sm text-muted-foreground">Define the season or tournament details and structure event format.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-foreground">Event Name</label>
                <input type="text" defaultValue="Spring 2025" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Event Format</label>
                <select
                  value={eventFormat}
                  onChange={(e) => setEventFormat(e.target.value as "season" | "tournament")}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="season">Season</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <input type="date" defaultValue="2025-03-15" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Date</label>
                <input type="date" defaultValue="2025-06-15" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Categories & Divisions</h2>
            <p className="text-sm text-muted-foreground">Select which categories and divisions to include in this season.</p>
            <div className="space-y-3 mt-4">
              {[
                { name: "Men's", divs: ["Division 1", "Division 2", "Division 3"], checked: [true, true, false] },
                { name: "Women's", divs: ["Division 1", "Division 2"], checked: [true, true] },
                { name: "Co-Ed", divs: ["Open"], checked: [true] },
              ].map(cat => (
                <div key={cat.name} className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  </div>
                  <div className="ml-7 flex flex-wrap gap-2">
                    {cat.divs.map((d, i) => (
                      <label key={d} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                        cat.checked[i] ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                      }`}>
                        <input type="checkbox" defaultChecked={cat.checked[i]} className="sr-only" />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Phases</h2>
            <p className="text-sm text-muted-foreground">
              Pick which phases this event will include. Games and standings will be grouped by these phases (e.g. Regular Season + Playoffs, or Round Robin + Knockout).
            </p>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Suggested phases</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(eventFormat === "season" ? SEASON_PHASES : TOURNAMENT_PHASES).map(p => {
                  const active = !!selectedPhases.find(x => x.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePhase(p)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.numbering === "weeks" ? "Grouped by week" : "Grouped by round"}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "border border-border"}`}>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Selected phases (in order)</div>
              {selectedPhases.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
                  No phases selected yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPhases.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card">
                      <span className="w-6 h-6 rounded-md bg-secondary text-xs font-semibold flex items-center justify-center text-foreground">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.numbering === "weeks" ? "Week numbering" : "Round numbering"}
                        </div>
                      </div>
                      <button type="button" onClick={() => movePhase(idx, -1)} disabled={idx === 0}
                        className="h-7 w-7 rounded-md border border-border text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => movePhase(idx, 1)} disabled={idx === selectedPhases.length - 1}
                        className="h-7 w-7 rounded-md border border-border text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => removePhase(p.id)}
                        className="h-7 w-7 rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex items-center justify-center">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Add a custom phase</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPhaseName}
                  onChange={(e) => setCustomPhaseName(e.target.value)}
                  placeholder="e.g. Knockout Round, Group Stage"
                  className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={addCustomPhase}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Conferences & Subdivisions</h2>
            <p className="text-sm text-muted-foreground">Optionally configure conferences and subdivisions for applicable divisions.</p>
            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No conferences configured</p>
              <p className="text-xs text-muted-foreground mt-1">Add conferences like AFC / NFC with subdivisions (East, West, etc.)</p>
              <button className="mt-4 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Add Conference
              </button>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Locations & Fields</h2>
            <p className="text-sm text-muted-foreground">Assign game locations and fields for this season.</p>
            <div className="space-y-3 mt-4">
              {[
                { name: "Memorial Park", fields: ["Field 1", "Field 2", "Field 3"], address: "123 Memorial Dr" },
                { name: "Central Park", fields: ["Field A", "Field B"], address: "456 Central Ave" },
                { name: "Riverside Complex", fields: ["Field 1"], address: "789 River Rd" },
              ].map(loc => (
                <div key={loc.name} className="p-4 rounded-xl border border-border flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" defaultChecked className="mt-1 rounded border-border text-primary focus:ring-primary" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">{loc.address}</div>
                      <div className="flex gap-1.5 mt-2">
                        {loc.fields.map(f => (
                          <span key={f} className="px-2 py-0.5 rounded bg-secondary text-xs text-secondary-foreground">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Rules & Stats Tracking</h2>
            <p className="text-sm text-muted-foreground">Configure rule presets and choose which stats to track this season.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {[
                { stat: "Passing Yards", on: true },
                { stat: "Rushing Yards", on: true },
                { stat: "Touchdowns", on: true },
                { stat: "Interceptions", on: true },
                { stat: "Sacks", on: true },
                { stat: "Flag Pulls", on: true },
                { stat: "Receptions", on: true },
                { stat: "PAT Conversions", on: false },
                { stat: "Safeties", on: false },
              ].map(s => (
                <label key={s.stat} className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/30">
                  <span className="text-sm text-foreground">{s.stat}</span>
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${s.on ? "bg-primary" : "bg-border"}`}>
                    <div className={`w-4 h-4 rounded-full bg-card absolute top-0.5 transition-transform ${s.on ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Review & Launch</h2>
            <p className="text-sm text-muted-foreground">Review your season configuration before launching.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { label: "League", value: "Metro Flag Football League" },
                { label: "Season", value: "Spring 2025" },
                { label: "Event Format", value: "Regular Season" },
                { label: "Categories", value: "Men's, Women's, Co-Ed" },
                { label: "Divisions", value: "5 divisions selected" },
                { label: "Locations", value: "3 locations, 6 fields" },
                { label: "Stats Tracked", value: "7 categories enabled" },
                { label: "Duration", value: "Mar 15 – Jun 15, 2025" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="h-10 px-5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</span>
          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button className="h-10 px-5 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors flex items-center gap-2">
              <Zap className="h-4 w-4" /> Launch Season
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
