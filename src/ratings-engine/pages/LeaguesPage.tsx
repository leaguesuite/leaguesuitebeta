import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderOpen, Trash2, Search, Calendar } from 'lucide-react';
import { League } from '@/ratings-engine/types/league';
import { getLeagues, createLeague, deleteLeague } from '@/ratings-engine/services/leagueStorage';
import { toast } from 'sonner';

export default function LeaguesPage() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>(() => getLeagues());
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; league?: League }>({ open: false });

  const filtered = search
    ? leagues.filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    : leagues;

  const handleCreate = () => {
    if (!newName.trim()) return;
    createLeague(newName.trim(), newDesc.trim() || undefined);
    setLeagues(getLeagues());
    setCreateOpen(false);
    setNewName('');
    setNewDesc('');
    toast.success('League created');
  };

  const confirmDelete = () => {
    if (deleteDialog.league) {
      deleteLeague(deleteDialog.league.id);
      setLeagues(getLeagues());
      toast.success('League deleted');
    }
    setDeleteDialog({ open: false });
  };

  return (
    <div className="-m-6 min-h-full">
      <header className="border-b bg-card/50">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">League Folders</h1>
              <p className="text-sm text-muted-foreground">Manage leagues and their rating runs</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New League
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leagues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* League Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">
                {search ? 'No matching leagues' : 'No leagues yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search' : 'Create your first league to get started'}
              </p>
            </div>
            {!search && (
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create League
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(league => (
              <Card
                key={league.id}
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => navigate(`/ratings/leagues/${league.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{league.name}</h3>
                        {league.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{league.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, league }); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <Badge variant="secondary">{league.runsCount} run{league.runsCount !== 1 ? 's' : ''}</Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(league.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create League</DialogTitle>
            <DialogDescription>Add a new league folder to organize rating runs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">League Name</label>
              <Input
                placeholder="e.g. AFFL National"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Brief description..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete League</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteDialog.league?.name}" and all its rating runs? This cannot be undone.
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
