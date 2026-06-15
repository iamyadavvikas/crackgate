import { TrackHub, GATE_MODULES } from "@/components/track-hub";

export const metadata = { title: "GATE Environmental Science & Engineering (ES) · CrackGate" };

export default function GateEnvironmentPage() {
  return (
    <TrackHub
      discipline="Environment (ES)"
      tagline="GATE Environmental Science &amp; Engineering prep is on its way — built to the same exam-grade standard as our Mining track."
      live={false}
      modules={GATE_MODULES}
    />
  );
}
