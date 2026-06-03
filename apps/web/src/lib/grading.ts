/** Shared graders for MCQ / MSQ / NAT questions. Used server-side so users
 *  can't tamper with scores via DevTools. Mirrors the grading rules from the
 *  static `pyq.html` portal: +marks for correct MCQ/MSQ/NAT, −marks/3 for
 *  wrong MCQ, 0 for skipped or wrong MSQ/NAT (GATE pattern). */

export type Question =
  | {
      type: "MCQ";
      marks: number;
      answer: number;
      options: string[];
      subject: string;
    }
  | {
      type: "MSQ";
      marks: number;
      answer: number[];
      options: string[];
      subject: string;
    }
  | {
      type: "NAT";
      marks: number;
      answer: number;
      tolerance?: number;
      subject: string;
    };

export type AnswerMap = Record<number, number | number[] | string | null | undefined>;

function isAnswered(a: AnswerMap[number]) {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

export function grade(questions: Question[], answers: AnswerMap) {
  let correct = 0,
    wrong = 0,
    skipped = 0,
    scored = 0,
    total = 0;
  const perSubject: Record<string, { scored: number; total: number }> = {};

  questions.forEach((q, i) => {
    total += q.marks;
    perSubject[q.subject] ??= { scored: 0, total: 0 };
    perSubject[q.subject].total += q.marks;

    const a = answers[i];
    if (!isAnswered(a)) {
      skipped++;
      return;
    }
    let ok = false;
    if (q.type === "NAT") {
      const v = typeof a === "string" ? parseFloat(a) : (a as number);
      ok = !Number.isNaN(v) && Math.abs(v - q.answer) <= (q.tolerance ?? 0);
    } else if (q.type === "MSQ") {
      const exp = [...q.answer].sort();
      const got = Array.isArray(a) ? [...a].sort() : [];
      ok = exp.length === got.length && exp.every((v, k) => v === got[k]);
    } else {
      ok = a === q.answer;
    }

    if (ok) {
      correct++;
      scored += q.marks;
      perSubject[q.subject].scored += q.marks;
    } else {
      wrong++;
      if (q.type === "MCQ") {
        scored -= q.marks / 3; // GATE negative marking
        perSubject[q.subject].scored -= q.marks / 3;
      }
    }
  });

  return {
    correct,
    wrong,
    skipped,
    scored: +scored.toFixed(2),
    total,
    breakdown: perSubject,
    accuracy: total ? Math.round((scored / total) * 100) : 0,
  };
}
