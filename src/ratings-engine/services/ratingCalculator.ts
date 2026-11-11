import { 
  SeasonPlayer, 
  PlayerStats, 
  RatingRunConfig, 
  PlayerRatingResult,
  RatingCategory,
  StatConfig,
  RatingBreakdown,
} from '@/ratings-engine/types/ratings';

// Normalize stat value based on mode
function normalizeStatValue(
  value: number, 
  gamesPlayed: number, 
  touches: number, 
  mode: StatConfig['normalize_mode']
): number {
  switch (mode) {
    case 'per_game':
      return gamesPlayed > 0 ? value / gamesPlayed : 0;
    case 'per_touch':
      return touches > 0 ? value / touches : 0;
    case 'percentage':
      return value; // Assume already a percentage
    case 'raw':
    default:
      return value;
  }
}

// Calculate raw score for a category
function calculateCategoryScore(
  stats: PlayerStats,
  statConfigs: StatConfig[],
  category: RatingCategory
): { score: number; contributions: Record<string, number> } {
  const categoryStats = statConfigs.filter(s => s.category === category && s.enabled);
  
  const gamesPlayed = stats.games_played || 1;
  const touches = (stats.targets || 0) + (stats.receptions || 0) + (stats.rushes || 0);
  
  let score = 0;
  const contributions: Record<string, number> = {};

  for (const config of categoryStats) {
    const rawValue = (stats as unknown as Record<string, number>)[config.source_key ?? config.stat_key] || 0;
    const normalizedValue = normalizeStatValue(rawValue, gamesPlayed, touches, config.normalize_mode);
    const contribution = normalizedValue * config.weight;
    
    contributions[config.stat_key] = contribution;
    score += contribution;
  }

  return { score, contributions };
}

// Check eligibility for a category
function checkEligibility(
  stats: PlayerStats,
  config: RatingRunConfig,
  category: RatingCategory
): { eligible: boolean; reason?: string } {
  const threshold = config.eligibility_thresholds.find(t => t.category === category);
  if (!threshold) return { eligible: true };

  let statValue: number;
  
  if (threshold.stat_key === 'touches') {
    statValue = (stats.targets || 0) + (stats.rushes || 0);
  } else {
    statValue = (stats as unknown as Record<string, number>)[threshold.stat_key] || 0;
  }

  if (statValue < threshold.min_value) {
    return { 
      eligible: false, 
      reason: `Below ${threshold.stat_key} threshold (${statValue} < ${threshold.min_value})` 
    };
  }

  return { eligible: true };
}

// Scale score to rating range
function scaleToRating(
  score: number,
  minScore: number,
  maxScore: number,
  config: RatingRunConfig
): number {
  const { min_rating, max_rating, use_compression } = config.rating_scale;
  
  // Normalize to 0-1
  let normalized = maxScore !== minScore 
    ? (score - minScore) / (maxScore - minScore) 
    : 0.5;
  
  // Clamp
  normalized = Math.max(0, Math.min(1, normalized));

  // Apply compression curve if enabled
  if (use_compression) {
    // Sigmoid compression - pushes extremes toward center
    normalized = 1 / (1 + Math.exp(-6 * (normalized - 0.5)));
  }

  // Scale to rating range
  return min_rating + normalized * (max_rating - min_rating);
}

// Apply division multiplier
function applyDivisionMultiplier(
  rating: number,
  divisionId: string,
  config: RatingRunConfig
): number {
  const multiplier = config.division_multipliers.find(m => m.division_id === divisionId);
  return rating * (multiplier?.multiplier ?? 1.0);
}

// Apply carryover blending
function applyCarryover(
  currentRating: number,
  previousRating: number | undefined,
  config: RatingRunConfig
): number {
  if (previousRating === undefined) return currentRating;
  
  const { carryover_weight, current_weight } = config.carryover;
  return carryover_weight * previousRating + current_weight * currentRating;
}

// Apply drift cap
function applyDriftCap(
  newRating: number,
  previousRating: number | undefined,
  maxDrift: number | null
): number {
  if (previousRating === undefined || maxDrift === null || maxDrift <= 0) return newRating;
  
  const drift = newRating - previousRating;
  if (Math.abs(drift) > maxDrift) {
    return previousRating + Math.sign(drift) * maxDrift;
  }
  return newRating;
}

