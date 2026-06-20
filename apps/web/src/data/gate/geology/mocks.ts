/**
 * GATE Geology & Geophysics (GG) full-length mock tests — one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/gg-mock-NN.json
 * Regenerate via:  npx tsx scripts/build_gg_mocks.ts
 *
 * Each file is the full 65-question · 100-mark · 180-minute GATE pattern with
 * negative marking ON (calculator allowed). Every paper carries ≥17 load-bearing
 * figures (stereonet / mohr / stress-block) per the GG figure quota.
 */
import ggMock01 from "@/data/questions/mocks/gg-mock-01.json";
import ggMock02 from "@/data/questions/mocks/gg-mock-02.json";
import ggMock03 from "@/data/questions/mocks/gg-mock-03.json";
import ggMock04 from "@/data/questions/mocks/gg-mock-04.json";
import ggMock05 from "@/data/questions/mocks/gg-mock-05.json";
import ggMock06 from "@/data/questions/mocks/gg-mock-06.json";
import ggMock07 from "@/data/questions/mocks/gg-mock-07.json";
import ggMock08 from "@/data/questions/mocks/gg-mock-08.json";
import ggMock09 from "@/data/questions/mocks/gg-mock-09.json";
import ggMock10 from "@/data/questions/mocks/gg-mock-10.json";
import ggMock11 from "@/data/questions/mocks/gg-mock-11.json";
import ggMock12 from "@/data/questions/mocks/gg-mock-12.json";
import ggMock13 from "@/data/questions/mocks/gg-mock-13.json";
import ggMock14 from "@/data/questions/mocks/gg-mock-14.json";
import ggMock15 from "@/data/questions/mocks/gg-mock-15.json";
import ggMock16 from "@/data/questions/mocks/gg-mock-16.json";
import ggMock17 from "@/data/questions/mocks/gg-mock-17.json";
import ggMock18 from "@/data/questions/mocks/gg-mock-18.json";
import ggMock19 from "@/data/questions/mocks/gg-mock-19.json";
import ggMock20 from "@/data/questions/mocks/gg-mock-20.json";

export const GG_MOCKS = [
  ggMock01, ggMock02, ggMock03, ggMock04, ggMock05,
  ggMock06, ggMock07, ggMock08, ggMock09, ggMock10,
  ggMock11, ggMock12, ggMock13, ggMock14, ggMock15,
  ggMock16, ggMock17, ggMock18, ggMock19, ggMock20,
] as const;
