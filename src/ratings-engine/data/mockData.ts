import type {
  Player,
  SeasonPlayer,
  PlayerStats,
  RatingRun,
  DivisionMultiplier,
  StatConfig,
  ConfigPreset,
  EligibilityThreshold,
  RatingScaleConfig,
  CarryoverConfig,
  VAAConfig,
  VARConfig,
  RatingCategory,
} from '@/ratings-engine/types/ratings';

// Helper to generate random stats
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mock Divisions
export const mockDivisions = [
  { id: 'div-1', name: 'Elite', tier: 1 },
  { id: 'div-2', name: 'Intermediate', tier: 2 },
  { id: 'div-3', name: 'Recreational', tier: 3 },
  { id: 'div-4', name: 'Pro', tier: 1 },
  { id: 'div-5', name: 'Semi-Pro', tier: 2 },
  { id: 'div-6', name: 'Youth', tier: 3 },
  { id: 'div-7', name: 'Beginner', tier: 4 },
];

// Mock Teams
export const mockTeams = [
  { id: 'team-1', name: 'Thunder', division_id: 'div-1' },
  { id: 'team-2', name: 'Lightning', division_id: 'div-1' },
  { id: 'team-3', name: 'Storm', division_id: 'div-2' },
  { id: 'team-4', name: 'Cyclone', division_id: 'div-2' },
  { id: 'team-5', name: 'Breeze', division_id: 'div-3' },
  { id: 'team-6', name: 'Zephyr', division_id: 'div-3' },
];

// Mock Seasons
export const mockSeasons = [
  { id: 'season-1', name: 'Fall 2025', active: false },
  { id: 'season-2', name: 'Spring 2026', active: true },
  { id: 'season-3', name: 'Winter 2026', active: false },
  { id: 'season-4', name: 'Spring 2025', active: false },
  { id: 'season-5', name: 'Winter 2025', active: false },
  { id: 'season-6', name: 'Summer 2025', active: false },
];

// Generate mock players
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Parker', 'Drew', 'Cameron', 'Jamie', 'Reese', 'Sage', 'Blake', 'Charlie', 'Dakota', 'Emerson', 'Finley', 'Harper'];
const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee'];