// Main calculation function
export function calculateRatings(
  seasonPlayers: SeasonPlayer[],
  playerStats: PlayerStats[],
  config: RatingRunConfig
): PlayerRatingResult[] {
  const results: PlayerRatingResult[] = [];
  
  // Calculate raw scores for all players first (for scaling)
  const allScores: Record<RatingCategory, number[]> = {
    offense: [],
    defense: [],
    qb: [],
  };

  const playerScores = new Map<string, {
    offense?: { score: number; contributions: Record<string, number> };
    defense?: { score: number; contributions: Record<string, number> };
    qb?: { score: number; contributions: Record<string, number> };
  }>();

  for (const sp of seasonPlayers) {
    const stats = playerStats.find(s => s.season_player_id === sp.id);
    if (!stats) continue;

    const scores: typeof playerScores extends Map<string, infer V> ? V : never = {};

    for (const category of ['offense', 'defense', 'qb'] as RatingCategory[]) {
      const eligibility = checkEligibility(stats, config, category);
      if (eligibility.eligible) {
        const result = calculateCategoryScore(stats, config.stat_configs, category);
        scores[category] = result;
        allScores[category].push(result.score);
      }
    }

    playerScores.set(sp.id, scores);
  }

  // Get min/max for scaling
  const scoreRanges: Record<RatingCategory, { min: number; max: number }> = {
    offense: { 
      min: Math.min(...(allScores.offense.length ? allScores.offense : [0])), 
      max: Math.max(...(allScores.offense.length ? allScores.offense : [1])) 
    },
    defense: { 
      min: Math.min(...(allScores.defense.length ? allScores.defense : [0])), 
      max: Math.max(...(allScores.defense.length ? allScores.defense : [1])) 
    },
    qb: { 
      min: Math.min(...(allScores.qb.length ? allScores.qb : [0])), 
      max: Math.max(...(allScores.qb.length ? allScores.qb : [1])) 
    },
  };

  // Calculate final ratings
  for (const sp of seasonPlayers) {
    const stats = playerStats.find(s => s.season_player_id === sp.id);
    const scores = playerScores.get(sp.id);
    
    if (!stats) {
      results.push({
        id: `result-${sp.id}`,
        run_id: '',
        season_player_id: sp.id,
        player_name: `${sp.player.first_name} ${sp.player.last_name}`,
        division_name: sp.division_name,
        team_name: sp.team_name,
        excluded: true,
        exclusion_reason: 'No stats found',
      });
      continue;
    }

    const result: PlayerRatingResult = {
      id: `result-${sp.id}`,
      run_id: '',
      season_player_id: sp.id,
      player_name: `${sp.player.first_name} ${sp.player.last_name}`,
      division_name: sp.division_name,
      team_name: sp.team_name,
      excluded: false,
    };

    let hasAnyRating = false;

    for (const category of ['offense', 'defense', 'qb'] as RatingCategory[]) {
      const eligibility = checkEligibility(stats, config, category);
      
      if (!eligibility.eligible) {
        continue;
      }

      const categoryScores = scores?.[category];
      if (!categoryScores) continue;

      const range = scoreRanges[category];
      let rating = scaleToRating(categoryScores.score, range.min, range.max, config);
      
      // Apply division multiplier
      rating = applyDivisionMultiplier(rating, sp.division_id, config);
      
      // Apply drift cap
      rating = applyDriftCap(rating, undefined, config.rating_scale.max_drift);
      
      // Round based on decimal places
      const multiplier = Math.pow(10, config.rating_scale.decimal_places);
      rating = Math.round(rating * multiplier) / multiplier;

      // Clamp to scale
      rating = Math.max(config.rating_scale.min_rating, Math.min(config.rating_scale.max_rating, rating));

      if (category === 'offense') result.offense_rating = rating;
      else if (category === 'defense') result.defense_rating = rating;
      else if (category === 'qb') result.qb_rating = rating;

      hasAnyRating = true;
    }

    if (!hasAnyRating) {
      result.excluded = true;
      result.exclusion_reason = 'Below all eligibility thresholds';
    }

    results.push(result);
  }

  return results;
}
