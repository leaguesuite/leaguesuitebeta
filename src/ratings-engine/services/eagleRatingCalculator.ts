import { EagleRatingsConfig, EaglePlayerResult } from '@/ratings-engine/types/eagleRatings';

interface PlayerRecord {
  id: string;
  name: string;
  division: string;
  team: string;
  gamesPlayed: number;
  attempts: number;
  offensiveStats: number;
  defensiveStats: number;
  currentSeasonScore: number;
}

function findColumn(headers: string[], candidates: string[]): string | null {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parsePlayersFromStats(data: Record<string, unknown>[]): PlayerRecord[] {
  if (!data.length) return [];
  const headers = Object.keys(data[0]);
  const idCol = findColumn(headers, ['id', 'player_id', 'playerid', 'member_id', 'memberid']);
  const nameCol = findColumn(headers, ['name', 'player', 'player_name', 'playername', 'full_name']);
  const divCol = findColumn(headers, ['division', 'div', 'division_name']);
  const teamCol = findColumn(headers, ['team', 'team_name', 'club']);
  const gamesCol = findColumn(headers, ['games', 'games_played', 'gp', 'g']);
  const attCol = findColumn(headers, ['attempts', 'att', 'touches']);
  const offCol = findColumn(headers, ['offensive', 'off_stats', 'offense', 'off']);
  const defCol = findColumn(headers, ['defensive', 'def_stats', 'defense', 'def']);
  const scoreCol = findColumn(headers, ['score', 'rating', 'total', 'points', 'performance']);

  return data.map((row, idx) => ({
    id: String(row[idCol || ''] || `player-${idx}`),
    name: String(row[nameCol || ''] || 'Unknown'),
    division: String(row[divCol || ''] || 'Unknown'),
    team: String(row[teamCol || ''] || 'Unknown'),
    gamesPlayed: Number(row[gamesCol || ''] || 0),
    attempts: Number(row[attCol || ''] || 0),
    offensiveStats: Number(row[offCol || ''] || 0),
    defensiveStats: Number(row[defCol || ''] || 0),
    currentSeasonScore: Number(row[scoreCol || ''] || 0),
  }));
}

function getCarryoverRating(
  playerName: string,
  carryoverData: Record<string, unknown>[],
  seasonWeights: { weight: number }[]
): number | undefined {
  if (!carryoverData?.length) return undefined;
  const headers = Object.keys(carryoverData[0]);
  const nameCol = findColumn(headers, ['name', 'player', 'player_name', 'playername']);
  if (!nameCol) return undefined;
  const match = carryoverData.find(
    r => String(r[nameCol]).toLowerCase().trim() === playerName.toLowerCase().trim()
  );
  if (!match) return undefined;
  const ratingCols = headers.filter(h =>
    h.toLowerCase().includes('rating') && h.toLowerCase() !== 'rating_type'
  );
  if (!ratingCols.length) return undefined;
  let weightedSum = 0;
  let totalWeight = 0;
  ratingCols.forEach((col, i) => {
    const val = Number(match[col] || 0);
    if (val > 0) {
      const w = seasonWeights[i]?.weight ?? 1;
      weightedSum += val * w;
      totalWeight += w;
    }
  });
  return totalWeight > 0 ? weightedSum / totalWeight : undefined;
}

function getPreviousRating(
  playerName: string,
  carryoverData: Record<string, unknown>[]
): number | undefined {
  if (!carryoverData?.length) return undefined;
  const headers = Object.keys(carryoverData[0]);
  const nameCol = findColumn(headers, ['name', 'player', 'player_name', 'playername']);
  if (!nameCol) return undefined;
  const match = carryoverData.find(
    r => String(r[nameCol]).toLowerCase().trim() === playerName.toLowerCase().trim()
  );
  if (!match) return undefined;
  const ratingCols = headers.filter(h =>
    h.toLowerCase().includes('rating') && h.toLowerCase() !== 'rating_type'
  );
  if (!ratingCols.length) return undefined;
  const val = Number(match[ratingCols[0]] || 0);
  return val > 0 ? val : undefined;
}

function resolvedDivision(csvDiv: string, config: EagleRatingsConfig): string {
  const mapping = config.divisionMappings?.find(m => m.csvDivision === csvDiv);
  if (mapping?.mappedDivisionId) {
    const div = config.divisions.find(d => d.id === mapping.mappedDivisionId);
    return div?.name || csvDiv;
  }
  return csvDiv;
}

function getDivisionRange(divisionName: string, config: EagleRatingsConfig) {
  if (config.useWeightedDivisions) {
    const div = config.divisions.find(d => d.name === divisionName);
    if (div) return div.ratingRange;
  }
  return config.globalRatingRange;
}

function clampRating(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)) * 10) / 10;
}

