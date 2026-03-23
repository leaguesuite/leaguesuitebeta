export interface ParsedTeam {
  name: string;
  ranking: number;
}

export interface TeamSlot {
  id: string;
  name: string;
  score?: number;
  seed?: number;
  byeAdvanced?: boolean;
}

export interface Match {
  id: string;
  team1?: TeamSlot;
  team2?: TeamSlot;
  winner?: string;
  completed?: boolean;
  bye?: boolean;
}

export interface Round {
  id: string;
  name: string;
  matches: Match[];
  date?: string;
  sideBreaks?: { afterIndex: number; label: string }[];
}

export interface BracketLevel {
  name: string;
  teamCount: number;
  teams: { id: string; name: string }[];
  results: Record<string, string>;
  extraMatchesPerRound?: Record<number, number>;
  roundCount?: number;
  roundNames?: string[];
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  sport: string;
  team_count: number;
  bracket_sides: number;
  is_reseeding: boolean;
  teams: { id: string; name: string }[];
  results: Record<string, string>;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  bracket_levels: BracketLevel[] | null;
}
