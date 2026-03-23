export interface StatDefinition {
  id: string;
  label: string;
  abbreviation: string;
  category: 'passing' | 'rushing' | 'receiving' | 'defense' | 'converts' | 'special_teams' | 'general';
  description: string;
  defaultEnabled: boolean;
}

export interface StatTrackingConfig {
  categoryId: number;
  categoryName: string;
  stats: { statId: string; enabled: boolean }[];
}

export const statDefinitions: StatDefinition[] = [
  // Passing
  { id: 'pass_att', label: 'Attempts', abbreviation: 'ATT', category: 'passing', description: 'Total pass attempts', defaultEnabled: true },
  { id: 'pass_comp', label: 'Completions', abbreviation: 'CMP', category: 'passing', description: 'Completed passes', defaultEnabled: true },
  { id: 'pass_yds', label: 'Passing Yards', abbreviation: 'YDS', category: 'passing', description: 'Total passing yards', defaultEnabled: true },
  { id: 'pass_td', label: 'Passing Touchdowns', abbreviation: 'TD', category: 'passing', description: 'Touchdown passes thrown', defaultEnabled: true },
  { id: 'pass_int', label: 'Interceptions Thrown', abbreviation: 'INT', category: 'passing', description: 'Interceptions thrown by QB', defaultEnabled: true },
  { id: 'pass_pct', label: 'Completion %', abbreviation: 'CMP%', category: 'passing', description: 'Pass completion percentage', defaultEnabled: false },
  { id: 'pass_rating', label: 'Passer Rating', abbreviation: 'RTG', category: 'passing', description: 'Passer efficiency rating', defaultEnabled: false },

  // Rushing
  { id: 'rush_att', label: 'Rush Attempts', abbreviation: 'ATT', category: 'rushing', description: 'Total rushing attempts', defaultEnabled: true },
  { id: 'rush_yds', label: 'Rushing Yards', abbreviation: 'YDS', category: 'rushing', description: 'Total rushing yards', defaultEnabled: true },
  { id: 'rush_td', label: 'Rushing Touchdowns', abbreviation: 'TD', category: 'rushing', description: 'Rushing touchdowns', defaultEnabled: true },
  { id: 'rush_avg', label: 'Yards per Carry', abbreviation: 'AVG', category: 'rushing', description: 'Average yards per carry', defaultEnabled: false },
  { id: 'rush_long', label: 'Longest Rush', abbreviation: 'LNG', category: 'rushing', description: 'Longest single rush', defaultEnabled: false },

  // Receiving
  { id: 'rec', label: 'Receptions', abbreviation: 'REC', category: 'receiving', description: 'Total receptions', defaultEnabled: true },
  { id: 'rec_yds', label: 'Receiving Yards', abbreviation: 'YDS', category: 'receiving', description: 'Total receiving yards', defaultEnabled: true },
  { id: 'rec_td', label: 'Receiving Touchdowns', abbreviation: 'TD', category: 'receiving', description: 'Receiving touchdowns', defaultEnabled: true },
  { id: 'rec_avg', label: 'Yards per Reception', abbreviation: 'AVG', category: 'receiving', description: 'Average yards per catch', defaultEnabled: false },
  { id: 'rec_long', label: 'Longest Reception', abbreviation: 'LNG', category: 'receiving', description: 'Longest single reception', defaultEnabled: false },
  { id: 'targets', label: 'Targets', abbreviation: 'TGT', category: 'receiving', description: 'Times targeted as receiver', defaultEnabled: false },

  // Defense
  { id: 'def_int', label: 'Interceptions', abbreviation: 'INT', category: 'defense', description: 'Interceptions caught on defense', defaultEnabled: true },
  { id: 'def_td', label: 'Defensive Touchdowns', abbreviation: 'TD', category: 'defense', description: 'Touchdowns scored on defense', defaultEnabled: true },
  { id: 'def_sack', label: 'Sacks', abbreviation: 'SCK', category: 'defense', description: 'Quarterback sacks', defaultEnabled: true },
  { id: 'def_flag_pull', label: 'Flag Pulls', abbreviation: 'FP', category: 'defense', description: 'Successful flag pulls', defaultEnabled: true },
  { id: 'def_pd', label: 'Passes Defended', abbreviation: 'PD', category: 'defense', description: 'Passes knocked down or deflected', defaultEnabled: false },
  { id: 'def_safety', label: 'Safeties', abbreviation: 'SAF', category: 'defense', description: 'Safeties forced', defaultEnabled: false },

  // Converts
  { id: 'conv_1pt', label: '1-Point Converts', abbreviation: '1PT', category: 'converts', description: '1-point conversion attempts made', defaultEnabled: true },
  { id: 'conv_2pt', label: '2-Point Converts', abbreviation: '2PT', category: 'converts', description: '2-point conversion attempts made', defaultEnabled: true },
  { id: 'conv_att', label: 'Convert Attempts', abbreviation: 'ATT', category: 'converts', description: 'Total conversion attempts', defaultEnabled: false },

  // Special Teams
  { id: 'st_ret_yds', label: 'Return Yards', abbreviation: 'YDS', category: 'special_teams', description: 'Total return yards', defaultEnabled: false },
  { id: 'st_ret_td', label: 'Return Touchdowns', abbreviation: 'TD', category: 'special_teams', description: 'Touchdowns on returns', defaultEnabled: false },
  { id: 'st_punt_yds', label: 'Punt Yards', abbreviation: 'YDS', category: 'special_teams', description: 'Total punt yards', defaultEnabled: false },

  // General
  { id: 'games_played', label: 'Games Played', abbreviation: 'GP', category: 'general', description: 'Total games played', defaultEnabled: true },
  { id: 'total_td', label: 'Total Touchdowns', abbreviation: 'TD', category: 'general', description: 'All touchdowns combined', defaultEnabled: true },
  { id: 'total_pts', label: 'Total Points', abbreviation: 'PTS', category: 'general', description: 'Total points scored', defaultEnabled: true },
];

export const statCategoryLabels: Record<string, string> = {
  passing: 'Passing',
  rushing: 'Rushing',
  receiving: 'Receiving',
  defense: 'Defense',
  converts: 'Converts',
  special_teams: 'Special Teams',
  general: 'General',
};

export const statCategoryOrder = ['general', 'passing', 'rushing', 'receiving', 'defense', 'converts', 'special_teams'] as const;
