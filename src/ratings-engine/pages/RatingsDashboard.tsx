import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingRun } from '@/ratings-engine/types/ratings';
import { getRatingRuns, deleteRatingRun, rollbackRatingRun, getResultsForRun, exportResultsToCSV, downloadCSV } from '@/ratings-engine/services/ratingsStorage';
import { RatingRunsTable } from '@/ratings-engine/components/RatingRunsTable';
import { StatCard } from '@/ratings-engine/components/StatCard';
import { Button } from '@/components/ui/button';
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
import { Plus, Calculator, Users, Calendar, TrendingUp } from 'lucide-react';

export default function RatingsDashboard() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<RatingRun[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; run?: RatingRun }>({ open: false });
  const [rollbackDialog, setRollbackDialog] = useState<{ open: boolean; run?: RatingRun }>({ open: false });

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = () => {
    setRuns(getRatingRuns());
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

  return (
    <div className="-m-6 min-h-full">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Player Ratings Engine</h1>
              <p className="text-sm text-muted-foreground">
                Calculate, review, and commit player ratings
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/ratings/wizard')} className="gap-2">
                <Plus className="h-4 w-4" />
                New Rating Run
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
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
