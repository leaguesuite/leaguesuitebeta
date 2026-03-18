import { useState } from "react";
import { mockMembers, mockPlayers } from "@/data/mockMembers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Users, Edit, Plus, Trash2, Upload, Palette, Camera, UserPlus, Shield, X } from "lucide-react";
import CsvImportDialog from "@/components/shared/CsvImportDialog";

interface Team {
  id: string;
  name: string;
  division: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  teamPhotoUrl: string;
  captain: string;
  coach: string;
  record: string;
}

const INITIAL_TEAMS: Team[] = [
  { id: "1", name: "Eagles", division: "Division A", primaryColor: "#1e40af", secondaryColor: "#fbbf24", logoUrl: "", teamPhotoUrl: "", captain: "John Smith", coach: "N/A", record: "5-2" },
  { id: "2", name: "Tigers", division: "Division A", primaryColor: "#ea580c", secondaryColor: "#000000", logoUrl: "", teamPhotoUrl: "", captain: "Emily Brown", coach: "Sarah Johnson", record: "4-3" },
  { id: "3", name: "Hawks", division: "Division B", primaryColor: "#059669", secondaryColor: "#ffffff", logoUrl: "", teamPhotoUrl: "", captain: "Jessica Thomas", coach: "N/A", record: "6-1" },
  { id: "4", name: "Lions", division: "Division B", primaryColor: "#7c3aed", secondaryColor: "#fde047", logoUrl: "", teamPhotoUrl: "", captain: "Kevin Garcia", coach: "N/A", record: "3-4" },
];

const DIVISIONS = ["All Divisions", "Division A", "Division B"];

