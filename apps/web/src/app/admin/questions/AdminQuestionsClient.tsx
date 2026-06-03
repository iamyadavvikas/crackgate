"use client";
import { useState } from "react";
import Link from "next/link";

const SUBJECTS = [
  { slug: "engineering-mathematics", name: "Engineering Mathematics" },
  { slug: "general-aptitude",        name: "General Aptitude" },
  { slug: "mine-ventilation",        name: "Mine Ventilation" },
  { slug: "rock-mechanics",          name: "Rock Mechanics" },
  { slug: "surface-mining",          name: "Surface Mining" },
  { slug: "underground-mining",      name: "Underground Mining" },
  { slug: "drilling-blasting",       name: "Drilling & Blasting" },
  { slug: "mineral-processing",      name: "Mineral Processing" },
  { slug: "mine-surveying",          name: "Mine Surveying" },
  { slug: "mine-environment",        name: "Mine Environment & Safety" },
] as const;

const SAMPLE = {
  subjectSlug: "rock-mechanics",
  rebuildMocks: true,
  questions: [
    {
      topic: "Stress & Strain",
      difficulty: "medium",
      type: "MCQ",
      stem: "The unit of Young's modulus is:",
      options: ["N/m", "N/m²", "N·m", "N·m²"],
      answer: 1,
      solution: "Young's modulus has units of stress = N/m² (Pa).",
    },
    {
      topic: "Rock Mass Rating",
      difficulty: "hard",
      type: "NAT",
      stem: "If RMR of a rock mass is 62, classify it as 'Class' (1=Very Good ... 5=Very Poor). Enter the class number.",
      answer: 2,
      tolerance: 0,
      solution: "RMR 61–80 ⇒ Class II (Good Rock).",
    },
  ],
};

export default function AdminQuestionsClient() {
  const [subjectSlug, setSubjectSlug] = useState("rock-mechanics");
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE, null, 2));
  const [rebuildMocks, setRebuildMocks] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string; message?: string; appended?: number; newIds?: string[]; rebuiltMocks?: boolean; rebuildOutput?: string } | null>(null);

  async function onUpload() {
    setBusy(true);
    setResult(null);
    try {
      const parsed = JSON.parse(jsonText);
      const body = {
        subjectSlug: parsed.subjectSlug ?? subjectSlug,
        questions: parsed.questions ?? parsed,
        rebuildMocks,
      };
      const res = await fetch("/api/admin/questions/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ ok: false, error: "client_error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
  }

  function downloadSample() {
    const blob = new Blob([JSON.stringify(SAMPLE, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crackgate-questions-sample.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      {/* Uploader */}
      <section className="card p-6">
        <h2 className="font-bold text-lg">Upload questions</h2>
        <p className="text-xs text-muted mt-1">
          Appends to <code>data/practice.ts</code>, then optionally regenerates the 10 mocks. Dev-only by default.
        </p>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <label className="text-xs">
            <span className="text-muted">Subject (fallback if JSON omits it)</span>
            <select
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
              className="mt-1 w-full input"
            >
              {SUBJECTS.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs flex items-end gap-2">
            <input
              type="checkbox"
              checked={rebuildMocks}
              onChange={(e) => setRebuildMocks(e.target.checked)}
            />
            <span>Rebuild 10 mocks after upload</span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input type="file" accept="application/json" onChange={onFile} className="text-xs" />
          <button onClick={downloadSample} className="btn btn-ghost text-xs">⬇ Download sample JSON</button>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={20}
          spellCheck={false}
          className="mt-3 w-full font-mono text-[12px] p-3 border border-line rounded-md bg-slate-50"
        />

        <div className="mt-4 flex gap-2">
          <button onClick={onUpload} disabled={busy} className="btn btn-primary">
            {busy ? "Uploading…" : "Upload & rebuild"}
          </button>
          <Link href="/admin" className="btn btn-ghost">← Back to admin</Link>
        </div>

        {result && (
          <pre className="mt-4 p-3 bg-slate-900 text-slate-100 text-xs rounded-md overflow-auto max-h-72">
{JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>

      {/* Docs */}
      <aside className="card p-6 text-sm space-y-4">
        <div>
          <h3 className="font-bold">How questions flow into mocks</h3>
          <ol className="list-decimal pl-5 mt-2 text-xs text-ink/80 space-y-1.5">
            <li>Each subject = one editable JSON file under <code>apps/web/src/data/questions/practice/</code> (10 files).</li>
            <li>Each mock = one editable JSON file under <code>apps/web/src/data/questions/mocks/</code> (10 files: 01/09/10 full-syllabus, 02-08 subject-wise).</li>
            <li>Generator <code>scripts/build_mocks.ts</code> assembles mocks from the practice bank (10 GA + 25×1m + 30×2m).</li>
            <li>Set <code>&quot;locked&quot;: true</code> in any mock JSON to protect hand-edits from regen.</li>
            <li>Re-run any time: <code className="text-[11px]">npm run build:mocks</code> · only one: <code className="text-[11px]">--only=mn-mock-03</code> · force: <code className="text-[11px]">--force</code>.</li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Question schema</h3>
          <pre className="mt-2 p-3 bg-slate-50 border border-line text-[11px] rounded-md overflow-auto">
{`{
  "topic": "Stress & Strain",
  "difficulty": "easy" | "medium" | "hard",
  "type": "MCQ" | "MSQ" | "NAT",
  "stem": "…question text…",

  // MCQ / MSQ only:
  "options": ["A", "B", "C", "D"],
  "answer": 1                  // MCQ: index of correct
  // or:    [0, 2]             // MSQ: indices

  // NAT only:
  "answer": 1.5708,
  "tolerance": 0.01,           // optional, default 0.01

  "solution": "…explanation…"
}`}
          </pre>
          <p className="text-[11px] text-muted mt-1">IDs are auto-assigned as <code>{`{slug}-{difficulty}-{NNNN}`}</code>.</p>
        </div>

        <div>
          <h3 className="font-bold">Production workflow</h3>
          <p className="text-xs text-ink/80 mt-1">
            Runtime uploads write to the source tree, which is read-only on Vercel/Amplify/most hosts. For production:
          </p>
          <ol className="list-decimal pl-5 mt-2 text-xs text-ink/80 space-y-1.5">
            <li>Use this page on your laptop (or any dev environment).</li>
            <li>Commit the resulting diff of <code>data/practice.ts</code> + <code>data/mocks.ts</code> to git.</li>
            <li>Push → CI builds and deploys. New questions go live on next deploy.</li>
          </ol>
          <p className="text-[11px] text-muted mt-2">
            Want a true live-edit experience? Move the bank to Postgres next — say the word and I&apos;ll wire it.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Tips for good questions</h3>
          <ul className="list-disc pl-5 mt-2 text-xs text-ink/80 space-y-1">
            <li>Keep stems crisp; one concept per question.</li>
            <li>For MCQ, write 4 plausible distractors (no obvious wrong answers).</li>
            <li>NAT tolerance is absolute — set it relative to the expected magnitude.</li>
            <li>Always provide a 1–3 sentence solution; students rely on it.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
