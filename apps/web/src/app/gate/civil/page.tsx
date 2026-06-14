import { TrackHub, GATE_MODULES } from "@/components/track-hub";

export const metadata = { title: "GATE Civil (CE) · CrackGate" };

export default function GateCivilPage() {
  return (
    <TrackHub
      discipline="Civil (CE)"
      tagline="GATE Civil prep is coming to CrackGate — the same exam-grade Learn, Practice, Mocks, AITS and Notes you get for Mining."
      live={false}
      modules={GATE_MODULES}
    />
  );
}
