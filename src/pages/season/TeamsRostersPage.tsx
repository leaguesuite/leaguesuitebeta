import { useState, useMemo, useRef } from "react";
import { mockMembers, mockPlayers } from "@/data/mockMembers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit, Plus, Trash2, Upload, UserPlus, ArrowUpDown, Camera, X, ImageIcon, Filter, ArrowRightLeft, Mail } from "lucide-react";

import CsvImportDialog from "@/components/shared/CsvImportDialog";
import BulkMessageDialog from "@/components/shared/BulkMessageDialog";

interface Team {
  id: string;
  name: string;
  division: string;
  captain: string;
  captainEmail: string;
  coach: string;
  logoUrl?: string;
  teamPhotoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const INITIAL_TEAMS: Team[] = [
  { id: "1", name: "Eagles", division: "Division A", captain: "John Smith", captainEmail: "john.smith@example.com", coach: "N/A", primaryColor: "#1e40af", secondaryColor: "#fbbf24" },
  { id: "2", name: "Tigers", division: "Division A", captain: "Emily Brown", captainEmail: "emily.brown@example.com", coach: "Sarah Johnson", primaryColor: "#ea580c", secondaryColor: "#000000" },
  { id: "3", name: "Hawks", division: "Division B", captain: "Jessica Thomas", captainEmail: "jessica.thomas@example.com", coach: "N/A", primaryColor: "#059669", secondaryColor: "#ffffff" },
  { id: "4", name: "Lions", division: "Division B", captain: "Kevin Garcia", captainEmail: "kevin.garcia@example.com", coach: "N/A", primaryColor: "#7c3aed", secondaryColor: "#fde047" },
];

const DIVISIONS = ["Division A", "Division B"];

type SortKey = "name" | "division" | "captain";
type SortDir = "asc" | "desc";

export default function TeamsRostersPage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([...DIVISIONS]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [editForm, setEditForm] = useState<Team | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // Bulk selection state
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkMoveTarget, setBulkMoveTarget] = useState<string>(DIVISIONS[0]);
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false);

  const allDivisionsSelected = selectedDivisions.length === DIVISIONS.length;

  const filteredTeams = useMemo(() => {
    const list = teams.filter(t => selectedDivisions.includes(t.division));
    return [...list].sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [teams, selectedDivisions, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleDivision = (d: string) => {
    setSelectedDivisions(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const toggleAllDivisions = () => {
    setSelectedDivisions(allDivisionsSelected ? [] : [...DIVISIONS]);
  };

  const visibleIds = filteredTeams.map(t => t.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedTeamIds.includes(id));
  const someVisibleSelected = visibleIds.some(id => selectedTeamIds.includes(id));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedTeamIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedTeamIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectTeam = (id: string) => {
    setSelectedTeamIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const confirmBulkDelete = () => {
    setTeams(prev => prev.filter(t => !selectedTeamIds.includes(t.id)));
    setSelectedTeamIds([]);
    setBulkDeleteOpen(false);
  };

  const confirmBulkMove = () => {
    setTeams(prev => prev.map(t => selectedTeamIds.includes(t.id) ? { ...t, division: bulkMoveTarget } : t));
    setSelectedTeamIds([]);
    setBulkMoveOpen(false);
  };

  const getTeamRoster = (teamName: string) =>
    mockPlayers.filter(p => p.team_name === teamName).map(p => {
      const member = mockMembers.find(m => m.member_id === p.member_id);
      return { ...p, status: member?.status || "active" };
    });

  const openEditTeam = (team: Team) => { setEditForm({ ...team }); setEditTeamOpen(true); };
  const saveTeamEdit = () => {
    if (!editForm) return;
    setTeams(prev => prev.map(t => t.id === editForm.id ? editForm : t));
    setEditTeamOpen(false);
  };
  const openRoster = (team: Team) => { setSelectedTeam(team); setRosterOpen(true); };

  const unrosteredMembers = mockMembers.filter(m =>
    m.status === "active" && !mockPlayers.some(p => p.member_id === m.member_id && p.team_name === selectedTeam?.name)
  );

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-60" />
    </button>
  );

  const divisionLabel = allDivisionsSelected
    ? "All Divisions"
    : selectedDivisions.length === 0
      ? "No divisions"
      : selectedDivisions.length === 1
        ? selectedDivisions[0]
        : `${selectedDivisions.length} divisions`;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teams & Rosters</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage teams and rosters for the active season.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-44 justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Filter className="h-4 w-4" /> {divisionLabel}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                <div className="space-y-1">
                  <button
                    onClick={toggleAllDivisions}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm"
                  >
                    <Checkbox checked={allDivisionsSelected} />
                    <span className="font-medium">All Divisions</span>
                  </button>
                  <div className="h-px bg-border my-1" />
                  {DIVISIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDivision(d)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm"
                    >
                      <Checkbox checked={selectedDivisions.includes(d)} />
                      <span>{d}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedTeamIds.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2">
            <span className="text-sm text-foreground">
              {selectedTeamIds.length} team{selectedTeamIds.length === 1 ? "" : "s"} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setBulkMoveOpen(true)}>
                <ArrowRightLeft className="h-4 w-4" /> Move to division
              </Button>
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTeamIds([])}>Clear</Button>
            </div>
          </div>
        )}

        {/* Teams Table */}
        <div className="section-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                    onCheckedChange={toggleSelectAllVisible}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead><SortHeader k="name" label="Team Name" /></TableHead>
                <TableHead><SortHeader k="division" label="Division" /></TableHead>
                <TableHead><SortHeader k="captain" label="Captain" /></TableHead>
                <TableHead>Captain Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map(team => (
                <TableRow key={team.id} data-state={selectedTeamIds.includes(team.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTeamIds.includes(team.id)}
                      onCheckedChange={() => toggleSelectTeam(team.id)}
                      aria-label={`Select ${team.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{team.division}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{team.captain || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {team.captainEmail ? (
                      <a href={`mailto:${team.captainEmail}`} className="hover:text-foreground hover:underline">
                        {team.captainEmail}
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTeam(team)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit team info</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openRoster(team)}>
                            <Users className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View roster</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTeams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No teams found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bulk Delete Confirm */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedTeamIds.length} team{selectedTeamIds.length === 1 ? "" : "s"}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the selected teams from this season. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Move Dialog */}
        <Dialog open={bulkMoveOpen} onOpenChange={setBulkMoveOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Move teams to division</DialogTitle>
              <DialogDescription>
                Move {selectedTeamIds.length} selected team{selectedTeamIds.length === 1 ? "" : "s"} to a different division.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label>Target Division</Label>
              <Select value={bulkMoveTarget} onValueChange={setBulkMoveTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkMoveOpen(false)}>Cancel</Button>
              <Button onClick={confirmBulkMove}>Move teams</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Team Dialog */}
        <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            {editForm && <EditTeamBody form={editForm} setForm={setEditForm} />}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTeamOpen(false)}>Cancel</Button>
              <Button onClick={saveTeamEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Roster Dialog */}
        <Dialog open={rosterOpen} onOpenChange={setRosterOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTeam?.name} — Roster</DialogTitle>
            </DialogHeader>
            {selectedTeam && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {getTeamRoster(selectedTeam.name).length} players on roster
                  </span>
                  <Button size="sm" onClick={() => setAddPlayerOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-1.5" /> Add Player
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTeamRoster(selectedTeam.name).map((p, i) => (
                        <TableRow key={p.player_id}>
                          <TableCell className="font-mono text-sm text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>
                            <span className="font-medium text-sm text-foreground">{p.player_name}</span>
                            <span className="block text-xs text-muted-foreground">ID: {p.member_id}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getTeamRoster(selectedTeam.name).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No players on this roster yet. Click "Add Player" to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Player Dialog */}
        <Dialog open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
          <DialogContent className="sm:max-w-md max-h-[70vh]">
            <DialogHeader>
              <DialogTitle>Add Player to {selectedTeam?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Search members..." className="w-full" />
              <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
                {unrosteredMembers.map(m => (
                  <button
                    key={m.member_id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">{m.first_name} {m.last_name}</span>
                      <span className="block text-xs text-muted-foreground">{m.email}</span>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* CSV Import */}
        <CsvImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          title="Import Teams & Rosters"
          description="Upload a CSV to bulk-import teams and roster assignments."
          expectedColumns={["team_name", "division", "captain", "captain_email", "coach"]}
          sampleRows={[
            ["Eagles", "Division A", "John Smith", "john.smith@example.com", "N/A"],
            ["Tigers", "Division A", "Emily Brown", "emily.brown@example.com", "Sarah Johnson"],
          ]}
          onImport={(rows) => {
            const newTeams: Team[] = [];
            rows.forEach(r => {
              if (!r.team_name) return;
              if (!teams.some(t => t.name === r.team_name)) {
                newTeams.push({
                  id: String(Date.now()) + r.team_name,
                  name: r.team_name,
                  division: r.division || "Division A",
                  captain: r.captain || "",
                  captainEmail: r.captain_email || "",
                  coach: r.coach || "N/A",
                });
              }
            });
            if (newTeams.length) setTeams(prev => [...prev, ...newTeams]);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

interface EditTeamBodyProps {
  form: Team;
  setForm: (t: Team) => void;
}

function EditTeamBody({ form, setForm }: EditTeamBodyProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined, key: "logoUrl" | "teamPhotoUrl") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, [key]: reader.result as string });
    reader.readAsDataURL(file);
  };

  const primary = form.primaryColor || "#3b82f6";
  const secondary = form.secondaryColor || "#ffffff";

  return (
    <div className="py-2">
      <Tabs defaultValue="details">
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          <TabsTrigger value="branding" className="flex-1">Branding</TabsTrigger>
          <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Division</Label>
            <Select value={form.division} onValueChange={v => setForm({ ...form, division: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIVISIONS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Captain</Label>
              <Input value={form.captain} onChange={e => setForm({ ...form, captain: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Captain Email</Label>
              <Input type="email" value={form.captainEmail} onChange={e => setForm({ ...form, captainEmail: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Coach</Label>
            <Input value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })} />
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primary}
                  onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={primary}
                  onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondary}
                  onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={secondary}
                  onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow"
                style={{ backgroundColor: primary, color: secondary }}
              >
                {form.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-foreground">{form.name}</div>
                <div className="h-1.5 w-24 rounded-full mt-1" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Team Logo</Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0], "logoUrl")}
            />
            <div
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              {form.logoUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={form.logoUrl} alt="Logo" className="w-20 h-20 object-contain rounded-lg" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}>
                      <ImageIcon className="h-3.5 w-3.5 mr-1" /> Change
                    </Button>
                    <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setForm({ ...form, logoUrl: "" }); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Click to upload logo</span>
                  <span className="text-xs">PNG, SVG, or JPG (max 2MB)</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Team Photo</Label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0], "teamPhotoUrl")}
            />
            <div
              onClick={() => photoInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              {form.teamPhotoUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={form.teamPhotoUrl} alt="Team" className="w-full h-32 object-cover rounded-lg" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}>
                      <ImageIcon className="h-3.5 w-3.5 mr-1" /> Change
                    </Button>
                    <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setForm({ ...form, teamPhotoUrl: "" }); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                  <span className="text-sm">Click to upload team photo</span>
                  <span className="text-xs">JPG or PNG (max 5MB)</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
