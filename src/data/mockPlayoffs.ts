export interface MockPlayoffDivision {
  id: string;
  name: string;
  totalTeams: number;
  qualifyingTeams: number;
  standings: { seed: number; team: string; record: string; tiedWith?: number[] }[];
}

export interface MockPlayoffGame {
  id: string;
  round: string;
  matchLabel: string;
  date: string;
  time: string;
  field: string;
  referee: string;
  team1: string;
  team2: string;
  status: "scheduled" | "in_progress" | "final";
  score?: { t1: number; t2: number };
}

export interface MockPlayoffTemplate {
  id: string;
  name: string;
  description: string;
  format: "fixed" | "reseeding" | "pool_crossover";
  teams: number;
  rounds: string[];
  bronze: boolean;
}

export const MOCK_DIVISIONS: MockPlayoffDivision[] = [
  {
    id: "d1",
    name: "Men's Division 1",
    totalTeams: 10,
    qualifyingTeams: 8,
    standings: [
      { seed: 1, team: "Thunderbolts", record: "10-2" },
      { seed: 2, team: "Iron Wolves", record: "9-3" },
      { seed: 3, team: "Red Hawks", record: "8-4", tiedWith: [4] },
      { seed: 4, team: "Blue Crushers", record: "8-4", tiedWith: [3] },
      { seed: 5, team: "Storm Riders", record: "7-5" },
      { seed: 6, team: "Night Owls", record: "6-6" },
      { seed: 7, team: "Steel Lions", record: "5-7" },
      { seed: 8, team: "Wildcats", record: "4-8" },
    ],
  },
  {
    id: "d2",
    name: "Men's Division 2",
    totalTeams: 8,
    qualifyingTeams: 4,
    standings: [
      { seed: 1, team: "Mavericks", record: "11-1" },
      { seed: 2, team: "Renegades", record: "8-4" },
      { seed: 3, team: "Spartans", record: "7-5" },
      { seed: 4, team: "Titans", record: "6-6" },
    ],
  },
];

export const MOCK_PLAYOFF_GAMES: MockPlayoffGame[] = [
  { id: "G-201", round: "Quarterfinal", matchLabel: "QF1", date: "Sat Nov 8", time: "6:00 PM", field: "Memorial Field 1", referee: "J. Smith", team1: "Thunderbolts", team2: "Wildcats", status: "final", score: { t1: 28, t2: 14 } },
  { id: "G-202", round: "Quarterfinal", matchLabel: "QF2", date: "Sat Nov 8", time: "6:00 PM", field: "Memorial Field 2", referee: "M. Lopez", team1: "Iron Wolves", team2: "Steel Lions", status: "final", score: { t1: 21, t2: 17 } },
  { id: "G-203", round: "Quarterfinal", matchLabel: "QF3", date: "Sat Nov 8", time: "7:30 PM", field: "Memorial Field 1", referee: "J. Smith", team1: "Red Hawks", team2: "Night Owls", status: "in_progress", score: { t1: 10, t2: 7 } },
  { id: "G-204", round: "Quarterfinal", matchLabel: "QF4", date: "Sat Nov 8", time: "7:30 PM", field: "Memorial Field 2", referee: "M. Lopez", team1: "Blue Crushers", team2: "Storm Riders", status: "scheduled" },
  { id: "G-210", round: "Semifinal", matchLabel: "SF1", date: "Sat Nov 15", time: "6:00 PM", field: "Memorial Field 1", referee: "J. Smith", team1: "Winner QF1", team2: "Winner QF4", status: "scheduled" },
  { id: "G-211", round: "Semifinal", matchLabel: "SF2", date: "Sat Nov 15", time: "7:30 PM", field: "Memorial Field 1", referee: "J. Smith", team1: "Winner QF2", team2: "Winner QF3", status: "scheduled" },
  { id: "G-220", round: "Final", matchLabel: "F", date: "Sat Nov 22", time: "7:00 PM", field: "Memorial Field 1", referee: "TBD", team1: "Winner SF1", team2: "Winner SF2", status: "scheduled" },
];

export const MOCK_TEMPLATES: MockPlayoffTemplate[] = [
  { id: "t1", name: "8-Team Single Elim", description: "Standard fixed bracket, no bronze", format: "fixed", teams: 8, rounds: ["Quarterfinal", "Semifinal", "Final"], bronze: false },
  { id: "t2", name: "8-Team Reseeded + Bronze", description: "Reseeds each round, includes 3rd place game", format: "reseeding", teams: 8, rounds: ["Quarterfinal", "Semifinal", "Final"], bronze: true },
  { id: "t3", name: "4-Team Semis", description: "Quick playoff for small divisions", format: "fixed", teams: 4, rounds: ["Semifinal", "Final"], bronze: false },
];

// Returns mock conflicts within current schedule
export interface ScheduleConflict {
  severity: "high" | "medium" | "low";
  type: "field" | "team" | "referee";
  message: string;
  gameIds: string[];
}

export function detectConflicts(games: MockPlayoffGame[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  for (let i = 0; i < games.length; i++) {
    for (let j = i + 1; j < games.length; j++) {
      const a = games[i], b = games[j];
      if (a.date === b.date && a.time === b.time) {
        if (a.field === b.field) conflicts.push({ severity: "high", type: "field", message: `${a.field} double-booked at ${a.time} on ${a.date}`, gameIds: [a.id, b.id] });
        if (a.referee === b.referee && a.referee !== "TBD") conflicts.push({ severity: "medium", type: "referee", message: `Referee ${a.referee} assigned to two games at ${a.time}`, gameIds: [a.id, b.id] });
      }
    }
  }
  // synthetic team example
  conflicts.push({ severity: "low", type: "team", message: "Thunderbolts have a regular-season game and QF1 on the same day", gameIds: ["G-201"] });
  return conflicts;
}
