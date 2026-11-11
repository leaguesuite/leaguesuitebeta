// Types for Eagle Ratings Wizard

export type EagleRatingType = 'quarterback' | 'offensive' | 'defensive';

export interface DivisionOrder {
  id: string;
  name: string;
  order: number;
  ratingRange: { min: number; max: number };
}

export interface SeasonWeight {
  seasonId: string;
  seasonName: string;
  weight: number;
}

export interface DivisionMapping {
  csvDivision: string;
  mappedDivisionId: string | null; // null = unmapped
  playerCount: number;
}

export interface EagleRatingsConfig {
  seasonId: string;
  ratingType: EagleRatingType;
  useWeightedDivisions: boolean;
  divisions: DivisionOrder[];
  globalRatingRange: { min: number; max: number };
  minGamesPlayed: number;
  minAttempts: number;
  minOffensiveStats: number;
  minDefensiveStats: number;
  includeRushingStats: boolean;
  pastSeasonWeights: SeasonWeight[];
  carryoverData?: Record<string, unknown>[];
  currentSeasonStats?: Record<string, unknown>[];
  divisionMappings?: DivisionMapping[];
}

export interface EaglePlayerResult {
  playerId: string;
  playerName: string;
  division: string;
  team: string;
  rating: number;
  previousRating?: number;
  delta?: number;
  overrideRating?: number;
  excluded: boolean;
  exclusionReason?: string;
  gamesPlayed: number;
  carryoverRating?: number;
  currentSeasonScore?: number;
  isMultiDivision: boolean;
  isUsedRating: boolean; // true = this is the highest rating used for this player
}

export const defaultEagleConfig: EagleRatingsConfig = {
  seasonId: '',
  ratingType: 'offensive',
  useWeightedDivisions: false,
  divisions: [],
  globalRatingRange: { min: 60, max: 90 },
  minGamesPlayed: 4,
  minAttempts: 20,
  minOffensiveStats: 10,
  minDefensiveStats: 10,
  includeRushingStats: true,
  pastSeasonWeights: [],
};
