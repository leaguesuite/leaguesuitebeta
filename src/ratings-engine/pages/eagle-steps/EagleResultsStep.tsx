import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, Calculator, Search, CheckCircle2, XCircle,
  ArrowUpDown, ArrowUp, ArrowDown, Pencil, Check, X, FileDown, Users, Star
} from 'lucide-react';
import { EagleRatingsConfig, EaglePlayerResult } from '@/ratings-engine/types/eagleRatings';
import { calculateEagleRatings } from '@/ratings-engine/services/eagleRatingCalculator';

interface EagleResultsStepProps {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

type SortField = 'playerName' | 'division' | 'rating' | 'previousRating' | 'delta' | 'gamesPlayed';
type SortDir = 'asc' | 'desc';

interface MultiDivGroup {
  playerId: string;
  playerName: string;
  entries: EaglePlayerResult[];
  bestRating: number;
  bestDivision: string;
}

export function EagleResultsStep({ config }: EagleResultsStepProps) {
  const [results, setResults] = useState<EaglePlayerResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [sortField, setSortField] = useState<SortField>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const hasStats = (config.currentSeasonStats?.length ?? 0) > 0;
  const hasCarryover = (config.carryoverData?.length ?? 0) > 0;

  const handleCalculate = async () => {
    setIsCalculating(true);
    setProgress(0);
    setIsConfirmed(false);
    await new Promise<void>(resolve => {
      setTimeout(() => {
        const calculated = calculateEagleRatings(config, setProgress);
        setResults(calculated);
        setIsCalculating(false);
        setHasCalculated(true);
        resolve();
      }, 100);
    });
  };

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'playerName' ? 'asc' : 'desc');
    }
  }, [sortField]);

  const rated = useMemo(() => results.filter(r => !r.excluded), [results]);
  const excluded = useMemo(() => results.filter(r => r.excluded), [results]);
  const overrideCount = useMemo(() => rated.filter(r => r.overrideRating !== undefined).length, [rated]);

  // Multi-division groups
  const multiDivGroups = useMemo((): MultiDivGroup[] => {
    const multiEntries = rated.filter(r => r.isMultiDivision);
    const grouped = new Map<string, EaglePlayerResult[]>();
    multiEntries.forEach(r => {
      if (!grouped.has(r.playerId)) grouped.set(r.playerId, []);
      grouped.get(r.playerId)!.push(r);
    });
    const groups: MultiDivGroup[] = [];
    grouped.forEach((entries, playerId) => {
      const best = entries.reduce((a, b) => ((a.overrideRating ?? a.rating) >= (b.overrideRating ?? b.rating) ? a : b));
      groups.push({
        playerId,
        playerName: entries[0].playerName,
        entries: entries.sort((a, b) => (b.overrideRating ?? b.rating) - (a.overrideRating ?? a.rating)),
        bestRating: best.overrideRating ?? best.rating,
        bestDivision: best.division,
      });
    });
    return groups.sort((a, b) => b.bestRating - a.bestRating);
  }, [rated]);

  const sortedRated = useMemo(() => {
    const sorted = [...rated].sort((a, b) => {
      const aVal = sortField === 'rating' ? (a.overrideRating ?? a.rating) : a[sortField];
      const bVal = sortField === 'rating' ? (b.overrideRating ?? b.rating) : b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [rated, sortField, sortDir]);

  const filteredRated = useMemo(() => {
    if (!search) return sortedRated;
    const q = search.toLowerCase();
    return sortedRated.filter(r =>
      r.playerName.toLowerCase().includes(q) ||
      r.division.toLowerCase().includes(q) ||
      r.team.toLowerCase().includes(q)
    );
  }, [sortedRated, search]);

  const filteredExcluded = useMemo(() => {
    if (!search) return excluded;
    const q = search.toLowerCase();
    return excluded.filter(r =>
      r.playerName.toLowerCase().includes(q) ||
      r.division.toLowerCase().includes(q) ||
      r.team.toLowerCase().includes(q)
    );
  }, [excluded, search]);

  const filteredMultiDiv = useMemo(() => {
    if (!search) return multiDivGroups;
    const q = search.toLowerCase();
    return multiDivGroups.filter(g =>
      g.playerName.toLowerCase().includes(q) ||
      g.entries.some(e => e.division.toLowerCase().includes(q))
    );
  }, [multiDivGroups, search]);

  const getFinalRating = (r: EaglePlayerResult) => r.overrideRating ?? r.rating;

  const startEdit = (globalIdx: number, currentRating: number) => {
    setEditingIndex(globalIdx);
    setEditValue(currentRating.toString());
  };

  const confirmEdit = (playerName: string, division: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      setResults(prev => prev.map(r =>
        r.playerName === playerName && r.division === division && !r.excluded
          ? { ...r, overrideRating: val === r.rating ? undefined : val }
          : r
      ));
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const handleExport = () => {
    // Export only the "used" rating for multi-division players, plus all single-division players
    const exportRows = rated.filter(r => !r.isMultiDivision || r.isUsedRating);
    const headers = ['Player ID', 'Player Name', 'Division', 'Team', 'Final Rating', 'Previous Rating', 'Delta', 'Multi-Division', 'Override', 'Games Played'];
    const rows = exportRows.map(r => [
      r.playerId, r.playerName, r.division, r.team,
      getFinalRating(r).toString(),
      r.previousRating?.toString() ?? '',
      r.delta?.toString() ?? '',
      r.isMultiDivision ? 'Yes' : '',
      r.overrideRating !== undefined ? 'Yes' : '',
      r.gamesPlayed.toString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eagle-ratings-${config.ratingType}-confirmed-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const SortableHead = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center">{children}<SortIcon field={field} /></span>
    </TableHead>
  );

  if (!hasStats) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">No Data Uploaded</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please go back and upload current season stats to calculate ratings.
            {!hasCarryover && ' Carryover ratings are also missing — ratings will be based on current season only.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hasCalculated ? (
        <div className="text-center py-8 space-y-6">
          {!hasCarryover && (
            <div className="bg-muted/50 border rounded-lg p-4 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              No carryover data uploaded. Ratings will be based on current season stats only.
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ready to process <strong>{config.currentSeasonStats?.length}</strong> player records
              {hasCarryover && ` with ${config.carryoverData?.length} carryover records`}
            </p>
          </div>
          {isCalculating ? (
            <div className="max-w-md mx-auto space-y-3">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">Calculating ratings... {progress}%</p>
            </div>
          ) : (
            <Button size="lg" onClick={handleCalculate}>
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Ratings
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{rated.length}</div>
              <div className="text-xs text-muted-foreground">Rated</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-destructive">{excluded.length}</div>
              <div className="text-xs text-muted-foreground">Excluded</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{multiDivGroups.length}</div>
              <div className="text-xs text-muted-foreground">Multi-Div</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-accent-foreground">{overrideCount}</div>
              <div className="text-xs text-muted-foreground">Overrides</div>
            </div>
          </div>

          {/* Search + Actions */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {!isConfirmed ? (
              <Button onClick={() => setIsConfirmed(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Ratings
              </Button>
            ) : (
              <Button onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export Final Ratings
              </Button>
            )}
          </div>

          {isConfirmed && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Ratings confirmed.</span>
                <span className="text-muted-foreground">Export uses the highest rating for multi-division players.</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsConfirmed(false)}>Undo</Button>
            </div>
          )}

          {/* Results Tabs */}
          <Tabs defaultValue="rated">
            <TabsList>
              <TabsTrigger value="rated" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Rated ({rated.length})
              </TabsTrigger>
              {multiDivGroups.length > 0 && (
                <TabsTrigger value="multi" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Multi-Division ({multiDivGroups.length})
                </TabsTrigger>
              )}
              <TabsTrigger value="excluded" className="gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Excluded ({excluded.length})
              </TabsTrigger>
            </TabsList>

            {/* Rated Tab */}
            <TabsContent value="rated">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <SortableHead field="playerName">Player</SortableHead>
                      <SortableHead field="division">Division</SortableHead>
                      <TableHead>Team</TableHead>
                      <SortableHead field="rating" className="text-right">New Rating</SortableHead>
                      <SortableHead field="previousRating" className="text-right">Prev</SortableHead>
                      <SortableHead field="delta" className="text-right">Delta</SortableHead>
                      <SortableHead field="gamesPlayed" className="text-right">GP</SortableHead>
                      {!isConfirmed && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isConfirmed ? 8 : 9} className="text-center text-muted-foreground py-8">
                          {search ? 'No matching players' : 'No rated players'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRated.map((r, i) => {
                        const globalIdx = results.indexOf(r);
                        const isEditing = editingIndex === globalIdx;
                        const finalRating = getFinalRating(r);
                        const hasOverride = r.overrideRating !== undefined;

                        return (
                          <TableRow key={`${r.playerId}-${r.division}-${i}`} className={hasOverride ? 'bg-accent/30' : ''}>
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">
                              {r.playerName}
                              {r.isMultiDivision && (
                                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                                  Multi
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell><Badge variant="outline">{r.division}</Badge></TableCell>
                            <TableCell>{r.team}</TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    className="w-20 h-7 text-right text-sm"
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') confirmEdit(r.playerName, r.division);
                                      if (e.key === 'Escape') cancelEdit();
                                    }}
                                    autoFocus
                                  />
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => confirmEdit(r.playerName, r.division)}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span className={`font-bold ${hasOverride ? 'text-primary' : ''}`}>
                                  {finalRating}
                                  {hasOverride && (
                                    <span className="text-xs text-muted-foreground ml-1">(was {r.rating})</span>
                                  )}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{r.previousRating ?? '—'}</TableCell>
                            <TableCell className="text-right">
                              {r.delta != null ? (
                                <span className={
                                  r.delta > 0 ? 'text-primary font-medium' :
                                  r.delta < 0 ? 'text-destructive font-medium' :
                                  'text-muted-foreground'
                                }>
                                  {r.delta > 0 ? '+' : ''}{r.delta}
                                </span>
                              ) : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{r.gamesPlayed}</TableCell>
                            {!isConfirmed && (
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(globalIdx, finalRating)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Multi-Division Tab */}
            <TabsContent value="multi">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Players with entries in multiple divisions. The <Star className="h-3 w-3 inline text-primary" /> marks the highest rating that will be used.
                </p>
                {filteredMultiDiv.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 border rounded-lg">
                    {search ? 'No matching multi-division players' : 'No multi-division players found'}
                  </div>
                ) : (
                  filteredMultiDiv.map(group => (
                    <div key={group.playerId} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{group.playerName}</span>
                          <span className="text-xs text-muted-foreground">ID: {group.playerId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Used rating:</span>
                          <span className="font-bold text-primary">{group.bestRating}</span>
                          <Badge variant="outline" className="text-xs">{group.bestDivision}</Badge>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-8" />
                            <TableHead>Division</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead className="text-right">Rating</TableHead>
                            <TableHead className="text-right">GP</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.entries.map((entry, idx) => {
                            const finalR = getFinalRating(entry);
                            const isBest = entry.isUsedRating;
                            return (
                              <TableRow key={`${entry.division}-${idx}`} className={isBest ? 'bg-primary/5' : ''}>
                                <TableCell>
                                  {isBest && <Star className="h-4 w-4 text-primary fill-primary" />}
                                </TableCell>
                                <TableCell><Badge variant={isBest ? 'default' : 'outline'}>{entry.division}</Badge></TableCell>
                                <TableCell>{entry.team}</TableCell>
                                <TableCell className={`text-right font-bold ${isBest ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {finalR}
                                  {entry.overrideRating !== undefined && (
                                    <span className="text-xs text-muted-foreground ml-1">(was {entry.rating})</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{entry.gamesPlayed}</TableCell>
                                <TableCell className="text-right">
                                  {isBest ? (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Used</Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Lower</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Excluded Tab */}
            <TabsContent value="excluded">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExcluded.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {search ? 'No matching players' : 'No excluded players'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExcluded.map((r, i) => (
                        <TableRow key={`${r.playerId}-${r.division}-${i}`}>
                          <TableCell className="font-medium">{r.playerName}</TableCell>
                          <TableCell><Badge variant="outline">{r.division}</Badge></TableCell>
                          <TableCell>{r.team}</TableCell>
                          <TableCell className="text-sm text-destructive">{r.exclusionReason}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
