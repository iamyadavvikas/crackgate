/** Shared practice-bank plan limits.
 *  Single source of truth for the free preview cap + per-plan request caps,
 *  imported by both the API route and the landing page so the displayed copy
 *  can never drift from the enforced runtime limit. */

/** Free / anonymous users may preview this many questions per subject. */
export const FREE_PREVIEW = 20;

/** Max questions returned per request, by plan. */
export const CAPS: Record<string, number> = {
  free: FREE_PREVIEW,
  pro: 500,
  premium: 1000,
};
