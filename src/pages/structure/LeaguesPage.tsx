import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus, Trophy, Edit, Trash2, Star, Users, Calendar, Shield,
  CheckCircle2, Settings, MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface League {
  id: string;
  name: string;
  sportType: string;
  status: "active" | "inactive" | "archived";
  seasonsCount: number;
  teamsCount: number;
  membersCount: number;
  createdAt: string;
  currentSeason?: string;
}

const MOCK_LEAGUES: League[] = [
  {
    id: "l1",
    name: "Adult Flag Football League",
    sportType: "Flag Football",
    status: "active",
    seasonsCount: 8,
    teamsCount: 24,
    membersCount: 312,
    createdAt: "2020-03-15",
    currentSeason: "Spring 2026",
  },
  {
    id: "l2",
    name: "Junior Development League",
    sportType: "Flag Football",
    status: "active",
    seasonsCount: 4,
    teamsCount: 16,
    membersCount: 192,
    createdAt: "2022-09-01",
    currentSeason: "Spring 2026",
  },
  {
    id: "l3",
    name: "Women's Competitive League",
    sportType: "Flag Football",
    status: "inactive",
    seasonsCount: 2,
    teamsCount: 8,
    membersCount: 96,
    createdAt: "2024-01-10",
  },
];

const SPORT_TYPES = ["Flag Football", "Basketball", "Soccer", "Volleyball", "Softball", "Other"];

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>(MOCK_LEAGUES);
  const [createOpen, setCreateOpen] = useState(false);
  const [editLeague, setEditLeague] = useState<League | null>(null);
  const [newName, setNewName] = useState("");
  const [newSport, setNewSport] = useState("Flag Football");

  const activeLeague = leagues.find(l => l.status === "active");

  const handleCreate = () => {
    if (!newName.trim()) return;
    const league: League = {
      id: String(Date.now()),
      name: newName.trim(),
      sportType: newSport,
      status: "active",
      seasonsCount: 0,
      teamsCount: 0,
      membersCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLeagues(prev => [...prev, league]);
    setCreateOpen(false);
    setNewName("");
    toast.success(`"${league.name}" created`);
  };

  const handleDelete = (id: string) => {
    setLeagues(prev => prev.filter(l => l.id !== id));
    toast.success("League removed");
  };

  const handleSetActive = (id: string) => {
    setLeagues(prev => prev.map(l => ({
      ...l,
      status: l.id === id ? "active" : l.status === "active" ? "inactive" : l.status,
    }) as League));
    toast.success("Active league updated");
  };

  const statusBadge = (status: League["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="gap-1 bg-primary text-primary-foreground"><CheckCircle2 className="h-3 w-3" /> Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="gap-1">Inactive</Badge>;
      case "archived":
        return <Badge variant="outline" className="gap-1 text-muted-foreground">Archived</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leagues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage multiple leagues under your organization. The active league is shown across the platform.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New League
        </Button>
      </div>

      {/* Active League Banner */}
      {activeLeague && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{activeLeague.name}</h3>
                    <Badge className="bg-primary text-primary-foreground text-[10px]">Active League</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activeLeague.currentSeason ? `Current Season: ${activeLeague.currentSeason}` : "No active season"}
                    {" · "}{activeLeague.teamsCount} teams · {activeLeague.membersCount} members
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" /> League Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Leagues */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leagues.map(league => (
          <Card key={league.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{league.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    {league.sportType}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  {statusBadge(league.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditLeague(league)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {league.status !== "active" && (
                        <DropdownMenuItem onClick={() => handleSetActive(league.id)}>
                          <Star className="h-4 w-4 mr-2" /> Set as Active
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(league.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold text-foreground">{league.seasonsCount}</p>
                  <p className="text-[11px] text-muted-foreground">Seasons</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold text-foreground">{league.teamsCount}</p>
                  <p className="text-[11px] text-muted-foreground">Teams</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold text-foreground">{league.membersCount}</p>
                  <p className="text-[11px] text-muted-foreground">Members</p>
                </div>
              </div>
              {league.currentSeason && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Current: <span className="font-medium text-foreground">{league.currentSeason}</span>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Created {new Date(league.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> New League
            </DialogTitle>
            <DialogDescription>Create a new league under your organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>League Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Adult Flag Football League" />
            </div>
            <div className="space-y-2">
              <Label>Sport Type</Label>
              <Select value={newSport} onValueChange={setNewSport}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPORT_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create League</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