export default function TeamsRostersPage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [divisionFilter, setDivisionFilter] = useState("All Divisions");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [editForm, setEditForm] = useState<Team | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filteredTeams = divisionFilter === "All Divisions" ? teams : teams.filter(t => t.division === divisionFilter);

  const getTeamRoster = (teamName: string) =>
    mockPlayers.filter(p => p.team_name === teamName).map(p => {
      const member = mockMembers.find(m => m.member_id === p.member_id);
      return { ...p, avatar: member?.avatar_url, status: member?.status || "active" };
    });

  const openEditTeam = (team: Team) => {
    setEditForm({ ...team });
    setEditTeamOpen(true);
  };

  const saveTeamEdit = () => {
    if (!editForm) return;
    setTeams(prev => prev.map(t => t.id === editForm.id ? editForm : t));
    setEditTeamOpen(false);
  };

  const openRoster = (team: Team) => {
    setSelectedTeam(team);
    setRosterOpen(true);
  };

  const unrosteredMembers = mockMembers.filter(m =>
    m.status === "active" && !mockPlayers.some(p => p.member_id === m.member_id && p.team_name === selectedTeam?.name)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams & Rosters</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage teams, rosters, and team details for the active season.</p>
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

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTeams.map(team => {
          const roster = getTeamRoster(team.name);
          return (
            <div key={team.id} className="section-card overflow-hidden">
              {/* Team color bar */}
              <div className="h-2" style={{ background: `linear-gradient(90deg, ${team.primaryColor}, ${team.secondaryColor})` }} />

              <div className="p-5">
                {/* Team header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm"
                      style={{ backgroundColor: team.primaryColor, color: team.secondaryColor }}
                    >
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        team.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{team.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{team.division}</Badge>
                        <span className="text-xs text-muted-foreground font-medium">{team.record}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTeam(team)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Team meta */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Captain</span>
                    <p className="font-medium text-foreground">{team.captain}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Coach</span>
                    <p className="font-medium text-foreground">{team.coach}</p>
                  </div>
                </div>

                {/* Colors preview */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Palette className="h-3.5 w-3.5" />
                    <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: team.primaryColor }} />
                    <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: team.secondaryColor }} />
                  </div>
                </div>

                {/* Roster preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-2">
                      {roster.slice(0, 5).map(p => (
                        <Avatar key={p.player_id} className="h-7 w-7 border-2 border-card">
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                            {p.player_name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">{roster.length} players</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openRoster(team)}>
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Roster
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Team Dialog */}
      <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-5 py-2">
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="branding" className="flex-1">Branding</TabsTrigger>
                  <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
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
                </TabsContent>

                <TabsContent value="branding" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editForm.primaryColor}
                          onChange={e => setEditForm({ ...editForm, primaryColor: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                        />
                        <Input
                          value={editForm.primaryColor}
                          onChange={e => setEditForm({ ...editForm, primaryColor: e.target.value })}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editForm.secondaryColor}
                          onChange={e => setEditForm({ ...editForm, secondaryColor: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                        />
                        <Input
                          value={editForm.secondaryColor}
                          onChange={e => setEditForm({ ...editForm, secondaryColor: e.target.value })}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow"
                        style={{ backgroundColor: editForm.primaryColor, color: editForm.secondaryColor }}
                      >
                        {editForm.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{editForm.name}</div>
                        <div className="h-1.5 w-24 rounded-full mt-1" style={{ background: `linear-gradient(90deg, ${editForm.primaryColor}, ${editForm.secondaryColor})` }} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Team Logo</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      {editForm.logoUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={editForm.logoUrl} alt="Logo" className="w-20 h-20 object-contain rounded-lg" />
                          <Button variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, logoUrl: "" })}>
                            <X className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
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
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      {editForm.teamPhotoUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={editForm.teamPhotoUrl} alt="Team" className="w-full h-32 object-cover rounded-lg" />
                          <Button variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, teamPhotoUrl: "" })}>
                            <X className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
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
            <DialogTitle className="flex items-center gap-3">
              {selectedTeam && (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: selectedTeam.primaryColor, color: selectedTeam.secondaryColor }}
                  >
                    {selectedTeam.name.charAt(0)}
                  </div>
                  {selectedTeam.name} — Roster
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {getTeamRoster(selectedTeam.name).length} players on roster
                </span>
                <Button size="sm" onClick={() => setAddPlayerOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Add Player
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="table-header w-12">#</TableHead>
                      <TableHead className="table-header">Player</TableHead>
                      <TableHead className="table-header">Status</TableHead>
                      <TableHead className="table-header text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTeamRoster(selectedTeam.name).map((p, i) => (
                      <TableRow key={p.player_id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={p.avatar} />
                              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                {p.player_name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-sm text-foreground">{p.player_name}</span>
                              <span className="block text-xs text-muted-foreground">ID: {p.member_id}</span>
                            </div>
                          </div>
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={m.avatar_url} />
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                      {m.first_name[0]}{m.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
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
        description="Upload a CSV to bulk-import teams and roster assignments. Each row can represent a team or a player-to-team assignment."
        expectedColumns={["team_name", "division", "player_name", "player_email", "role"]}
        sampleRows={[
          ["Eagles", "Division A", "John Smith", "john@email.com", "player"],
          ["Eagles", "Division A", "Jane Doe", "jane@email.com", "captain"],
          ["Tigers", "Division B", "Mike Lee", "mike@email.com", "player"],
        ]}
        onImport={(rows) => {
          const teamMap = new Map<string, { division: string; players: string[] }>();
          rows.forEach(r => {
            const key = r.team_name;
            if (!key) return;
            if (!teamMap.has(key)) teamMap.set(key, { division: r.division || "Division A", players: [] });
            if (r.player_name) teamMap.get(key)!.players.push(r.player_name);
          });
          const newTeams: Team[] = [];
          teamMap.forEach((val, name) => {
            if (!teams.some(t => t.name === name)) {
              newTeams.push({
                id: String(Date.now()) + name,
                name,
                division: val.division,
                primaryColor: "#6366f1",
                secondaryColor: "#ffffff",
                logoUrl: "",
                teamPhotoUrl: "",
                captain: "",
                coach: "N/A",
                record: "0-0",
              });
            }
          });
          if (newTeams.length) setTeams(prev => [...prev, ...newTeams]);
        }}
      />
    </div>
  );
}
