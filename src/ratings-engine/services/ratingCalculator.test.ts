import { describe, it, expect } from "vitest";
import { applyDriftCap, balanceOffset } from "@/ratings-engine/services/ratingCalculator";
import { defaultCarryoverConfig } from "@/ratings-engine/data/mockData";

describe("rating scale: maximum rating change per season", () => {
  it("lets a rating move freely when there is no maximum", () => {
    expect(applyDriftCap(95, 60, null)).toBe(95);
  });

  it("caps the change when a maximum is set", () => {
    expect(applyDriftCap(95, 60, 10)).toBe(70);
    expect(applyDriftCap(50, 60, 10)).toBe(50);
  });
});

describe("carryover config", () => {
  it("no longer offers recent-game weighting", () => {
    expect("weight_recent_games" in defaultCarryoverConfig).toBe(false);
  });
});

describe("balancing increases and decreases", () => {
  it("moves the average player to the middle of the scale", () => {
    const ratings = [40, 60, 80];
    const off = balanceOffset(ratings, 0, 100);
    expect(off).toBe(-10);
    expect(ratings.map(r => r + off)).toEqual([30, 50, 70]);
  });
  it("keeps each player's distance from average", () => {
    const off = balanceOffset([20, 30], 0, 100);
    expect(30 + off - (20 + off)).toBe(10);
  });
});
