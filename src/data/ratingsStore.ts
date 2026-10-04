// Demo in-memory store for per-season player ratings (shared across pages).
import { useSyncExternalStore } from "react";
import { mockMembers } from "@/data/mockMembers";

export type RatingKind = "off" | "def" | "qb";
export interface RatingRecord { member_id: number; season: string; type: RatingKind; value: number; }

export const RATING_MIN = 0;
export const RATING_MAX = 100;
export const DEMO_RATING_SEASON = "Fall 2024";

let records: RatingRecord[] = mockMembers.flatMap(m =>
  m.ratings
    ? ([
        { member_id: m.member_id, season: DEMO_RATING_SEASON, type: "off", value: m.ratings.offensive },
        { member_id: m.member_id, season: DEMO_RATING_SEASON, type: "def", value: m.ratings.defensive },
        { member_id: m.member_id, season: DEMO_RATING_SEASON, type: "qb", value: m.ratings.qb },
      ] as RatingRecord[])
    : []
);
const listeners = new Set<() => void>();

export const ratingKey = (r: { member_id: number; season: string; type: string }) =>
  `${r.member_id}|${r.season.trim().toLowerCase()}|${r.type}`;

export function getRatings() { return records; }

/** Upserts rows; returns counts of inserted vs overwritten. */
export function upsertRatings(rows: RatingRecord[]) {
  const map = new Map(records.map(r => [ratingKey(r), r]));
  let imported = 0, updated = 0;
  rows.forEach(r => {
    if (map.has(ratingKey(r))) updated++; else imported++;
    map.set(ratingKey(r), r);
  });
  records = [...map.values()];
  listeners.forEach(l => l());
  return { imported, updated };
}

export function useRatings() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getRatings);
}
