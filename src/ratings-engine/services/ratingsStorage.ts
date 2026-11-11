import type { RatingRun, PlayerRatingResult, RatingRunConfig } from '@/ratings-engine/types/ratings';
import { mockRatingRuns } from '@/ratings-engine/data/mockData';

const STORAGE_KEYS = {
  RATING_RUNS: 'ratings_engine_runs',
  RATING_RESULTS: 'ratings_engine_results',
};

// Initialize with mock data if empty
const initializeStorage = () => {
  const existingRuns = localStorage.getItem(STORAGE_KEYS.RATING_RUNS);
  if (!existingRuns) {
    localStorage.setItem(STORAGE_KEYS.RATING_RUNS, JSON.stringify(mockRatingRuns));
  }
};

// Rating Runs
export const getRatingRuns = (): RatingRun[] => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.RATING_RUNS);
  return data ? JSON.parse(data) : [];
};

export const getRatingRun = (id: string): RatingRun | undefined => {
  const runs = getRatingRuns();
  return runs.find(r => r.id === id);
};

export const createRatingRun = (run: Omit<RatingRun, 'id' | 'created_at'>): RatingRun => {
  const runs = getRatingRuns();
  const newRun: RatingRun = {
    ...run,
    id: `run-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  runs.push(newRun);
  localStorage.setItem(STORAGE_KEYS.RATING_RUNS, JSON.stringify(runs));
  return newRun;
};

export const updateRatingRun = (id: string, updates: Partial<RatingRun>): RatingRun | undefined => {
  const runs = getRatingRuns();
  const index = runs.findIndex(r => r.id === id);
  if (index === -1) return undefined;
  
  runs[index] = { ...runs[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.RATING_RUNS, JSON.stringify(runs));
  return runs[index];
};

export const deleteRatingRun = (id: string): boolean => {
  const runs = getRatingRuns();
  const filtered = runs.filter(r => r.id !== id);
  if (filtered.length === runs.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.RATING_RUNS, JSON.stringify(filtered));
  // Also delete associated results
  deleteResultsForRun(id);
  return true;
};

// Rating Results
export const getResultsForRun = (runId: string): PlayerRatingResult[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RATING_RESULTS);
  const allResults: Record<string, PlayerRatingResult[]> = data ? JSON.parse(data) : {};
  return allResults[runId] || [];
};

export const saveResultsForRun = (runId: string, results: PlayerRatingResult[]): void => {
  const data = localStorage.getItem(STORAGE_KEYS.RATING_RESULTS);
  const allResults: Record<string, PlayerRatingResult[]> = data ? JSON.parse(data) : {};
  allResults[runId] = results;
  localStorage.setItem(STORAGE_KEYS.RATING_RESULTS, JSON.stringify(allResults));
};

export const deleteResultsForRun = (runId: string): void => {
  const data = localStorage.getItem(STORAGE_KEYS.RATING_RESULTS);
  const allResults: Record<string, PlayerRatingResult[]> = data ? JSON.parse(data) : {};
  delete allResults[runId];
  localStorage.setItem(STORAGE_KEYS.RATING_RESULTS, JSON.stringify(allResults));
};

// Commit a rating run
export const commitRatingRun = (id: string): RatingRun | undefined => {
  return updateRatingRun(id, {
    status: 'committed',
    committed_at: new Date().toISOString(),
  });
};

// Rollback a rating run
export const rollbackRatingRun = (id: string): RatingRun | undefined => {
  return updateRatingRun(id, {
    status: 'rolled_back',
  });
};

// Export results to CSV
export const exportResultsToCSV = (results: PlayerRatingResult[], includeBreakdowns: boolean = false): string => {
  const headers = [
    'Player Name',
    'Division',
    'Team',
    'Offense Rating',
    'Defense Rating',
    'QB Rating',
    'Offense VAA',
    'Defense VAA',
    'QB VAA',
    'Offense WAR',
    'Defense WAR',
    'QB WAR',
    'Excluded',
    'Exclusion Reason',
  ];

  const rows = results.map(r => [
    r.player_name,
    r.division_name,
    r.team_name,
    r.offense_rating ?? '',
    r.defense_rating ?? '',
    r.qb_rating ?? '',
    r.offense_vaa ?? '',
    r.defense_vaa ?? '',
    r.qb_vaa ?? '',
    r.offense_war ?? '',
    r.defense_war ?? '',
    r.qb_war ?? '',
    r.excluded ? 'Yes' : 'No',
    r.exclusion_reason ?? '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
