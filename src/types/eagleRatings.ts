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

export interface EagleRatingsConfig {
  seasonId: string;
  ratingType: EagleRatingType;
  ratingTypes: EagleRatingType[];
  useWeightedDivisions: boolean;
  divisions: DivisionOrder[];
  globalRatingRange: { min: number; max: number };
  minGamesPlayed: number;
  minAttempts: number; // QB only
  minOffensiveStats: number; // Offensive only
  minDefensiveStats: number; // Defensive only
  includeRushingStats: boolean; // QB and Offensive only
  pastSeasonWeights: SeasonWeight[];
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
