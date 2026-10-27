export type Division = {
  id: number;
  categoryId: number;
  name: string;
  teamCap: number;
  qbCap: number;
  teams: number;
  status: "active" | "draft";
};

export type ToGain = "10 yards" | "15 yards" | "Midfield & Goal Line" | "Goal Line";
export type PeriodType = "halves" | "quarters" | "none";

/** Downs are offered as 3 or 4; anything else is a custom value. */
export const DOWNS_CHOICES = [3, 4];
export const isCustomDowns = (d: number) => !DOWNS_CHOICES.includes(d);

export type SpecialScoringRule = { id: string; label: string; points: number };

export type CategoryRules = {
  fieldLength: number;
  downs: number;
  toGain: ToGain;
  playersPerSide: number;
  periods: PeriodType;
  periodLength: number;
};

export type CategoryConfig = {
  allowKickoffs: boolean;
  possessionStart: number;
  allowFumbles: boolean;
  allowLaterals: boolean;
  redZoneYards: number;
  touchdownPoints: number;
  specialScoring: SpecialScoringRule[];
  allowLiveScoring: boolean;
  trackAirYards: boolean;
  trackYAC: boolean;
  trackPassDirection: boolean;
};

export type Category = {
  id: number;
  name: string;
  description: string;
  rules: CategoryRules;
  config: CategoryConfig;
};

export const defaultRules: CategoryRules = {
  fieldLength: 80, downs: 4, toGain: "Midfield & Goal Line", playersPerSide: 7, periods: "halves", periodLength: 20,
};

export const defaultConfig: CategoryConfig = {
  allowKickoffs: false, possessionStart: 5, allowFumbles: false, allowLaterals: true, redZoneYards: 10,
  touchdownPoints: 6, specialScoring: [], allowLiveScoring: true,
  trackAirYards: false, trackYAC: false, trackPassDirection: false,
};

export const initialCategories: Category[] = [
  { id: 1, name: "Men's", description: "Adult men's flag football leagues",
    rules: { ...defaultRules }, config: { ...defaultConfig, allowFumbles: true } },
  { id: 2, name: "Women's", description: "Adult women's flag football leagues",
    rules: { ...defaultRules, fieldLength: 70 }, config: { ...defaultConfig } },
  { id: 3, name: "Co-Ed", description: "Mixed gender flag football",
    rules: { ...defaultRules, playersPerSide: 8 },
    config: { ...defaultConfig, specialScoring: [{ id: "f-td", label: "Female TD", points: 2 }] } },
  { id: 4, name: "Youth", description: "Youth flag football under 18",
    rules: { ...defaultRules, fieldLength: 60, playersPerSide: 5, toGain: "Goal Line", periods: "none", periodLength: 40 },
    config: { ...defaultConfig, allowLaterals: false } },
];

export const periodLabel = (p: PeriodType) => p === "halves" ? "2 Halves" : p === "quarters" ? "4 Quarters" : "Continuous";

export const initialDivisions: Division[] = [
  { id: 1, categoryId: 1, name: "Division 1", teamCap: 8, qbCap: 2, teams: 8, status: "active" },
  { id: 2, categoryId: 1, name: "Division 2", teamCap: 10, qbCap: 2, teams: 7, status: "active" },
  { id: 3, categoryId: 1, name: "Division 3", teamCap: 12, qbCap: 3, teams: 5, status: "active" },
  { id: 4, categoryId: 2, name: "Division 1", teamCap: 8, qbCap: 2, teams: 6, status: "active" },
  { id: 5, categoryId: 2, name: "Division 2", teamCap: 10, qbCap: 2, teams: 4, status: "active" },
  { id: 6, categoryId: 3, name: "Open", teamCap: 12, qbCap: 2, teams: 7, status: "active" },
  { id: 7, categoryId: 4, name: "U16", teamCap: 10, qbCap: 2, teams: 0, status: "draft" },
  { id: 8, categoryId: 4, name: "U12", teamCap: 12, qbCap: 2, teams: 0, status: "draft" },
];