export function calculateEagleRatings(
  config: EagleRatingsConfig,
  onProgress?: (pct: number) => void
): EaglePlayerResult[] {
  const stats = config.currentSeasonStats || [];
  const players = parsePlayersFromStats(stats);
  const results: EaglePlayerResult[] = [];

  // Detect which player IDs appear in multiple divisions
  const divisionsByPlayer = new Map<string, Set<string>>();
  players.forEach(p => {
    const key = p.id;
    if (!divisionsByPlayer.has(key)) divisionsByPlayer.set(key, new Set());
    divisionsByPlayer.get(key)!.add(p.division);
  });
  const multiDivPlayerIds = new Set<string>();
  divisionsByPlayer.forEach((divs, id) => { if (divs.size > 1) multiDivPlayerIds.add(id); });

  players.forEach((player, i) => {
    if (onProgress && i % 50 === 0) {
      onProgress(Math.round((i / players.length) * 100));
    }

    const division = resolvedDivision(player.division, config);
    const range = getDivisionRange(division, config);
    const isMultiDiv = multiDivPlayerIds.has(player.id);

    // Eligibility checks
    if (player.gamesPlayed < config.minGamesPlayed) {
      results.push({
        playerId: player.id, playerName: player.name, division, team: player.team,
        rating: 0, excluded: true,
        exclusionReason: `Below minimum games (${player.gamesPlayed}/${config.minGamesPlayed})`,
        gamesPlayed: player.gamesPlayed, isMultiDivision: isMultiDiv, isUsedRating: false,
      });
      return;
    }

    if (config.ratingType === 'quarterback' && player.attempts < config.minAttempts) {
      results.push({
        playerId: player.id, playerName: player.name, division, team: player.team,
        rating: 0, excluded: true,
        exclusionReason: `Below minimum attempts (${player.attempts}/${config.minAttempts})`,
        gamesPlayed: player.gamesPlayed, isMultiDivision: isMultiDiv, isUsedRating: false,
      });
      return;
    }

    if (config.ratingType === 'offensive' && player.offensiveStats < config.minOffensiveStats) {
      results.push({
        playerId: player.id, playerName: player.name, division, team: player.team,
        rating: 0, excluded: true,
        exclusionReason: `Below minimum offensive stats (${player.offensiveStats}/${config.minOffensiveStats})`,
        gamesPlayed: player.gamesPlayed, isMultiDivision: isMultiDiv, isUsedRating: false,
      });
      return;
    }

    if (config.ratingType === 'defensive' && player.defensiveStats < config.minDefensiveStats) {
      results.push({
        playerId: player.id, playerName: player.name, division, team: player.team,
        rating: 0, excluded: true,
        exclusionReason: `Below minimum defensive stats (${player.defensiveStats}/${config.minDefensiveStats})`,
        gamesPlayed: player.gamesPlayed, isMultiDivision: isMultiDiv, isUsedRating: false,
      });
      return;
    }

    const carryover = getCarryoverRating(player.name, config.carryoverData || [], config.pastSeasonWeights);
    const previousRating = getPreviousRating(player.name, config.carryoverData || []);

    let rating: number;
    if (carryover !== undefined) {
      const totalCarryWeight = config.pastSeasonWeights.reduce((s, w) => s + w.weight, 0);
      const carryFactor = Math.min(totalCarryWeight / 100, 0.5);
      rating = player.currentSeasonScore * (1 - carryFactor) + carryover * carryFactor;
    } else {
      rating = player.currentSeasonScore;
    }

    rating = clampRating(rating, range.min, range.max);
    const delta = previousRating !== undefined ? Math.round((rating - previousRating) * 10) / 10 : undefined;

    results.push({
      playerId: player.id, playerName: player.name, division, team: player.team,
      rating, previousRating, delta, excluded: false,
      gamesPlayed: player.gamesPlayed, carryoverRating: carryover, currentSeasonScore: player.currentSeasonScore,
      isMultiDivision: isMultiDiv, isUsedRating: true, // default true, will fix below
    });
  });

  if (onProgress) onProgress(100);

  // Post-process: for multi-division players, only the highest-rated entry is "used"
  const ratedByPlayer = new Map<string, EaglePlayerResult[]>();
  results.forEach(r => {
    if (!r.excluded && r.isMultiDivision) {
      if (!ratedByPlayer.has(r.playerId)) ratedByPlayer.set(r.playerId, []);
      ratedByPlayer.get(r.playerId)!.push(r);
    }
  });
  ratedByPlayer.forEach(entries => {
    // Mark all as not-used first, then mark only the highest
    entries.forEach(e => e.isUsedRating = false);
    const best = entries.reduce((a, b) => (a.rating >= b.rating ? a : b));
    best.isUsedRating = true;
  });

  return results.sort((a, b) => {
    if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
    return b.rating - a.rating;
  });
}
