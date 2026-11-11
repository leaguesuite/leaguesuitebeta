import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingRun } from '@/ratings-engine/types/ratings';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  RotateCcw, 
  Trash2, 
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RatingRunsTableProps {
  runs: RatingRun[];
  onView: (run: RatingRun) => void;
  onExport: (run: RatingRun) => void;
  onRollback: (run: RatingRun) => void;
  onDelete: (run: RatingRun) => void;
}

type SortField = 'version_label' | 'season_name' | 'status' | 'players_processed' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function RatingRunsTable({ runs, onView, onExport, onRollback, onDelete }: RatingRunsTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const filteredAndSortedRuns = useMemo(() => {
    let result = [...runs];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(run => 
        run.version_label.toLowerCase().includes(searchLower) ||
        run.season_name.toLowerCase().includes(searchLower) ||
        run.created_by.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(run => run.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'version_label':
          comparison = a.version_label.localeCompare(b.version_label);
          break;
        case 'season_name':
          comparison = a.season_name.localeCompare(b.season_name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'players_processed':
          comparison = a.players_processed - b.players_processed;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [runs, search, statusFilter, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search runs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="committed">Committed</SelectItem>
            <SelectItem value="rolled_back">Rolled Back</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('version_label')}
              >
                <div className="flex items-center gap-2">
                  Version
                  <SortIcon field="version_label" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('season_name')}
              >
                <div className="flex items-center gap-2">
                  Season
                  <SortIcon field="season_name" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('players_processed')}
              >
                <div className="flex items-center justify-end gap-2">
                  Players
                  <SortIcon field="players_processed" />
                </div>
              </TableHead>
              <TableHead>Excluded</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  Created
                  <SortIcon field="created_at" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRuns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No rating runs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedRuns.map((run) => (
                <TableRow 
                  key={run.id}
                  className="cursor-pointer"
                  onClick={() => run.status === 'draft' 
                    ? navigate(`/ratings/wizard/${run.id}`) 
                    : onView(run)
                  }
                >
                  <TableCell className="font-medium">{run.version_label}</TableCell>
                  <TableCell>{run.season_name}</TableCell>
                  <TableCell>
                    <StatusBadge status={run.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {run.players_processed.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {run.players_excluded}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {run.created_by}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(run.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(run); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {(run.status === 'completed' || run.status === 'committed') && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExport(run); }}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                          </DropdownMenuItem>
                        )}
                        {run.status === 'committed' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRollback(run); }}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Rollback
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); onDelete(run); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
