import { describe, expect, it } from "vitest";
import { grade, type Question } from "@/lib/grading";

const mcq = (answer: number, marks = 1, subject = "MN"): Question => ({
  type: "MCQ",
  marks,
  answer,
  options: ["a", "b", "c", "d"],
  subject,
});

const msq = (answer: number[], marks = 2, subject = "MN"): Question => ({
  type: "MSQ",
  marks,
  answer,
  options: ["a", "b", "c", "d"],
  subject,
});

const nat = (answer: number, tolerance: number, marks = 1, subject = "MN"): Question => ({
  type: "NAT",
  marks,
  answer,
  tolerance,
  subject,
});

describe("grade", () => {
  it("awards full marks for a correct MCQ", () => {
    const r = grade([mcq(2, 1)], { 0: 2 });
    expect(r.correct).toBe(1);
    expect(r.wrong).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.scored).toBe(1);
    expect(r.total).toBe(1);
  });

  it("applies GATE 1/3 negative marking on a wrong MCQ", () => {
    const r = grade([mcq(2, 3)], { 0: 1 });
    expect(r.wrong).toBe(1);
    expect(r.scored).toBe(-1); // 3 / 3
  });

  it("does not penalise skipped questions", () => {
    const r = grade([mcq(2), mcq(3)], { 0: null });
    expect(r.skipped).toBe(2);
    expect(r.scored).toBe(0);
  });

  it("treats an empty MSQ selection as skipped, not wrong", () => {
    const r = grade([msq([0, 2])], { 0: [] });
    expect(r.skipped).toBe(1);
    expect(r.wrong).toBe(0);
    expect(r.scored).toBe(0);
  });

  it("grades MSQ order-independently and never negatively", () => {
    const correct = grade([msq([0, 2], 2)], { 0: [2, 0] });
    expect(correct.correct).toBe(1);
    expect(correct.scored).toBe(2);

    const partial = grade([msq([0, 2], 2)], { 0: [0] });
    expect(partial.wrong).toBe(1);
    expect(partial.scored).toBe(0); // no negative marking for MSQ
  });

  it("grades NAT within tolerance and gives no negative marks when wrong", () => {
    const within = grade([nat(10, 0.5, 1)], { 0: "9.6" });
    expect(within.correct).toBe(1);
    expect(within.scored).toBe(1);

    const outside = grade([nat(10, 0.5, 1)], { 0: "11" });
    expect(outside.wrong).toBe(1);
    expect(outside.scored).toBe(0);
  });

  it("aggregates a mixed paper and reports per-subject breakdown", () => {
    const questions: Question[] = [
      mcq(0, 3, "MN"), // correct  +3
      mcq(1, 3, "MN"), // wrong    -1
      msq([0, 1], 2, "EM"), // correct  +2
      nat(5, 0.1, 2, "EM"), // skipped   0
    ];
    const r = grade(questions, { 0: 0, 1: 0, 2: [1, 0], 3: null });

    expect(r.correct).toBe(2);
    expect(r.wrong).toBe(1);
    expect(r.skipped).toBe(1);
    expect(r.scored).toBe(4); // 3 - 1 + 2 + 0
    expect(r.total).toBe(10);
    expect(r.breakdown.MN).toEqual({ scored: 2, total: 6 });
    expect(r.breakdown.EM).toEqual({ scored: 2, total: 4 });
  });

  it("returns zero accuracy for an empty paper without dividing by zero", () => {
    const r = grade([], {});
    expect(r.total).toBe(0);
    expect(r.accuracy).toBe(0);
  });
});
