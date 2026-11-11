// Core Types for Player Ratings Engine

export type RatingRunStatus = 'draft' | 'running' | 'completed' | 'committed' | 'rolled_back';
export type RatingCategory = 'offense' | 'defense' | 'qb';
export type NormalizeMode = 'raw' | 'per_game' | 'per_touch' | 'percentage';
export type BelowThresholdBehavior = 'keep_last' | 'division_average' | 'no_rating';
export type VAABaseline = 'division_average' | 'position_average';
export type VARMethod = 'bottom_n_percent' | 'fixed_value';

// Player and Stats
export interface Player {
  id: string;
  member_id?: string;
  email?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  created_at: string;
}

export interface SeasonPlayer {
  id: string;
  player_id: string;
  season_id: string;
  division_id: string;
  team_id: string;
  player: Player;
  division_name: string;
  team_name: string;
}

export interface PlayerStats {
  id: string;
  season_player_id: string;
  games_played: number;
  // Offense stats
  receptions: number;
  receiving_yards: number;
  receiving_touchdowns: number;
  targets: number;
  rushes: number;
  rushing_yards: number;
  rushing_touchdowns: number;
  // Defense stats
  flags_pulled: number;
  interceptions: number;
  pass_deflections: number;
  sacks: number;
  defensive_touchdowns: number;
  // QB stats
  pass_attempts: number;
  pass_completions: number;
  passing_yards: number;
  passing_touchdowns: number;
  interceptions_thrown: number;
}

// Configuration
export interface StatConfig {
  stat_key: keyof PlayerStats;
  enabled: boolean;
  weight: number;
  normalize_mode: NormalizeMode;
  category: RatingCategory;
  /** Read the value from this stat instead of stat_key (used to reuse rushing stats in QB ratings) */
  source_key?: string;
  display_name: string;
}

export interface DivisionMultiplier {
  division_id: string;
  division_name: string;
  multiplier: number;
}

export interface EligibilityThreshold {
  category: RatingCategory;
  min_value: number;
  stat_key: string;
  below_behavior: BelowThresholdBehavior;
}

export interface VAAConfig {
  enabled: boolean;
  baseline: VAABaseline;
}

export interface VARConfig {
  enabled: boolean;
  method: VARMethod;
  threshold_value: number; // Percentage or fixed rating value
  playing_time_factor: 'games_played' | 'touches';
}

export interface RatingScaleConfig {
  min_rating: number;
  max_rating: number;
  decimal_places: number;
  use_compression: boolean;
  max_drift: number | null; // Max change per season; null = no maximum
}

export interface CarryoverConfig {
  carryover_weight: number; // 0-1, e.g., 0.3 for 30%
  current_weight: number; // 0-1, e.g., 0.7 for 70%
}

export interface RatingRunConfig {
  data_source: 'internal' | 'csv';
  column_mapping?: Record<string, string>;
  stat_configs: StatConfig[];
  eligibility_thresholds: EligibilityThreshold[];
  division_multipliers: DivisionMultiplier[];
  rating_scale: RatingScaleConfig;
  carryover: CarryoverConfig;
  vaa_config: Record<RatingCategory, VAAConfig>;
  var_config: Record<RatingCategory, VARConfig>;
}

// Rating Run and Results
export interface RatingRun {
  id: string;
  tenant_id: string;
  season_id: string;
  season_name: string;
  version_label: string;
  status: RatingRunStatus;
  config: RatingRunConfig;
  players_processed: number;
  players_excluded: number;
  created_by: string;
  created_at: string;
  committed_at?: string;
}

export interface RatingBreakdown {
  stat_contributions: Record<string, number>;
  raw_score: number;
  division_multiplier: number;
  scaled_score: number;
  carryover_value?: number;
  carryover_blend?: number;
  final_rating: number;
}

export interface PlayerRatingResult {
  id: string;
  run_id: string;
  season_player_id: string;
  player_name: string;
  division_name: string;
  team_name: string;
  offense_rating?: number;
  defense_rating?: number;
  qb_rating?: number;
  offense_vaa?: number;
  defense_vaa?: number;
  qb_vaa?: number;
  offense_war?: number;
  defense_war?: number;
  qb_war?: number;
  excluded: boolean;
  exclusion_reason?: string;
  offense_breakdown?: RatingBreakdown;
  defense_breakdown?: RatingBreakdown;
  qb_breakdown?: RatingBreakdown;
}

// Wizard State
export interface WizardStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface WizardState {
  current_step: number;
  steps: WizardStep[];
  config: Partial<RatingRunConfig>;
  csv_data?: Record<string, unknown>[];
  preview_results?: PlayerRatingResult[];
  is_calculating: boolean;
  calculation_progress: number;
}

// Presets
export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<RatingRunConfig>;
}

// Export types
export interface ExportOptions {
  include_breakdowns: boolean;
  include_vaa: boolean;
  include_war: boolean;
  include_excluded: boolean;
}
