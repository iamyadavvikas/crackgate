/**
 * GATE Environmental Science & Engineering (ES) full-length mock tests —
 * one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/es-mock-NN.json
 * Regenerate via:  npx tsx scripts/build_es_mocks.ts
 *
 * Each file is the full 65-question · 100-mark · 180-minute GATE pattern with
 * negative marking ON (calculator allowed).
 */
import esMock01 from "@/data/questions/mocks/es-mock-01.json";
import esMock02 from "@/data/questions/mocks/es-mock-02.json";
import esMock03 from "@/data/questions/mocks/es-mock-03.json";
import esMock04 from "@/data/questions/mocks/es-mock-04.json";
import esMock05 from "@/data/questions/mocks/es-mock-05.json";
import esMock06 from "@/data/questions/mocks/es-mock-06.json";
import esMock07 from "@/data/questions/mocks/es-mock-07.json";
import esMock08 from "@/data/questions/mocks/es-mock-08.json";
import esMock09 from "@/data/questions/mocks/es-mock-09.json";
import esMock10 from "@/data/questions/mocks/es-mock-10.json";
import esMock11 from "@/data/questions/mocks/es-mock-11.json";
import esMock12 from "@/data/questions/mocks/es-mock-12.json";
import esMock13 from "@/data/questions/mocks/es-mock-13.json";
import esMock14 from "@/data/questions/mocks/es-mock-14.json";
import esMock15 from "@/data/questions/mocks/es-mock-15.json";
import esMock16 from "@/data/questions/mocks/es-mock-16.json";
import esMock17 from "@/data/questions/mocks/es-mock-17.json";
import esMock18 from "@/data/questions/mocks/es-mock-18.json";
import esMock19 from "@/data/questions/mocks/es-mock-19.json";
import esMock20 from "@/data/questions/mocks/es-mock-20.json";

export const ES_MOCKS = [
  esMock01, esMock02, esMock03, esMock04, esMock05,
  esMock06, esMock07, esMock08, esMock09, esMock10,
  esMock11, esMock12, esMock13, esMock14, esMock15,
  esMock16, esMock17, esMock18, esMock19, esMock20,
] as const;
