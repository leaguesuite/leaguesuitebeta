export type Division = {
  id: number;
  categoryId: number;
  name: string;
  teamCap: number;
  qbCap: number;
  teams: number;
  status: "active" | "draft";
};

export type Category = {
  id: number;
  name: string;
  description: string;
  rules: { fieldLength: string; downs: number; rushCount: number; playersPerSide: number };
};

export const initialCategories: Category[] = [
  { id: 1, name: "Men's", description: "Adult men's flag football leagues", rules: { fieldLength: "80 yards", downs: 4, rushCount: 7, playersPerSide: 7 } },
  { id: 2, name: "Women's", description: "Adult women's flag football leagues", rules: { fieldLength: "70 yards", downs: 4, rushCount: 7, playersPerSide: 7 } },
  { id: 3, name: "Co-Ed", description: "Mixed gender flag football", rules: { fieldLength: "80 yards", downs: 4, rushCount: 7, playersPerSide: 8 } },
  { id: 4, name: "Youth", description: "Youth flag football under 18", rules: { fieldLength: "60 yards", downs: 4, rushCount: 5, playersPerSide: 5 } },
];

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
