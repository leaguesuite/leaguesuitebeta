import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Bird, Calculator, Plus, Trash2, Calendar, Users, FolderOpen } from 'lucide-react';
import { League, LeagueRun } from '@/ratings-engine/types/league';
import { getLeague, getLeagueRuns, deleteLeagueRun } from '@/ratings-engine/services/leagueStorage';
import { StatCard } from '@/ratings-engine/components/StatCard';
import { toast } from 'sonner';

export default function LeagueDashboard() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | undefined>();
  const [runs, setRuns] = useState<LeagueRun[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; run?: LeagueRun }>({ open: false });

  useEffect(() => {
    if (leagueId) {
      setLeague(getLeague(leagueId));
      setRuns(getLeagueRuns(leagueId));
    }
  }, [leagueId]);

  if (!league) {
    return (
      <div className="-m-6 min-h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">League not found</h2>
          <Button onClick={() => navigate('/ratings/leagues')}>Back to Leagues</Button>
        </div>
      </div>
    );
  }

  const confirmDelete = () => {
    if (deleteDialog.run) {
      deleteLeagueRun(deleteDialog.run.id);
      setRuns(getLeagueRuns(league.id));
      toast.success('Run deleted');
    }
    setDeleteDialog({ open: false });
  };

  const committedRuns = runs.filter(r => r.status === 'committed').length;
  const totalPlayers = runs.reduce((s, r) => s + r.playersProcessed, 0);
  const lastRun = runs[0];

  const statusColor = (status: LeagueRun['status']) => {
    switch (status) {
      case 'committed': return 'default';
      case 'completed': return 'secondary';
      case 'draft': return 'outline';
    }
  };

  return (
    <div className="-m-6 min-h-full">
      <header className="border-b bg-card/50">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/ratings/leagues')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">{league.name}</h1>
                  {league.description && (
                    <p className="text-sm text-muted-foreground">{league.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/ratings/eagle')}
                className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
              >
                <Bird className="h-4 w-4" />
                Eagle Ratings
              </Button>
              <Button onClick={() => navigate('/ratings/wizard')} className="gap-2">
                <Plus className="h-4 w-4" />
                New Rating Run
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Runs" value={runs.length} description="All rating runs" icon={Calculator} />
          <StatCard title="Committed" value={committedRuns} description="Finalized ratings" icon={Calculator} />
          <StatCard
            title="Last Run"
            value={lastRun ? new Date(lastRun.createdAt).toLocaleDateString() : '—'}
            description={lastRun?.label || 'No runs yet'}
            icon={Calendar}
          />
          <StatCard title="Players Rated" value={totalPlayers.toLocaleString()} description="Total across runs" icon={Users} />
        </div>

        {/* Runs Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Rating Runs</h2>
          {runs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Calculator className="h-10 w-10 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">No runs yet</h3>
                  <p className="text-sm text-muted-foreground">Start a new rating run for this league</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Players</TableHead>
                    <TableHead className="text-right">Excluded</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map(run => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.label}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {run.ratingType === 'eagle' && <Bird className="h-3 w-3" />}
                          {run.ratingType === 'eagle' ? 'Eagle' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColor(run.status)}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{run.playersProcessed}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{run.playersExcluded}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeleteDialog({ open: true, run })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Run</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteDialog.run?.label}"? This cannot be undone.
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
    </div>
  );
}
