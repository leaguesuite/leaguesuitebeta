import { describe, it, expect } from "vitest";
import { applyDriftCap } from "@/ratings-engine/services/ratingCalculator";
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
