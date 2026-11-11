import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingRun, PlayerRatingResult } from '@/ratings-engine/types/ratings';
import { getRatingRuns, deleteRatingRun, rollbackRatingRun, getResultsForRun, exportResultsToCSV, downloadCSV } from '@/ratings-engine/services/ratingsStorage';
import { generateDemoResults } from '@/ratings-engine/data/demoResults';
import { RatingRunsTable } from '@/ratings-engine/components/RatingRunsTable';
import { StatCard } from '@/ratings-engine/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Calculator, Users, Calendar, TrendingUp, Search, Download, ArrowUpDown, History } from 'lucide-react';

type SortKey = 'player_name' | 'offense_rating' | 'defense_rating' | 'qb_rating';

export default function RatingsDashboard() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<RatingRun[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; run?: RatingRun }>({ open: false });
  const [rollbackDialog, setRollbackDialog] = useState<{ open: boolean; run?: RatingRun }>({ open: false });

  // Past season ratings browser state
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('offense_rating');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = () => {
    setRuns(getRatingRuns());
  };

  // Seasons that have at least one run, most recent first
  const seasons = useMemo(() => {
    const seen = new Map<string, number>();
    runs.forEach((r) => {
      const ts = new Date(r.committed_at || r.created_at).getTime();
      const existing = seen.get(r.season_name);
      if (existing === undefined || ts > existing) seen.set(r.season_name, ts);
    });
    return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [runs]);

  // Runs for the selected season, prefer committed, most recent first
  const seasonRuns = useMemo(() => {
    return runs
      .filter((r) => r.season_name === selectedSeason && r.status !== 'draft')
      .sort((a, b) => {
        const aCommitted = a.status === 'committed' ? 1 : 0;
        const bCommitted = b.status === 'committed' ? 1 : 0;
        if (aCommitted !== bCommitted) return bCommitted - aCommitted;
        return new Date(b.committed_at || b.created_at).getTime() - new Date(a.committed_at || a.created_at).getTime();
      });
  }, [runs, selectedSeason]);

  // Default selections once runs load
  useEffect(() => {
    if (!selectedSeason && seasons.length > 0) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons, selectedSeason]);

  useEffect(() => {
    if (seasonRuns.length > 0 && !seasonRuns.some((r) => r.id === selectedRunId)) {
      setSelectedRunId(seasonRuns[0].id);
    }
  }, [seasonRuns, selectedRunId]);

  const selectedRun = runs.find((r) => r.id === selectedRunId);

  // Results for the selected run (stored, or stable demo data for seeded runs)
  const results: PlayerRatingResult[] = useMemo(() => {
    if (!selectedRun) return [];
    const stored = getResultsForRun(selectedRun.id);
    return stored.length > 0 ? stored : generateDemoResults(selectedRun);
  }, [selectedRun]);

  const divisions = useMemo(() => {
    return [...new Set(results.map((r) => r.division_name))].sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = results.filter((r) => {
      if (divisionFilter !== 'all' && r.division_name !== divisionFilter) return false;
      if (q && !r.player_name.toLowerCase().includes(q) && !r.team_name.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === undefined && bv === undefined) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });
  }, [results, search, divisionFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'player_name');
    }
  };

  const handleExportSeason = () => {
    if (!selectedRun || filteredResults.length === 0) {
      toast.error('No ratings to export');
      return;
    }
    const csv = exportResultsToCSV(filteredResults);
    downloadCSV(csv, `${selectedRun.version_label.replace(/\s+/g, '_')}_ratings.csv`);
    toast.success('CSV exported successfully');
  };

  const handleView = (run: RatingRun) => {
    navigate(`/ratings/wizard/${run.id}`);
  };

  const handleExport = (run: RatingRun) => {
    const results = getResultsForRun(run.id);
    if (results.length === 0) {
      toast.error('No results found for this run');
      return;
    }
    const csv = exportResultsToCSV(results);
    downloadCSV(csv, `${run.version_label.replace(/\s+/g, '_')}_ratings.csv`);
    toast.success('CSV exported successfully');
  };

  const handleRollback = (run: RatingRun) => {
    setRollbackDialog({ open: true, run });
  };

  const confirmRollback = () => {
    if (rollbackDialog.run) {
      rollbackRatingRun(rollbackDialog.run.id);
      loadRuns();
      toast.success('Rating run rolled back');
    }
    setRollbackDialog({ open: false });
  };

  const handleDelete = (run: RatingRun) => {
    setDeleteDialog({ open: true, run });
  };

  const confirmDelete = () => {
    if (deleteDialog.run) {
      deleteRatingRun(deleteDialog.run.id);
      loadRuns();
      toast.success('Rating run deleted');
    }
    setDeleteDialog({ open: false });
  };

  // Compute stats
  const totalRuns = runs.length;
  const committedRuns = runs.filter(r => r.status === 'committed').length;
  const lastCommit = runs
    .filter(r => r.committed_at)
    .sort((a, b) => new Date(b.committed_at!).getTime() - new Date(a.committed_at!).getTime())[0];
  const totalPlayersRated = runs
    .filter(r => r.status === 'committed')
    .reduce((sum, r) => sum + r.players_processed, 0);

  const SortableHead = ({ label, sortKeyName, className }: { label: string; sortKeyName: SortKey; className?: string }) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggleSort(sortKeyName)}
        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
      >
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </TableHead>
  );

  return (
    <div className="-m-6 min-h-full">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Player Ratings</h1>
              <p className="text-sm text-muted-foreground">
                Browse ratings from past seasons, or start a new rating run
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/ratings/wizard')} className="gap-2">
                <Plus className="h-4 w-4" />
                New Rating Run
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Past Season Ratings Browser */}
        <section className="section-card">
          <div className="section-card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Past Season Ratings</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRunId} onValueChange={setSelectedRunId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  {seasonRuns.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.version_label}{r.status === 'committed' ? ' · Final' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExportSeason} title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search player or team…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground sm:ml-auto">
              {filteredResults.length} player{filteredResults.length === 1 ? '' : 's'}
              {selectedRun ? ` · ${selectedRun.version_label}` : ''}
            </p>
          </div>

          <div className="max-h-[520px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Player" sortKeyName="player_name" />
                  <TableHead>Division</TableHead>
                  <TableHead>Team</TableHead>
                  <SortableHead label="OFF" sortKeyName="offense_rating" className="text-right" />
                  <SortableHead label="DEF" sortKeyName="defense_rating" className="text-right" />
                  <SortableHead label="QB" sortKeyName="qb_rating" className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      {seasons.length === 0
                        ? 'No rating runs yet — start a new rating run to see ratings here.'
                        : 'No players match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((r) => (
                    <TableRow key={r.id} className={r.excluded ? 'opacity-60' : undefined}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {r.player_name}
                          {r.excluded && (
                            <Badge variant="outline" className="text-[10px]">Excluded</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.division_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.team_name}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.offense_rating ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.defense_rating ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.qb_rating ?? '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Runs"
            value={totalRuns}
            description="All rating calculations"
            icon={Calculator}
          />
          <StatCard
            title="Committed Runs"
            value={committedRuns}
            description="Finalized ratings"
            icon={TrendingUp}
          />
          <StatCard
            title="Last Commit"
            value={lastCommit ? new Date(lastCommit.committed_at!).toLocaleDateString() : '—'}
            description={lastCommit?.version_label || 'No commits yet'}
            icon={Calendar}
          />
          <StatCard
            title="Players Rated"
            value={totalPlayersRated.toLocaleString()}
            description="Total across committed runs"
            icon={Users}
          />
        </div>

        {/* Rating Runs Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Rating Runs</h2>
          <RatingRunsTable
            runs={runs}
            onView={handleView}
            onExport={handleExport}
            onRollback={handleRollback}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating Run</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.run?.version_label}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rollback Dialog */}
      <AlertDialog open={rollbackDialog.open} onOpenChange={(open) => setRollbackDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback Rating Run</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rollback "{rollbackDialog.run?.version_label}"? 
              This will revert player ratings to their previous values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRollback}>
              Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
