import Link from "next/link";
import { MOCKS } from "@/data/mocks";
import { PRACTICE } from "@/data/practice";
import { QuestionOfTheDayCard } from "@/components/question-of-the-day";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic"; // QOTD changes daily

function pickQuestionOfTheDay() {
  // Flatten all practice Qs and pick deterministically by today's date so
  // every visitor sees the same question and it rotates at midnight UTC.
  const all = PRACTICE.flatMap((s) => s.questions.map((q) => ({ ...q, _subject: s.name })));
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let h = 2166136261 >>> 0;
  for (let i = 0; i < today.length; i++) { h ^= today.charCodeAt(i); h = Math.imul(h, 16777619); }
  const idx = (h >>> 0) % all.length;
  const q = all[idx];
  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return { q: { ...q, subject: q._subject }, dateLabel };
}

export default function HomePage() {
  const practiceQs = PRACTICE.reduce((s, sub) => s + sub.questions.length, 0);
  const subjectsCount = PRACTICE.length;
  const mocksCount = MOCKS.length;
  const qotd = pickQuestionOfTheDay();

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="bg-gradient-to-br from-brand to-brand-2 text-white">
        <div className="max-w-7xl mx-auto px-5 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-white/10 text-amber-300 border border-amber-300/30">
              GATE 2027 · Mining Engineering (MN)
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mt-4 leading-tight">
              Crack GATE Mining with{" "}
              <span className="text-accent">India's only</span> dedicated platform.
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              {mocksCount} full-length mocks · {practiceQs}+ topic-wise practice questions ·
              real-time NTA-style exam portal · SWOT analytics. Built only for GATE MN.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-accent btn-lg">🚀 Start Free Mock</Link>
              <Link href="/pricing" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 btn-lg">View Pricing</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
              <Stat n={`${practiceQs}+`} label="Practice Questions" />
              <Stat n="200+" label="Mock Questions" />
              <Stat n={`${mocksCount}`} label="Full-length Mocks" />
              <Stat n={`${subjectsCount}`} label="Subjects" />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/20 p-6 shadow-pop">
              <div className="text-xs text-amber-300 font-semibold mb-2">LIVE EXAM PORTAL · NTA STYLE</div>
              <div className="bg-white rounded-lg text-slate-900 p-6">
                <div className="text-xs text-slate-500">Question 23 of 65</div>
                <div className="mt-2 text-sm font-medium">In bord & pillar mining, the depth of cover is 250 m and unit weight of rock is 25 kN/m³. Compute the vertical stress (MPa).</div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded border border-slate-200 px-3 py-2 hover:bg-slate-50">A. 2.5</div>
                  <div className="rounded border border-brand bg-brand/5 px-3 py-2 font-semibold text-brand">B. 6.25</div>
                  <div className="rounded border border-slate-200 px-3 py-2 hover:bg-slate-50">C. 12.5</div>
                  <div className="rounded border border-slate-200 px-3 py-2 hover:bg-slate-50">D. 25</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="badge bg-amber-100 text-amber-800">+2 · −0.67</span>
                  <span className="badge bg-slate-100 text-slate-700">02:43:11 left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- QUESTION OF THE DAY ---------- */}
      <QuestionOfTheDayCard q={qotd.q} dateLabel={qotd.dateLabel} />

      {/* ---------- FEATURES ---------- */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-extrabold text-center">Everything you need to crack GATE MN.</h2>
        <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
          Hyper-focused on mining. No generic content, no padding — every question is graded automatically with detailed solutions.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Feature icon="🧪" title={`${mocksCount} Full-length Mocks`} desc="Exam-pattern papers with section-wise analysis and subject SWOT. First mock free." />
          <Feature icon="📚" title={`${practiceQs}+ Practice Questions`} desc="Topic-wise practice across all subjects, each with worked solutions and instant grading." />
          <Feature icon="📊" title="SWOT Analytics" desc="Subject-wise strengths/weaknesses graphs. Time spent per question. Accuracy trend." />
          <Feature icon="🎯" title="NTA-style Live Portal" desc="Identical look to the real CBT — palette, mark-for-review, timer, auto-submit." />
          <Feature icon="🛡️" title="Server-side Grading" desc="Scores are computed on our servers — tamper-proof. Detailed report after every attempt." />
          <Feature icon="📱" title="Mobile-first" desc="Practice on phone or laptop — your progress syncs across devices." />
        </div>
      </section>

      {/* ---------- ABOUT US ---------- */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center">
          <span className="badge bg-brand/10 text-brand">About us</span>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">Built by miners, for miners.</h2>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            CrackGate is run by IIT Kharagpur Mining Engineering alumni who&apos;ve cleared GATE MN themselves.
            Every question, solution and analytic is curated by someone who&apos;s walked the same path.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 max-w-3xl mx-auto">
          <TeamCard
            initials="VY"
            name="Vikas Yadav"
            role="Founder"
            credentials="M.Tech, IIT Kharagpur"
          />
          <TeamCard
            initials="VK"
            name="Vishal Kumar"
            role="Co-founder"
            credentials="B.Tech, BIT Sindri · M.Tech, IIT Kharagpur · Coal India Limited"
          />
        </div>
        <div className="mt-8 text-center">
          <Link href="/about" className="text-sm font-semibold text-brand hover:underline">
            Read our story →
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-extrabold">Start your free mock now.</h2>
          <p className="mt-3 text-slate-300">No credit card. Takes 5 seconds with Google.</p>
          <Link href="/login" className="btn btn-accent btn-lg mt-6 inline-flex">Continue with Google →</Link>
        </div>
      </section>

      {/* Floating WhatsApp chat — landing page only */}
      <WhatsAppButton />
    </>
  );
}

function TeamCard({ initials, name, role, credentials }: { initials: string; name: string; role: string; credentials: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="shrink-0 w-14 h-14 rounded-full bg-brand/10 text-brand grid place-items-center font-bold text-lg">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-ink">{name}</div>
        <div className="text-xs uppercase tracking-wider text-muted font-semibold">{role}</div>
        <div className="text-sm text-ink/80 mt-1">{credentials}</div>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-white">{n}</div>
      <div className="text-xs uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{desc}</p>
    </div>
  );
}
