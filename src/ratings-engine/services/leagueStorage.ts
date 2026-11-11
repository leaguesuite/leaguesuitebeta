import { League, LeagueRun } from '@/ratings-engine/types/league';

const LEAGUES_KEY = 'eagle_leagues';
const RUNS_KEY = 'eagle_league_runs';

function loadLeagues(): League[] {
  try {
    return JSON.parse(localStorage.getItem(LEAGUES_KEY) || '[]');
  } catch { return []; }
}

function saveLeagues(leagues: League[]) {
  localStorage.setItem(LEAGUES_KEY, JSON.stringify(leagues));
}

function loadRuns(): LeagueRun[] {
  try {
    return JSON.parse(localStorage.getItem(RUNS_KEY) || '[]');
  } catch { return []; }
}

function saveRuns(runs: LeagueRun[]) {
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
}

export function getLeagues(): League[] {
  const leagues = loadLeagues();
  const runs = loadRuns();
  return leagues.map(l => ({
    ...l,
    runsCount: runs.filter(r => r.leagueId === l.id).length,
  }));
}

export function getLeague(id: string): League | undefined {
  return getLeagues().find(l => l.id === id);
}

export function createLeague(name: string, description?: string): League {
  const leagues = loadLeagues();
  const league: League = {
    id: `league-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    runsCount: 0,
  };
  leagues.push(league);
  saveLeagues(leagues);
  return league;
}

export function updateLeague(id: string, updates: Partial<Pick<League, 'name' | 'description'>>) {
  const leagues = loadLeagues();
  const idx = leagues.findIndex(l => l.id === id);
  if (idx !== -1) {
    leagues[idx] = { ...leagues[idx], ...updates };
    saveLeagues(leagues);
  }
}

export function deleteLeague(id: string) {
  saveLeagues(loadLeagues().filter(l => l.id !== id));
  saveRuns(loadRuns().filter(r => r.leagueId !== id));
}

export function getLeagueRuns(leagueId: string): LeagueRun[] {
  return loadRuns()
    .filter(r => r.leagueId === leagueId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addLeagueRun(run: Omit<LeagueRun, 'id'>): LeagueRun {
  const runs = loadRuns();
  const newRun: LeagueRun = {
    ...run,
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  runs.push(newRun);
  saveRuns(runs);
  return newRun;
}

export function deleteLeagueRun(runId: string) {
  saveRuns(loadRuns().filter(r => r.id !== runId));
}
