import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Eye, Play, CheckCircle2, Clock, Archive, Trophy,
  Users, Calendar, MapPin, GitBranch,
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  league: string;
  status: "draft" | "registration" | "active" | "completed" | "archived";
  date: string;
  location: string;
  format: string;
  teams: number;
  divisions: number;
  champion?: string;
}

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: "t1", name: "Spring Showdown 2026", league: "Adult Flag Football League",
    status: "active", date: "2026-04-12", location: "Central Sports Complex",
    format: "Single Elimination", teams: 16, divisions: 2,
  },
  {
    id: "t2", name: "Year-End Championship 2025", league: "Adult Flag Football League",
    status: "completed", date: "2025-12-06", location: "Metro Stadium",
    format: "Double Elimination", teams: 8, divisions: 1,
    champion: "Thunder Hawks",
  },
  {
    id: "t3", name: "Summer Slam 2025", league: "Adult Flag Football League",
    status: "completed", date: "2025-07-19", location: "Riverside Fields",
    format: "Round Robin + Bracket", teams: 12, divisions: 2,
    champion: "Iron Eagles",
  },
  {
    id: "t4", name: "Junior Invitational 2025", league: "Junior Development League",
    status: "completed", date: "2025-10-25", location: "Youth Sports Park",
    format: "Single Elimination", teams: 8, divisions: 1,
    champion: "Lightning Bolts",
  },
  {
    id: "t5", name: "All-Star Weekend 2025", league: "Adult Flag Football League",
    status: "archived", date: "2025-05-03", location: "Main Arena",
    format: "Exhibition + Bracket", teams: 4, divisions: 1,
    champion: "Team Red",
  },
];

function statusBadge(status: Tournament["status"]) {
  switch (status) {
    case "active":
      return <Badge className="gap-1 bg-primary text-primary-foreground"><Play className="h-3 w-3" /> Active</Badge>;
    case "completed":
      return <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
    case "registration":
      return <Badge variant="outline" className="gap-1 border-primary/30 text-primary"><Users className="h-3 w-3" /> Registration</Badge>;
    case "draft":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Draft</Badge>;
    case "archived":
      return <Badge variant="outline" className="gap-1 text-muted-foreground"><Archive className="h-3 w-3" /> Archived</Badge>;
  }
}

export default function TournamentsPage() {
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const leagues = [...new Set(MOCK_TOURNAMENTS.map(t => t.league))];

  const filtered = MOCK_TOURNAMENTS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchLeague = leagueFilter === "all" || t.league === leagueFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchLeague && matchStatus;
  });

  const activeTournament = MOCK_TOURNAMENTS.find(t => t.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tournaments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View current and past tournaments. Access brackets, results, and champions.
        </p>
      </div>

      {/* Active Tournament Banner */}
      {activeTournament && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{activeTournament.name}</h3>
                    <Badge className="bg-primary text-primary-foreground text-[10px]">In Progress</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activeTournament.league} · {activeTournament.teams} teams · {activeTournament.format}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> View Tournament
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tournaments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="All Leagues" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tournaments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Tournament</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Format</TableHead>
                  <TableHead className="text-center">Teams</TableHead>
                  <TableHead>Champion</TableHead>
                  <TableHead className="text-right w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(tournament => (
                  <TableRow key={tournament.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{tournament.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{tournament.league}</TableCell>
                    <TableCell className="text-center">{statusBadge(tournament.status)}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(tournament.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {tournament.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs font-normal">
                        <GitBranch className="h-3 w-3 mr-1" />
                        {tournament.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{tournament.teams}</TableCell>
                    <TableCell>
                      {tournament.champion ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="font-medium">{tournament.champion}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">TBD</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No tournaments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