export const mockPlayers: Player[] = Array.from({ length: 120 }, (_, i) => ({
  id: `player-${i + 1}`,
  member_id: `MEM${String(i + 1).padStart(5, '0')}`,
  email: `${firstNames[i % 20].toLowerCase()}.${lastNames[i % 20].toLowerCase()}${i}@example.com`,
  first_name: firstNames[i % 20],
  last_name: lastNames[i % 20],
  date_of_birth: `${1985 + (i % 20)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  created_at: '2024-01-01T00:00:00Z',
}));

// Generate mock season players (assign players to teams for current season)
export const mockSeasonPlayers: SeasonPlayer[] = mockPlayers.map((player, i) => {
  const teamIndex = i % mockTeams.length;
  const team = mockTeams[teamIndex];
  const division = mockDivisions.find(d => d.id === team.division_id)!;
  
  return {
    id: `sp-${player.id}-season-2`,
    player_id: player.id,
    season_id: 'season-2',
    division_id: division.id,
    team_id: team.id,
    player,
    division_name: division.name,
    team_name: team.name,
  };
});

// Generate mock stats for each season player
export const mockPlayerStats: PlayerStats[] = mockSeasonPlayers.map((sp) => ({
  id: `stats-${sp.id}`,
  season_player_id: sp.id,
  games_played: randomInt(6, 12),
  // Offense
  receptions: randomInt(5, 60),
  receiving_yards: randomInt(50, 800),
  receiving_touchdowns: randomInt(0, 12),
  targets: randomInt(10, 80),
  rushes: randomInt(0, 30),
  rushing_yards: randomInt(0, 300),
  rushing_touchdowns: randomInt(0, 5),
  // Defense
  flags_pulled: randomInt(5, 50),
  interceptions: randomInt(0, 6),
  pass_deflections: randomInt(0, 15),
  sacks: randomInt(0, 8),
  defensive_touchdowns: randomInt(0, 3),
  // QB
  pass_attempts: randomInt(20, 300),
  pass_completions: randomInt(15, 200),
  passing_yards: randomInt(200, 3000),
  passing_touchdowns: randomInt(2, 30),
  interceptions_thrown: randomInt(0, 15),
}));

// Mock rating runs
export const mockRatingRuns: RatingRun[] = [
  {
    id: 'run-1',
    tenant_id: 'tenant-1',
    season_id: 'season-1',
    season_name: 'Fall 2025',
    version_label: 'Fall 2025 Final',
    status: 'committed',
    config: {} as RatingRun['config'],
    players_processed: 115,
    players_excluded: 5,
    created_by: 'admin@league.com',
    created_at: '2025-11-15T10:30:00Z',
    committed_at: '2025-11-15T11:00:00Z',
  },
  {
    id: 'run-2',
    tenant_id: 'tenant-1',
    season_id: 'season-2',
    season_name: 'Spring 2026',
    version_label: 'Spring 2026 v1',
    status: 'completed',
    config: {} as RatingRun['config'],
    players_processed: 118,
    players_excluded: 2,
    created_by: 'admin@league.com',
    created_at: '2026-01-02T14:00:00Z',
  },
  {
    id: 'run-3',
    tenant_id: 'tenant-1',
    season_id: 'season-2',
    season_name: 'Spring 2026',
    version_label: 'Spring 2026 Draft',
    status: 'draft',
    config: {} as RatingRun['config'],
    players_processed: 0,
    players_excluded: 0,
    created_by: 'admin@league.com',
    created_at: '2026-01-04T09:00:00Z',
  },
];

// Default division multipliers
export const defaultDivisionMultipliers: DivisionMultiplier[] = [
  { division_id: 'div-1', division_name: 'Elite', multiplier: 1.15 },
  { division_id: 'div-2', division_name: 'Intermediate', multiplier: 1.05 },
  { division_id: 'div-3', division_name: 'Recreational', multiplier: 0.95 },
];

// Default stat configurations
export const defaultStatConfigs: StatConfig[] = [
  // Offense stats
  { stat_key: 'receptions', enabled: true, weight: 1.5, normalize_mode: 'per_game', category: 'offense', display_name: 'Receptions' },
  { stat_key: 'receiving_yards', enabled: true, weight: 0.1, normalize_mode: 'per_game', category: 'offense', display_name: 'Receiving Yards' },
  { stat_key: 'receiving_touchdowns', enabled: true, weight: 6.0, normalize_mode: 'raw', category: 'offense', display_name: 'Receiving TDs' },
  { stat_key: 'targets', enabled: true, weight: 0.5, normalize_mode: 'per_game', category: 'offense', display_name: 'Targets' },
  { stat_key: 'rushes', enabled: true, weight: 0.5, normalize_mode: 'per_game', category: 'offense', display_name: 'Rushes' },
  { stat_key: 'rushing_yards', enabled: true, weight: 0.1, normalize_mode: 'per_game', category: 'offense', display_name: 'Rushing Yards' },
  { stat_key: 'rushing_touchdowns', enabled: true, weight: 6.0, normalize_mode: 'raw', category: 'offense', display_name: 'Rushing TDs' },
  // Defense stats
  { stat_key: 'flags_pulled', enabled: true, weight: 2.0, normalize_mode: 'per_game', category: 'defense', display_name: 'Flags Pulled' },
  { stat_key: 'interceptions', enabled: true, weight: 8.0, normalize_mode: 'raw', category: 'defense', display_name: 'Interceptions' },
  { stat_key: 'pass_deflections', enabled: true, weight: 3.0, normalize_mode: 'raw', category: 'defense', display_name: 'Pass Deflections' },
  { stat_key: 'sacks', enabled: true, weight: 5.0, normalize_mode: 'raw', category: 'defense', display_name: 'Sacks' },
  { stat_key: 'defensive_touchdowns', enabled: true, weight: 10.0, normalize_mode: 'raw', category: 'defense', display_name: 'Defensive TDs' },
  // QB stats
  { stat_key: 'pass_completions', enabled: true, weight: 0.5, normalize_mode: 'per_game', category: 'qb', display_name: 'Completions' },
  { stat_key: 'passing_yards', enabled: true, weight: 0.04, normalize_mode: 'per_game', category: 'qb', display_name: 'Passing Yards' },
  { stat_key: 'passing_touchdowns', enabled: true, weight: 4.0, normalize_mode: 'raw', category: 'qb', display_name: 'Passing TDs' },
  { stat_key: 'interceptions_thrown', enabled: true, weight: -3.0, normalize_mode: 'raw', category: 'qb', display_name: 'INTs Thrown' },
];

// Default eligibility thresholds
export const defaultEligibilityThresholds: EligibilityThreshold[] = [
  { category: 'offense', min_value: 10, stat_key: 'targets', below_behavior: 'division_average' },
  { category: 'defense', min_value: 4, stat_key: 'games_played', below_behavior: 'keep_last' },
  { category: 'qb', min_value: 20, stat_key: 'pass_attempts', below_behavior: 'no_rating' },
];

// Default rating scale
export const defaultRatingScale: RatingScaleConfig = {
  min_rating: 40,
  max_rating: 100,
  decimal_places: 0,
  use_compression: false,
  max_drift: 10,
};

// Default carryover config
export const defaultCarryoverConfig: CarryoverConfig = {
  carryover_weight: 0.3,
  current_weight: 0.7,
  weight_recent_games: false,
};

// Default VAA config
export const defaultVAAConfig: Record<RatingCategory, VAAConfig> = {
  offense: { enabled: true, baseline: 'division_average' },
  defense: { enabled: true, baseline: 'division_average' },
  qb: { enabled: true, baseline: 'division_average' },
};

// Default VAR config
export const defaultVARConfig: Record<RatingCategory, VARConfig> = {
  offense: { enabled: true, method: 'bottom_n_percent', threshold_value: 10, playing_time_factor: 'games_played' },
  defense: { enabled: true, method: 'bottom_n_percent', threshold_value: 10, playing_time_factor: 'games_played' },
  qb: { enabled: true, method: 'bottom_n_percent', threshold_value: 10, playing_time_factor: 'games_played' },
};

// Config presets
export const configPresets: ConfigPreset[] = [
  {
    id: 'preset-balanced',
    name: 'Balanced',
    description: 'Equal emphasis on all categories',
    config: {
      stat_configs: defaultStatConfigs,
      division_multipliers: defaultDivisionMultipliers,
      rating_scale: defaultRatingScale,
      carryover: defaultCarryoverConfig,
    },
  },
  {
    id: 'preset-offense-heavy',
    name: 'Offense Heavy',
    description: 'Higher weights for offensive stats',
    config: {
      stat_configs: defaultStatConfigs.map(s => 
        s.category === 'offense' ? { ...s, weight: s.weight * 1.5 } : s
      ),
      division_multipliers: defaultDivisionMultipliers,
      rating_scale: defaultRatingScale,
      carryover: defaultCarryoverConfig,
    },
  },
  {
    id: 'preset-defense-heavy',
    name: 'Defense Heavy',
    description: 'Higher weights for defensive stats',
    config: {
      stat_configs: defaultStatConfigs.map(s => 
        s.category === 'defense' ? { ...s, weight: s.weight * 1.5 } : s
      ),
      division_multipliers: defaultDivisionMultipliers,
      rating_scale: defaultRatingScale,
      carryover: defaultCarryoverConfig,
    },
  },
];
