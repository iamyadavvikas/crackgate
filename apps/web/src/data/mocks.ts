/**
 * Mock test definitions — one JSON file per mock.
 *
 * Source of truth:  apps/web/src/data/questions/mocks/<mock-id>.json
 *
 * - mn-mock-01, 09, 10  → Full-syllabus mocks (Free / Hard / Premium)
 * - mn-mock-02 … 08     → Subject-wise mocks
 *
 * Each file has the full 65-question · 100-mark · 180-minute GATE pattern
 * and is editable by hand. You can also regenerate any subset from the
 * 906-Q practice bank via `npm run build:mocks` (preserves files marked
 * `"locked": true` so your hand-edits aren't clobbered).
 */
import mock01 from "./questions/mocks/mn-mock-01.json";
import mock02 from "./questions/mocks/mn-mock-02.json";
import mock03 from "./questions/mocks/mn-mock-03.json";
import mock04 from "./questions/mocks/mn-mock-04.json";
import mock05 from "./questions/mocks/mn-mock-05.json";
import mock06 from "./questions/mocks/mn-mock-06.json";
import mock07 from "./questions/mocks/mn-mock-07.json";
import mock08 from "./questions/mocks/mn-mock-08.json";
import mock09 from "./questions/mocks/mn-mock-09.json";
import mock10 from "./questions/mocks/mn-mock-10.json";

export const MOCKS = [
  mock01, mock02, mock03, mock04, mock05,
  mock06, mock07, mock08, mock09, mock10,
] as const;
