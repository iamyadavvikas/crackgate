/**
 * GATE Civil (CE) full-length mock tests — one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/ce-mock-NN.json
 * Regenerate via:  npx tsx scripts/build_ce_mocks.ts
 *
 * Each file is the full 65-question · 100-mark · 180-minute GATE pattern with
 * negative marking ON (calculator allowed — unlike CIL).
 */
import ceMock01 from "@/data/questions/mocks/ce-mock-01.json";
import ceMock02 from "@/data/questions/mocks/ce-mock-02.json";
import ceMock03 from "@/data/questions/mocks/ce-mock-03.json";
import ceMock04 from "@/data/questions/mocks/ce-mock-04.json";
import ceMock05 from "@/data/questions/mocks/ce-mock-05.json";
import ceMock06 from "@/data/questions/mocks/ce-mock-06.json";
import ceMock07 from "@/data/questions/mocks/ce-mock-07.json";
import ceMock08 from "@/data/questions/mocks/ce-mock-08.json";
import ceMock09 from "@/data/questions/mocks/ce-mock-09.json";
import ceMock10 from "@/data/questions/mocks/ce-mock-10.json";
import ceMock11 from "@/data/questions/mocks/ce-mock-11.json";
import ceMock12 from "@/data/questions/mocks/ce-mock-12.json";
import ceMock13 from "@/data/questions/mocks/ce-mock-13.json";
import ceMock14 from "@/data/questions/mocks/ce-mock-14.json";
import ceMock15 from "@/data/questions/mocks/ce-mock-15.json";
import ceMock16 from "@/data/questions/mocks/ce-mock-16.json";
import ceMock17 from "@/data/questions/mocks/ce-mock-17.json";
import ceMock18 from "@/data/questions/mocks/ce-mock-18.json";
import ceMock19 from "@/data/questions/mocks/ce-mock-19.json";
import ceMock20 from "@/data/questions/mocks/ce-mock-20.json";

export const CE_MOCKS = [
  ceMock01, ceMock02, ceMock03, ceMock04, ceMock05,
  ceMock06, ceMock07, ceMock08, ceMock09, ceMock10,
  ceMock11, ceMock12, ceMock13, ceMock14, ceMock15,
  ceMock16, ceMock17, ceMock18, ceMock19, ceMock20,
] as const;
