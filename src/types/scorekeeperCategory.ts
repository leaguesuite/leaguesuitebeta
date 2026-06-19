export interface Category {
  id: string;
  name: string;
  format: string;
  downs: number;
  periodLength: number;
  FieldSize: number;
  RedZoneYards: number;
  NumberOfPeriods: number;
  LeagueType: string;
  OnsidePlaysRelativeDefaultPosition: number;
  PossessionStartRelativeDefaultPosition: number;
  OCURPlaysOff: number;
  FemaleSwitch: boolean;
  AllowLiveScoring: boolean;
  UseFumble: boolean;
  UseLateral: boolean;
  TouchdownPoints: number;
  FemaleAdditionalPoints: number;
  UseAirYards: boolean;
  UseYardsAfterCatch: boolean;
  UsePassDirection: boolean;
  updatedAt: string;
}

export const defaultCategory: Omit<Category, 'id' | 'updatedAt'> = {
  name: '',
  format: '5v5',
  downs: 4,
  periodLength: 20,
  FieldSize: 50,
  RedZoneYards: 5,
  NumberOfPeriods: 2,
  LeagueType: 'Flag',
  OnsidePlaysRelativeDefaultPosition: 5,
  PossessionStartRelativeDefaultPosition: 10,
  OCURPlaysOff: 5,
  FemaleSwitch: true,
  AllowLiveScoring: true,
  UseFumble: true,
  UseLateral: true,
  TouchdownPoints: 6,
  FemaleAdditionalPoints: 2,
  UseAirYards: true,
  UseYardsAfterCatch: true,
  UsePassDirection: true,
};

export type PresetName = 'simple' | 'medium' | 'advanced';

export const presets: Record<PresetName, Partial<Category>> = {
  simple: {
    FieldSize: 50, RedZoneYards: 5, NumberOfPeriods: 2, LeagueType: 'Flag',
    OnsidePlaysRelativeDefaultPosition: 5, PossessionStartRelativeDefaultPosition: 10,
    OCURPlaysOff: 5, FemaleSwitch: false, AllowLiveScoring: true,
    UseFumble: false, UseLateral: false, TouchdownPoints: 6, FemaleAdditionalPoints: 0,
    UseAirYards: false, UseYardsAfterCatch: false, UsePassDirection: false,
  },
  medium: {
    FieldSize: 80, RedZoneYards: 10, NumberOfPeriods: 2, LeagueType: 'Flag',
    OnsidePlaysRelativeDefaultPosition: 5, PossessionStartRelativeDefaultPosition: 10,
    OCURPlaysOff: 5, FemaleSwitch: true, AllowLiveScoring: true,
    UseFumble: true, UseLateral: true, TouchdownPoints: 6, FemaleAdditionalPoints: 2,
    UseAirYards: false, UseYardsAfterCatch: false, UsePassDirection: false,
  },
  advanced: {
    FieldSize: 100, RedZoneYards: 10, NumberOfPeriods: 4, LeagueType: 'Tackle',
    OnsidePlaysRelativeDefaultPosition: 5, PossessionStartRelativeDefaultPosition: 10,
    OCURPlaysOff: 5, FemaleSwitch: true, AllowLiveScoring: true,
    UseFumble: true, UseLateral: true, TouchdownPoints: 6, FemaleAdditionalPoints: 2,
    UseAirYards: true, UseYardsAfterCatch: true, UsePassDirection: true,
  },
};

// Mapping helpers (snake_case DB row <-> camelCase Category)
export function rowToCategory(r: any): Category {
  return {
    id: r.id,
    name: r.name,
    format: r.format,
    downs: r.downs,
    periodLength: r.period_length,
    FieldSize: r.field_size,
    RedZoneYards: r.red_zone_yards,
    NumberOfPeriods: r.number_of_periods,
    LeagueType: r.league_type,
    OnsidePlaysRelativeDefaultPosition: r.onside_plays_relative_default_position,
    PossessionStartRelativeDefaultPosition: r.possession_start_relative_default_position,
    OCURPlaysOff: r.ocur_plays_off,
    FemaleSwitch: r.female_switch,
    AllowLiveScoring: r.allow_live_scoring,
    UseFumble: r.use_fumble,
    UseLateral: r.use_lateral,
    TouchdownPoints: r.touchdown_points,
    FemaleAdditionalPoints: r.female_additional_points,
    UseAirYards: r.use_air_yards,
    UseYardsAfterCatch: r.use_yards_after_catch,
    UsePassDirection: r.use_pass_direction,
    updatedAt: r.updated_at,
  };
}

export function categoryToRow(c: Omit<Category, 'id' | 'updatedAt'>): Record<string, any> {
  return {
    name: c.name,
    format: c.format,
    downs: c.downs,
    period_length: c.periodLength,
    field_size: c.FieldSize,
    red_zone_yards: c.RedZoneYards,
    number_of_periods: c.NumberOfPeriods,
    league_type: c.LeagueType,
    onside_plays_relative_default_position: c.OnsidePlaysRelativeDefaultPosition,
    possession_start_relative_default_position: c.PossessionStartRelativeDefaultPosition,
    ocur_plays_off: c.OCURPlaysOff,
    female_switch: c.FemaleSwitch,
    allow_live_scoring: c.AllowLiveScoring,
    use_fumble: c.UseFumble,
    use_lateral: c.UseLateral,
    touchdown_points: c.TouchdownPoints,
    female_additional_points: c.FemaleAdditionalPoints,
    use_air_yards: c.UseAirYards,
    use_yards_after_catch: c.UseYardsAfterCatch,
    use_pass_direction: c.UsePassDirection,
  };
}
