import { useState } from "react";
import { Plus, Search, Users, UserCheck, Eye, Edit, Trash2, CalendarDays, ClipboardList, ChevronRight, ToggleLeft, ToggleRight, ArrowLeft, Inbox, DollarSign, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface TeamSubmission {
  id: string;
  submittedAt: string;
  division: string;
  teamName: string;
  captainName: string;
  email: string;
  phone: string;
  paidToDate: number;
}

interface IndividualSubmission {
  id: string;
  submittedAt: string;
  division: string;
  name: string;
  email: string;
  phone: string;
  status: "confirmed" | "pending" | "cancelled";
}

const initialForms: RegistrationForm[] = [
  { id: "1", name: "Spring 2025 Player Registration", type: "individual", season: "Spring 2025", status: "active", submissions: 127, capacity: 200, createdAt: "Jan 15, 2025", opensAt: "Jan 20, 2025", closesAt: "Mar 10, 2025" },
  { id: "2", name: "Spring 2025 Team Registration", type: "team", season: "Spring 2025", status: "active", submissions: 18, capacity: 32, createdAt: "Jan 15, 2025", opensAt: "Jan 20, 2025", closesAt: "Mar 1, 2025" },
  { id: "3", name: "Summer Tournament Individual Entry", type: "individual", season: "Summer Tournament 2025", status: "draft", submissions: 0, capacity: 100, createdAt: "Mar 10, 2025", opensAt: "Apr 1, 2025", closesAt: "May 15, 2025" },
  { id: "4", name: "Fall 2024 Player Registration", type: "individual", season: "Fall 2024", status: "completed", submissions: 184, capacity: 200, createdAt: "Jul 1, 2024", opensAt: "Jul 10, 2024", closesAt: "Sep 1, 2024" },
  { id: "5", name: "Fall 2024 Team Registration", type: "team", season: "Fall 2024", status: "completed", submissions: 14, capacity: 24, createdAt: "Jul 1, 2024", opensAt: "Jul 10, 2024", closesAt: "Sep 1, 2024" },
];

const mockTeamSubmissions: TeamSubmission[] = [
  { id: "t1", submittedAt: "Mar 14, 2025 2:30 PM", division: "Adult Men's A", teamName: "Thunder Hawks", captainName: "John Doe", email: "john@thunderhawks.com", phone: "(555) 123-4567", paidToDate: 450 },
  { id: "t2", submittedAt: "Mar 13, 2025 10:15 AM", division: "Adult Men's A", teamName: "Iron Eagles", captainName: "Sarah Chen", email: "sarah@ironeagles.com", phone: "(555) 234-5678", paidToDate: 450 },
  { id: "t3", submittedAt: "Mar 12, 2025 4:45 PM", division: "Adult Men's B", teamName: "Storm Riders", captainName: "Mike Torres", email: "mike@stormriders.com", phone: "(555) 345-6789", paidToDate: 225 },
  { id: "t4", submittedAt: "Mar 11, 2025 9:00 AM", division: "Adult Co-Ed", teamName: "Blaze FC", captainName: "Ana Rivera", email: "ana@blazefc.com", phone: "(555) 456-7890", paidToDate: 0 },
  { id: "t5", submittedAt: "Mar 10, 2025 1:20 PM", division: "Adult Men's B", teamName: "Night Wolves", captainName: "Derek Miles", email: "derek@nightwolves.com", phone: "(555) 567-8901", paidToDate: 450 },
];

const mockIndividualSubmissions: IndividualSubmission[] = [
  { id: "s1", submittedAt: "Mar 14, 2025 3:12 PM", division: "Adult Men's A", name: "Marcus Johnson", email: "marcus@email.com", phone: "(555) 111-2222", status: "confirmed" },
  { id: "s2", submittedAt: "Mar 13, 2025 11:30 AM", division: "Adult Men's A", name: "Jake Williams", email: "jake@email.com", phone: "(555) 222-3333", status: "confirmed" },
  { id: "s3", submittedAt: "Mar 12, 2025 5:00 PM", division: "Adult Co-Ed", name: "Emily Torres", email: "emily@email.com", phone: "(555) 333-4444", status: "pending" },
  { id: "s4", submittedAt: "Mar 12, 2025 2:15 PM", division: "Adult Men's B", name: "Aisha Brown", email: "aisha@email.com", phone: "(555) 444-5555", status: "confirmed" },
  { id: "s5", submittedAt: "Mar 11, 2025 8:45 AM", division: "Junior", name: "Chris Lee", email: "chris@email.com", phone: "(555) 555-6666", status: "cancelled" },
];

const seasons = ["Spring 2025", "Summer Tournament 2025", "Fall 2025"];

export default function RegistrationPage() {
  const [forms, setForms] = useState<RegistrationForm[]>(initialForms);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("team");

  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<FormType | null>(null);
  const [formName, setFormName] = useState("");
  const [formSeason, setFormSeason] = useState(seasons[0]);
  const [formCapacity, setFormCapacity] = useState("");
  const [formOpens, setFormOpens] = useState("");
  const [formCloses, setFormCloses] = useState("");

  // Submissions tab state
  const [selectedFormId, setSelectedFormId] = useState<string>("");

  const resetCreate = () => {
    setCreateType(null);
    setFormName("");
    setFormSeason(seasons[0]);
    setFormCapacity("");
    setFormOpens("");
    setFormCloses("");
    setIsCreating(false);
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

  const teamForms = forms.filter(f => f.type === "team");
  const individualForms = forms.filter(f => f.type === "individual");
  const activeForms = forms.filter(f => f.status === "active");

  // ─── Create View ───
  if (isCreating) {
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
                <p className="text-sm text-muted-foreground mt-1.5">Players register individually for the selected season or tournament.</p>
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
                <p className="text-sm text-muted-foreground mt-1.5">Teams register as a group with a captain and roster.</p>
                <div className="mt-4 flex items-center gap-1.5 text-primary text-sm font-medium">
                  Select <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

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
              <button onClick={resetCreate} className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors">
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

  // ─── Form list renderer ───
  const renderFormList = (formList: RegistrationForm[]) => {
    const filtered = formList.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.season.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (filtered.length === 0) {
      return (
        <div className="section-card p-12 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground">No registration forms</h2>
          <p className="text-sm text-muted-foreground mt-1">Create your first registration form to start collecting signups.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Registration Form
          </button>
        </div>
      );
    }

    return (
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
      </div>
    );
  };

  // ─── Submissions tab content ───
  const selectedForm = activeForms.find(f => f.id === selectedFormId) || activeForms[0];
  const isTeamForm = selectedForm?.type === "team";

  const renderSubmissionsTab = () => {
    if (activeForms.length === 0) {
      return (
        <div className="section-card p-12 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground">No active forms</h2>
          <p className="text-sm text-muted-foreground mt-1">Activate a registration form to start receiving submissions.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Form selector */}
        <div className="section-card p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Viewing submissions for:</span>
              <Select
                value={selectedForm?.id || ""}
                onValueChange={setSelectedFormId}
              >
                <SelectTrigger className="w-[320px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeForms.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      <span className="flex items-center gap-2">
                        {f.type === "team" ? <Users className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        {f.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedForm && (
              <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{selectedForm.type === "team" ? "Team" : "Individual"}</Badge>
                <span>{selectedForm.submissions} submissions</span>
                {selectedForm.capacity && <span>· Capacity: {selectedForm.capacity}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Submissions table */}
        {isTeamForm ? (
          <div className="section-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Team Submissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Submission Date/Time</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Division</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Captain Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid to Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockTeamSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{sub.submittedAt}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="text-xs font-normal">{sub.division}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{sub.teamName}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{sub.captainName}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{sub.email}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{sub.phone}</td>
                      <td className="px-5 py-3.5 text-sm text-right font-medium">
                        <span className={sub.paidToDate > 0 ? "text-success" : "text-destructive"}>
                          ${sub.paidToDate.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="section-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Individual Submissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Submission Date/Time</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Division</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Player Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockIndividualSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{sub.submittedAt}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="text-xs font-normal">{sub.division}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{sub.name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{sub.email}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{sub.phone}</td>
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
          </div>
        )}
      </div>
    );
  };

  // ─── Main View ───
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage registration forms and view submissions.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Registration Form
        </button>
      </div>

      {/* Search */}
      <div className="section-card p-4">
        <div className="flex items-center gap-3">
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
          <div className="ml-auto text-sm text-muted-foreground">{forms.length} total forms</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="team" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Team Registrations
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{teamForms.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            Individual Registrations
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{individualForms.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-1.5">
            <Inbox className="h-3.5 w-3.5" />
            Submissions
            {activeForms.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{activeForms.length} active</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          {renderFormList(teamForms)}
        </TabsContent>

        <TabsContent value="individual">
          {renderFormList(individualForms)}
        </TabsContent>

        <TabsContent value="submissions">
          {renderSubmissionsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
