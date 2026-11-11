import type { PlayerRatingResult, RatingRun } from '@/ratings-engine/types/ratings';
import { mockSeasonPlayers } from '@/ratings-engine/data/mockData';

// Deterministic PRNG (mulberry32) so demo results are stable per run
const hashString = (s: string): number => {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Generates stable demo rating results for a run that has no stored results
 * (e.g. the seeded mock runs). Real runs use their stored results instead.
 */
export const generateDemoResults = (run: RatingRun): PlayerRatingResult[] => {
  const rand = mulberry32(hashString(run.id));
  const rating = (min: number, max: number) => Math.round(min + rand() * (max - min));

  return mockSeasonPlayers.map((sp) => {
    const excluded = rand() < 0.04;
    const isQb = rand() < 0.15;
    return {
      id: `demo-${run.id}-${sp.id}`,
      run_id: run.id,
      season_player_id: sp.id,
      player_name: `${sp.player.first_name} ${sp.player.last_name}`,
      division_name: sp.division_name,
      team_name: sp.team_name,
      offense_rating: excluded ? undefined : rating(42, 98),
      defense_rating: excluded ? undefined : rating(40, 96),
      qb_rating: excluded || !isQb ? undefined : rating(45, 99),
      excluded,
      exclusion_reason: excluded ? 'Below minimum games played' : undefined,
    };
  });
};
