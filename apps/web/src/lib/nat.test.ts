import { describe, expect, it } from "vitest";
import { natBounds, natMatches } from "@/lib/nat";

describe("natBounds", () => {
  it("uses explicit acceptedRange when present", () => {
    expect(natBounds({ answer: 5, acceptedRange: { min: 4, max: 6 } })).toEqual({
      min: 4,
      max: 6,
    });
  });

  it("normalises an inverted acceptedRange", () => {
    expect(natBounds({ answer: 5, acceptedRange: { min: 6, max: 4 } })).toEqual({
      min: 4,
      max: 6,
    });
  });

  it("derives a symmetric band from answer ± tolerance", () => {
    expect(natBounds({ answer: 10, tolerance: 0.5 })).toEqual({ min: 9.5, max: 10.5 });
  });

  it("treats a missing tolerance as an exact match band", () => {
    expect(natBounds({ answer: 3 })).toEqual({ min: 3, max: 3 });
  });

  it("prefers acceptedRange over tolerance when both are given", () => {
    expect(
      natBounds({ answer: 5, tolerance: 2, acceptedRange: { min: 4.9, max: 5.1 } }),
    ).toEqual({ min: 4.9, max: 5.1 });
  });
});

describe("natMatches", () => {
  const q = { answer: 10, tolerance: 0.5 };

  it("accepts values inside the band, inclusive of bounds", () => {
    expect(natMatches(q, 9.5)).toBe(true);
    expect(natMatches(q, 10)).toBe(true);
    expect(natMatches(q, 10.5)).toBe(true);
  });

  it("rejects values outside the band", () => {
    expect(natMatches(q, 9.49)).toBe(false);
    expect(natMatches(q, 10.51)).toBe(false);
  });

  it("rejects non-finite values (NaN from a bad parse)", () => {
    expect(natMatches(q, NaN)).toBe(false);
    expect(natMatches(q, Infinity)).toBe(false);
  });
});
