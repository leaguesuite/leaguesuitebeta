import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Calendar, Search, Eye, Play, CheckCircle2, Clock, Archive,
  Users, Trophy, ChevronRight, BarChart3,
} from "lucide-react";

interface Season {
  id: string;
  name: string;
  league: string;
  status: "draft" | "registration" | "active" | "completed" | "archived";
  startDate: string;
  endDate: string;
  divisions: number;
  teams: number;
  games: number;
  gamesCompleted: number;
}

const MOCK_SEASONS: Season[] = [
  {
    id: "s1", name: "Spring 2026", league: "Adult Flag Football League",
    status: "active", startDate: "2026-03-01", endDate: "2026-06-15",
    divisions: 4, teams: 24, games: 96, gamesCompleted: 32,
  },
  {
    id: "s2", name: "Winter 2025-26", league: "Adult Flag Football League",
    status: "completed", startDate: "2025-11-01", endDate: "2026-02-15",
    divisions: 3, teams: 18, games: 72, gamesCompleted: 72,
  },
  {
    id: "s3", name: "Fall 2025", league: "Adult Flag Football League",
    status: "completed", startDate: "2025-09-01", endDate: "2025-11-30",
    divisions: 4, teams: 24, games: 96, gamesCompleted: 96,
  },
  {
    id: "s4", name: "Summer 2025", league: "Adult Flag Football League",
    status: "archived", startDate: "2025-06-01", endDate: "2025-08-31",
    divisions: 3, teams: 16, games: 64, gamesCompleted: 64,
  },
  {
    id: "s5", name: "Spring 2026", league: "Junior Development League",
    status: "active", startDate: "2026-03-15", endDate: "2026-06-30",
    divisions: 3, teams: 16, games: 48, gamesCompleted: 12,
  },
  {
    id: "s6", name: "Fall 2025", league: "Junior Development League",
    status: "completed", startDate: "2025-09-15", endDate: "2025-12-15",
    divisions: 2, teams: 12, games: 36, gamesCompleted: 36,
  },
];

function statusBadge(status: Season["status"]) {
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

export default function SeasonsPage() {
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const leagues = [...new Set(MOCK_SEASONS.map(s => s.league))];

  const filtered = MOCK_SEASONS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchLeague = leagueFilter === "all" || s.league === leagueFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchLeague && matchStatus;
  });

  const activeSeason = MOCK_SEASONS.find(s => s.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seasons</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View current and past seasons across all leagues. Access historical standings, schedules, and stats.
        </p>
      </div>

      {/* Active Season Banner */}
      {activeSeason && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{activeSeason.name}</h3>
                    <Badge className="bg-primary text-primary-foreground text-[10px]">Current Season</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activeSeason.league} · {activeSeason.gamesCompleted}/{activeSeason.games} games played · {activeSeason.teams} teams
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> View Season
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search seasons..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seasons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Season</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Dates</TableHead>
                  <TableHead className="text-center">Divisions</TableHead>
                  <TableHead className="text-center">Teams</TableHead>
                  <TableHead className="text-center">Games</TableHead>
                  <TableHead className="text-right w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(season => (
                  <TableRow key={season.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{season.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{season.league}</TableCell>
                    <TableCell className="text-center">{statusBadge(season.status)}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(season.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      {" – "}
                      {new Date(season.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-center">{season.divisions}</TableCell>
                    <TableCell className="text-center">{season.teams}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {season.gamesCompleted}/{season.games}
                      </span>
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
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No seasons found.
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
