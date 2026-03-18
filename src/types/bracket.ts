export interface TeamMatchData {
  id: string;
  name: string;
  score?: number | null;
  seed?: number;
  logo?: string;
}

export interface Match {
  id: string;
  matchNumber: number;
  teams: [TeamMatchData, TeamMatchData];
  winnerId?: string;
  date?: string;
  time?: string;
  venue?: string;
  status: "upcoming" | "inProgress" | "completed";
}

export interface Round {
  id: string;
  name: string;
  date?: string;
  matches: Match[];
}

export interface Bracket {
  id: string;
  name: string;
  division: string;
  rounds: Round[];
  teamCount: number;
  status: "setup" | "active" | "completed";
  isReseeding: boolean;
}
