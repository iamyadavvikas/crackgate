/** Shared NAT (Numerical Answer Type) range checking.
 *
 *  GATE NAT questions are graded against a band of acceptable values, not a
 *  single exact number. We support two equivalent ways to express that band:
 *
 *    1. `acceptedRange: { min, max }`  — explicit lower/upper bounds (preferred).
 *    2. `answer` + `tolerance`         — symmetric band `answer ± tolerance`.
 *
 *  Generators should emit BOTH so every consumer (server grader, client
 *  runners, review screens) agrees regardless of which field it reads. */

export interface NatLike {
  answer: number;
  tolerance?: number;
  acceptedRange?: { min: number; max: number };
}

/** Resolve the inclusive [min, max] band a NAT answer is accepted within. */
export function natBounds(q: NatLike): { min: number; max: number } {
  if (q.acceptedRange) {
    const { min, max } = q.acceptedRange;
    return min <= max ? { min, max } : { min: max, max: min };
  }
  const tol = Math.abs(q.tolerance ?? 0);
  return { min: q.answer - tol, max: q.answer + tol };
}

/** True when `value` falls within the question's accepted NAT band. */
export function natMatches(q: NatLike, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  const { min, max } = natBounds(q);
  return value >= min && value <= max;
}
