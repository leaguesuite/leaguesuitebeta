import { useState } from "react";
import { Plus, Search, Users, UserCheck, Eye, Edit, Trash2, ExternalLink, X, CalendarDays, ClipboardList, ChevronRight, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";

type FormType = "individual" | "team";
type FormStatus = "active" | "draft" | "completed";

interface RegistrationForm {
  id: string;
  name: string;
  type: FormType;
  season: string;
  status: FormStatus;
  submissions: number;
  capacity: number | null;
  createdAt: string;
  opensAt: string;
  closesAt: string;
}

interface Submission {
  id: string;
  name: string;
  email: string;
  date: string;
  team?: string;
  captain?: string;
  playerCount?: number;
  status: "confirmed" | "pending" | "cancelled";
}

const initialForms: RegistrationForm[] = [
  { id: "1", name: "Spring 2025 Player Registration", type: "individual", season: "Spring 2025", status: "active", submissions: 127, capacity: 200, createdAt: "Jan 15, 2025", opensAt: "Jan 20, 2025", closesAt: "Mar 10, 2025" },
  { id: "2", name: "Spring 2025 Team Registration", type: "team", season: "Spring 2025", status: "active", submissions: 18, capacity: 32, createdAt: "Jan 15, 2025", opensAt: "Jan 20, 2025", closesAt: "Mar 1, 2025" },
  { id: "3", name: "Summer Tournament Individual Entry", type: "individual", season: "Summer Tournament 2025", status: "draft", submissions: 0, capacity: 100, createdAt: "Mar 10, 2025", opensAt: "Apr 1, 2025", closesAt: "May 15, 2025" },
  { id: "4", name: "Fall 2024 Player Registration", type: "individual", season: "Fall 2024", status: "completed", submissions: 184, capacity: 200, createdAt: "Jul 1, 2024", opensAt: "Jul 10, 2024", closesAt: "Sep 1, 2024" },
];

const mockIndividualSubs: Submission[] = [
  { id: "s1", name: "Marcus Johnson", email: "marcus@email.com", date: "Mar 14, 2025", status: "confirmed" },
  { id: "s2", name: "Jake Williams", email: "jake@email.com", date: "Mar 13, 2025", status: "confirmed" },
  { id: "s3", name: "Emily Torres", email: "emily@email.com", date: "Mar 12, 2025", status: "pending" },
  { id: "s4", name: "Aisha Brown", email: "aisha@email.com", date: "Mar 12, 2025", status: "confirmed" },
  { id: "s5", name: "Chris Lee", email: "chris@email.com", date: "Mar 11, 2025", status: "cancelled" },
];

const mockTeamSubs: Submission[] = [
  { id: "t1", name: "Thunder Hawks", captain: "John Doe", email: "john@thunderhawks.com", playerCount: 14, date: "Feb 28, 2025", status: "confirmed" },
  { id: "t2", name: "Iron Eagles", captain: "Sarah Chen", email: "sarah@ironeagles.com", playerCount: 12, date: "Feb 25, 2025", status: "confirmed" },
  { id: "t3", name: "Storm Riders", captain: "Mike Torres", email: "mike@stormriders.com", playerCount: 15, date: "Feb 22, 2025", status: "pending" },
  { id: "t4", name: "Blaze FC", captain: "Ana Rivera", email: "ana@blazefc.com", playerCount: 11, date: "Feb 20, 2025", status: "confirmed" },
];

const seasons = ["Spring 2025", "Summer Tournament 2025", "Fall 2025"];

type View = "list" | "create" | "submissions";

export default function RegistrationPage() {
  const [forms, setForms] = useState<RegistrationForm[]>(initialForms);
  const [view, setView] = useState<View>("list");
  const [viewingForm, setViewingForm] = useState<RegistrationForm | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | FormType>("all");

  // Create form state
  const [createType, setCreateType] = useState<FormType | null>(null);
  const [formName, setFormName] = useState("");
  const [formSeason, setFormSeason] = useState(seasons[0]);
  const [formCapacity, setFormCapacity] = useState("");
  const [formOpens, setFormOpens] = useState("");
  const [formCloses, setFormCloses] = useState("");

  const resetCreate = () => {
    setCreateType(null);
    setFormName("");
    setFormSeason(seasons[0]);
    setFormCapacity("");
    setFormOpens("");
    setFormCloses("");
    setView("list");
  };

  const handleCreate = () => {
    if (!formName.trim() || !createType) return;
    const newForm: RegistrationForm = {
      id: `reg-${Date.now()}`,
      name: formName.trim(),
      type: createType,
      season: formSeason,
      status: "draft",
      submissions: 0,
      capacity: formCapacity ? parseInt(formCapacity) : null,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      opensAt: formOpens || "Not set",
      closesAt: formCloses || "Not set",
    };
    setForms([newForm, ...forms]);
    resetCreate();
  };

  const toggleStatus = (id: string) => {
    setForms(forms.map(f => {
      if (f.id !== id) return f;
      const next: FormStatus = f.status === "draft" ? "active" : f.status === "active" ? "draft" : f.status;
      return { ...f, status: next };
    }));
  };

  const deleteForm = (id: string) => {
    setForms(forms.filter(f => f.id !== id));
  };

  const openSubmissions = (form: RegistrationForm) => {
    setViewingForm(form);
    setView("submissions");
  };

  const filtered = forms.filter(f => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.season.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ─── Submissions View ───
  if (view === "submissions" && viewingForm) {
    const subs = viewingForm.type === "team" ? mockTeamSubs : mockIndividualSubs;
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView("list"); setViewingForm(null); }} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{viewingForm.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{viewingForm.type === "team" ? "Team Registration" : "Individual Registration"}</Badge>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{viewingForm.season}</span>
              <span className="text-sm text-muted-foreground">·</span>
              <StatusBadge status={viewingForm.status as any} />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground font-medium">Total Submissions</p>
            <p className="text-2xl font-bold text-foreground mt-1">{subs.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground font-medium">Confirmed</p>
            <p className="text-2xl font-bold text-success mt-1">{subs.filter(s => s.status === "confirmed").length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground font-medium">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">{subs.filter(s => s.status === "pending").length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground font-medium">
              {viewingForm.capacity ? "Capacity" : "No Cap"}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {viewingForm.capacity ? `${subs.length} / ${viewingForm.capacity}` : "∞"}
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        {viewingForm.capacity && (
          <div className="section-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Registration Capacity</span>
              <span className="text-sm text-muted-foreground">{Math.round((subs.filter(s => s.status !== "cancelled").length / viewingForm.capacity) * 100)}% filled</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (subs.filter(s => s.status !== "cancelled").length / viewingForm.capacity) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="section-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Submissions</h2>
            <span className="text-xs text-muted-foreground">{subs.length} total</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="table-header text-left px-5 py-3">{viewingForm.type === "team" ? "Team Name" : "Player Name"}</th>
                {viewingForm.type === "team" && <th className="table-header text-left px-5 py-3">Captain</th>}
                <th className="table-header text-left px-5 py-3">Email</th>
                {viewingForm.type === "team" && <th className="table-header text-left px-5 py-3">Players</th>}
                <th className="table-header text-left px-5 py-3">Date</th>
                <th className="table-header text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subs.map(sub => (
                <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-foreground">{sub.name}</span>
                  </td>
                  {viewingForm.type === "team" && (
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{sub.captain}</td>
                  )}
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{sub.email}</td>
                  {viewingForm.type === "team" && (
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs">{sub.playerCount} players</Badge>
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{sub.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      sub.status === "confirmed" ? "bg-success/10 text-success border-success/20" :
                      sub.status === "pending" ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Confirmed submissions automatically populate the {viewingForm.type === "team" ? "teams" : "player"} list for <strong>{viewingForm.season}</strong>.
        </p>
      </div>
    );
  }

  // ─── Create View ───
  if (view === "create") {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={resetCreate} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Registration Form</h1>
            <p className="text-sm text-muted-foreground mt-1">Create a registration form for an upcoming season or tournament.</p>
          </div>
        </div>

        {/* Step 1: Choose type */}
        {!createType && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">What type of registration?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCreateType("individual")}
                className="section-card p-6 text-left hover:shadow-md hover:border-primary/30 transition-all border-2 border-transparent"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Individual Registration</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Players register individually. Submissions populate the player list for the selected season or tournament.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-primary text-sm font-medium">
                  Select <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>

              <button
                onClick={() => setCreateType("team")}
                className="section-card p-6 text-left hover:shadow-md hover:border-primary/30 transition-all border-2 border-transparent"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Team Registration</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Teams register as a group with a captain. Submissions populate the team list and rosters for the selected season or tournament.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-primary text-sm font-medium">
                  Select <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure form */}
        {createType && (
          <div className="section-card p-5 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${createType === "individual" ? "bg-primary/10" : "bg-accent/10"}`}>
                {createType === "individual" ? <UserCheck className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-accent" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {createType === "individual" ? "Individual Registration" : "Team Registration"} Form
                </h2>
                <button onClick={() => setCreateType(null)} className="text-xs text-primary hover:underline">Change type</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Form Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={createType === "individual" ? "e.g. Spring 2025 Player Registration" : "e.g. Spring 2025 Team Registration"}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Season / Tournament</label>
                <select
                  value={formSeason}
                  onChange={e => setFormSeason(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {seasons.map(s => <option key={s}>{s}</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Confirmed submissions will auto-populate this season's {createType === "team" ? "team" : "player"} list.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Capacity Limit</label>
                <input
                  type="number"
                  value={formCapacity}
                  onChange={e => setFormCapacity(e.target.value)}
                  placeholder="Leave empty for no limit"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Registration Opens</label>
                <input
                  type="date"
                  value={formOpens}
                  onChange={e => setFormOpens(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Registration Closes</label>
                <input
                  type="date"
                  value={formCloses}
                  onChange={e => setFormCloses(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">How it works</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {createType === "individual"
                      ? "When a player submits this form, they are added to the player pool for the selected season. You can review, confirm, or reject submissions before they become active."
                      : "When a team submits this form, the team and its roster are added to the selected season. Captains provide team details and player lists. You can review and confirm before activation."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={resetCreate}
                className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName.trim()}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create as Draft
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── List View ───
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage registration forms for seasons and tournaments.</p>
        </div>
        <button
          onClick={() => setView("create")}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Registration Form
        </button>
      </div>

      {/* Filters */}
      <div className="section-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search forms..."
              className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["all", "individual", "team"] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterType === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t === "all" ? "All" : t === "individual" ? "Individual" : "Team"}
              </button>
            ))}
          </div>
          <div className="ml-auto text-sm text-muted-foreground">{filtered.length} form{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Forms List */}
      <div className="space-y-3">
        {filtered.map(form => (
          <div key={form.id} className="section-card overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  form.type === "individual" ? "bg-primary/10" : "bg-accent/10"
                }`}>
                  {form.type === "individual" ? <UserCheck className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-accent" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{form.name}</span>
                    <StatusBadge status={form.status as any} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{form.season}</span>
                    <span>·</span>
                    <span>{form.type === "individual" ? "Individual" : "Team"}</span>
                    <span>·</span>
                    <span>Opens {form.opensAt}</span>
                    <span>·</span>
                    <span>Closes {form.closesAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right mr-2">
                  <div className="text-lg font-bold text-foreground">{form.submissions}</div>
                  <div className="text-xs text-muted-foreground">
                    {form.capacity ? `of ${form.capacity}` : "submissions"}
                  </div>
                </div>

                {form.capacity && (
                  <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        form.submissions / form.capacity > 0.9 ? "bg-warning" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, (form.submissions / form.capacity) * 100)}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-1 pl-2 border-l border-border">
                  <button
                    onClick={() => openSubmissions(form)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                    title="View submissions"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {form.status !== "completed" && (
                    <button
                      onClick={() => toggleStatus(form.id)}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                      title={form.status === "active" ? "Deactivate" : "Activate"}
                    >
                      {form.status === "active" ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="section-card p-12 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">No registration forms</h2>
            <p className="text-sm text-muted-foreground mt-1">Create your first registration form to start collecting signups.</p>
            <button
              onClick={() => setView("create")}
              className="mt-4 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New Registration Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
