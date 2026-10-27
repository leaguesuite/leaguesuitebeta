import { mockPlayers } from "@/data/mockMembers";

export type PaymentStatus = "paid" | "partial" | "unpaid";
export type PlayerStatus = "active" | "inactive";
export type RosterRole = "player" | "coach";

export interface HistoryEntry { date: string; text: string; }

export interface Team {
  id: string;
  name: string;
  abbr: string;
  division: string;
  conference?: string;
  subdivision?: string;
  captain: string;
  captainEmail: string;
  coach: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  teamPhotoUrl?: string;
  wins: number;
  losses: number;
  payment: PaymentStatus;
  rosterLockOverride: boolean;
  nameRequest?: { name: string; reason?: string };
  history: HistoryEntry[];
}

export interface RosterEntry {
  player_id: number;
  member_id: number;
  player_name: string;
  jersey: string;
  label: string;
  role: RosterRole;
  gp: number;
  status: PlayerStatus;
}

export interface Division { name: string; cap: number; status: "active" | "setup"; }

export const DIVISIONS: Division[] = [
  { name: "Division A", cap: 8, status: "active" },
  { name: "Division B", cap: 8, status: "active" },
  { name: "Division C", cap: 6, status: "setup" },
];

/** Conferences per division, each with its own subdivisions. */
export const CONFERENCES: Record<string, { name: string; subdivisions: string[] }[]> = {
  "Division A": [{ name: "North", subdivisions: ["Gold", "Silver"] }, { name: "South", subdivisions: [] }],
  "Division B": [{ name: "East", subdivisions: [] }, { name: "West", subdivisions: [] }],
  "Division C": [],
};

const t = (id: string, name: string, abbr: string, division: string, captain: string, captainEmail: string, primaryColor: string, secondaryColor: string, wins: number, losses: number, payment: PaymentStatus, extra: Partial<Team> = {}): Team =>
  ({ id, name, abbr, division, captain, captainEmail, coach: "N/A", primaryColor, secondaryColor, wins, losses, payment, rosterLockOverride: false, history: [{ date: "Sep 2, 2026", text: `Registered in ${division}` }], ...extra });

export const INITIAL_TEAMS: Team[] = [
  t("1", "Eagles", "EAG", "Division A", "John Smith", "john.smith@example.com", "#1e40af", "#fbbf24", 5, 1, "paid", { conference: "North", subdivision: "Gold" }),
  t("2", "Tigers", "TIG", "Division A", "Emily Brown", "emily.brown@example.com", "#ea580c", "#111111", 4, 2, "paid", { conference: "North", coach: "Sarah Johnson" }),
  t("5", "Knights", "KNI", "Division A", "Marcus Lee", "marcus.lee@example.com", "#ba7200", "#1f2937", 2, 4, "partial", { conference: "South" }),
  t("6", "Bears", "BEA", "Division A", "Alicia Ruiz", "alicia.ruiz@example.com", "#7f1d1d", "#f5f5f4", 1, 5, "unpaid"),
  t("3", "Hawks", "HAW", "Division B", "Jessica Thomas", "jessica.thomas@example.com", "#059669", "#ffffff", 3, 3, "paid", { conference: "East" }),
  t("4", "Lions", "LIO", "Division B", "Kevin Garcia", "kevin.garcia@example.com", "#c8102e", "#f2a900", 4, 2, "paid", { nameRequest: { name: "Pride FC", reason: "New sponsor this season." } }),
  t("7", "Wolves", "WOL", "Division B", "Sam Patel", "sam.patel@example.com", "#334155", "#e2e8f0", 2, 4, "partial"),
];

export const buildInitialRosters = (teams: Team[]): Record<string, RosterEntry[]> => {
  const map: Record<string, RosterEntry[]> = {};
  mockPlayers.forEach((p, i) => {
    const team = teams.find(x => x.name === p.team_name);
    if (!team) return;
    (map[team.id] ??= []).push({
      player_id: p.player_id, member_id: p.member_id, player_name: p.player_name,
      jersey: String(((i * 7) % 89) + 1), label: "", role: "player",
      gp: i % 4 === 0 ? 0 : (i % 6) + 1, status: "active",
    });
  });
  return map;
};

export const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
