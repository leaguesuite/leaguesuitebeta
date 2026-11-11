export interface League {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  runsCount: number;
}

export interface LeagueRun {
  id: string;
  leagueId: string;
  ratingType: 'standard' | 'eagle';
  label: string;
  status: 'draft' | 'completed' | 'committed';
  playersProcessed: number;
  playersExcluded: number;
  createdAt: string;
  committedAt?: string;
}
