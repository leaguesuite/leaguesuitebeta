import { useState, useMemo, useRef } from "react";
import { mockMembers, mockPlayers } from "@/data/mockMembers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Edit, Plus, Trash2, Upload, UserPlus, ArrowUpDown, Camera, X, ImageIcon } from "lucide-react";

import CsvImportDialog from "@/components/shared/CsvImportDialog";

interface Team {
  id: string;
  name: string;
  division: string;
  captain: string;
  coach: string;
  logoUrl?: string;
  teamPhotoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const INITIAL_TEAMS: Team[] = [
  { id: "1", name: "Eagles", division: "Division A", captain: "John Smith", coach: "N/A", primaryColor: "#1e40af", secondaryColor: "#fbbf24" },
  { id: "2", name: "Tigers", division: "Division A", captain: "Emily Brown", coach: "Sarah Johnson", primaryColor: "#ea580c", secondaryColor: "#000000" },
  { id: "3", name: "Hawks", division: "Division B", captain: "Jessica Thomas", coach: "N/A", primaryColor: "#059669", secondaryColor: "#ffffff" },
  { id: "4", name: "Lions", division: "Division B", captain: "Kevin Garcia", coach: "N/A", primaryColor: "#7c3aed", secondaryColor: "#fde047" },
];

const DIVISIONS = ["All Divisions", "Division A", "Division B"];

type SortKey = "name" | "division" | "captain";
type SortDir = "asc" | "desc";

export default function TeamsRostersPage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [divisionFilter, setDivisionFilter] = useState("All Divisions");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [editForm, setEditForm] = useState<Team | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    const list = divisionFilter === "All Divisions" ? teams : teams.filter(t => t.division === divisionFilter);
    return [...list].sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [teams, divisionFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
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
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Teams Table */}
        <div className="section-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead><SortHeader k="name" label="Team Name" /></TableHead>
                <TableHead><SortHeader k="division" label="Division" /></TableHead>
                <TableHead><SortHeader k="captain" label="Captain" /></TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map(team => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium text-foreground">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{team.division}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{team.captain || "—"}</TableCell>
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
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No teams found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Team Dialog */}
        <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            {editForm && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Select value={editForm.division} onValueChange={v => setEditForm({ ...editForm, division: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DIVISIONS.filter(d => d !== "All Divisions").map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Captain</Label>
                    <Input value={editForm.captain} onChange={e => setEditForm({ ...editForm, captain: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Coach</Label>
                    <Input value={editForm.coach} onChange={e => setEditForm({ ...editForm, coach: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
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
          expectedColumns={["team_name", "division", "captain", "coach"]}
          sampleRows={[
            ["Eagles", "Division A", "John Smith", "N/A"],
            ["Tigers", "Division A", "Emily Brown", "Sarah Johnson"],
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
