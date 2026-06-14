import { TrackHub, GATE_MODULES } from "@/components/track-hub";

export const metadata = { title: "GATE Geology (GG) · CrackGate" };

export default function GateGeologyPage() {
  return (
    <TrackHub
      discipline="Geology (GG)"
      tagline="GATE Geology &amp; Geophysics prep is on its way — built to the same exam-grade standard as our Mining track."
      live={false}
      modules={GATE_MODULES}
    />
  );
}
