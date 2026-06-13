/** Runner — builds all subject practice banks and prints a validation summary. */
import { buildSubject } from "./build_practice_bank.mjs";

const modules = [
  (await import("./practice/engineering-mathematics.mjs")).default,
  (await import("./practice/general-aptitude.mjs")).default,
  (await import("./practice/mine-ventilation.mjs")).default,
  (await import("./practice/rock-mechanics.mjs")).default,
  (await import("./practice/surface-mining.mjs")).default,
  (await import("./practice/underground-mining.mjs")).default,
  (await import("./practice/drilling-blasting.mjs")).default,
  (await import("./practice/mine-economics-planning.mjs")).default,
  (await import("./practice/mine-surveying.mjs")).default,
  (await import("./practice/mine-environment.mjs")).default,
];

let grand = 0;
for (const m of modules) {
  const n = buildSubject(m);
  grand += n;
  console.log(`${m.slug.padEnd(28)} ${n} questions`);
}
console.log(`TOTAL: ${grand} questions across ${modules.length} subjects`);
