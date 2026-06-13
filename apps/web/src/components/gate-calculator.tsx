"use client";

/**
 * GATE Virtual Scientific Calculator (native, in-built)
 * -----------------------------------------------------
 * A self-contained re-creation of the TCS iON / GATE on-screen scientific
 * calculator. No external page / iframe — everything runs in-app so it can be
 * embedded over the Practice / Mock / PYQ runners with no cross-origin issues.
 *
 * • Mouse-click driven, draggable (via the title bar) and closable.
 * • Safe expression evaluator (tokenizer + shunting-yard → RPN), no eval().
 * • Full function set: trig + inverse, hyperbolic + inverse, ln/log/log2/logyx,
 *   powers/roots (x², x³, xʸ, √, ∛, ʸ√x), eˣ, 10ˣ, n!, |x|, 1/x, %, mod,
 *   Deg/Rad, memory (MC/MR/MS/M+/M-), π and e.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AngleMode = "DEG" | "RAD";

/* ------------------------------------------------------------------ */
/* Safe expression evaluator (tokenizer + shunting-yard)              */
/* ------------------------------------------------------------------ */

const FUNCS = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan",
  "sinh", "cosh", "tanh", "asinh", "acosh", "atanh",
  "ln", "log", "log2", "sqrt", "cbrt", "exp", "abs",
]);

const OPS: Record<string, { prec: number; right?: boolean }> = {
  "+": { prec: 2 },
  "-": { prec: 2 },
  "*": { prec: 3 },
  "/": { prec: 3 },
  mod: { prec: 3 },
  rt: { prec: 3 },     // a rt b  →  b^(1/a)  (a-th root of b)
  logb: { prec: 3 },   // a logb b → log base a of b
  "^": { prec: 4, right: true },
  u: { prec: 5, right: true }, // unary minus
};

function tokenize(src: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < src.length && /[0-9.eE]/.test(src[i])) {
        if ((src[i] === "e" || src[i] === "E") && !/[0-9+\-]/.test(src[i + 1] ?? "")) break;
        if ((src[i] === "+" || src[i] === "-") && !(src[i - 1] === "e" || src[i - 1] === "E")) break;
        num += src[i];
        i++;
      }
      tokens.push(num);
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      // name: starts with a letter, may contain trailing digits (e.g. log2)
      let name = "";
      while (i < src.length && /[a-zA-Z0-9]/.test(src[i])) { name += src[i]; i++; }
      tokens.push(name);
      continue;
    }
    tokens.push(c);
    i++;
  }
  return tokens;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isFinite(n)) return NaN;
  const k = Math.round(n);
  if (Math.abs(n - k) > 1e-9) return NaN;
  let r = 1;
  for (let j = 2; j <= k; j++) r *= j;
  return r;
}

function evaluate(expr: string, angle: AngleMode): number {
  const raw = tokenize(expr);
  const output: string[] = [];
  const stack: string[] = [];
  let prev: string | null = null;

  const toRad = (x: number) => (angle === "DEG" ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (angle === "DEG" ? (x * 180) / Math.PI : x);

  for (let idx = 0; idx < raw.length; idx++) {
    let t = raw[idx];

    if (/^[0-9.]/.test(t)) {
      output.push(t);
    } else if (t === "pi") {
      output.push(String(Math.PI));
    } else if (t === "e") {
      output.push(String(Math.E));
    } else if (FUNCS.has(t)) {
      stack.push(t);
    } else if (t === "(") {
      stack.push(t);
    } else if (t === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop()!);
      stack.pop();
      if (stack.length && FUNCS.has(stack[stack.length - 1])) output.push(stack.pop()!);
    } else if (t === "!" || t === "%") {
      output.push(t); // postfix
    } else if (t in OPS || t === "-" || t === "+") {
      const isUnary = (t === "-" || t === "+")
        ? prev === null || prev === "(" || prev in OPS || prev === "u"
        : false;
      if (isUnary && t === "-") t = "u";
      else if (isUnary && t === "+") { prev = t; continue; }
      while (
        stack.length &&
        stack[stack.length - 1] !== "(" &&
        (FUNCS.has(stack[stack.length - 1]) ||
          (stack[stack.length - 1] in OPS &&
            (OPS[stack[stack.length - 1]].prec > OPS[t].prec ||
              (OPS[stack[stack.length - 1]].prec === OPS[t].prec && !OPS[t].right))))
      ) {
        output.push(stack.pop()!);
      }
      stack.push(t);
    }
    prev = t;
  }
  while (stack.length) output.push(stack.pop()!);

  const st: number[] = [];
  for (const t of output) {
    if (/^[0-9.]/.test(t)) {
      st.push(parseFloat(t));
    } else if (t === "!") {
      st.push(factorial(st.pop()!));
    } else if (t === "%") {
      st.push(st.pop()! / 100);
    } else if (t === "u") {
      st.push(-st.pop()!);
    } else if (FUNCS.has(t)) {
      const x = st.pop()!;
      let r: number;
      switch (t) {
        case "sin": r = Math.sin(toRad(x)); break;
        case "cos": r = Math.cos(toRad(x)); break;
        case "tan": r = Math.tan(toRad(x)); break;
        case "asin": r = fromRad(Math.asin(x)); break;
        case "acos": r = fromRad(Math.acos(x)); break;
        case "atan": r = fromRad(Math.atan(x)); break;
        case "sinh": r = Math.sinh(x); break;
        case "cosh": r = Math.cosh(x); break;
        case "tanh": r = Math.tanh(x); break;
        case "asinh": r = Math.asinh(x); break;
        case "acosh": r = Math.acosh(x); break;
        case "atanh": r = Math.atanh(x); break;
        case "ln": r = Math.log(x); break;
        case "log": r = Math.log10(x); break;
        case "log2": r = Math.log2(x); break;
        case "sqrt": r = Math.sqrt(x); break;
        case "cbrt": r = Math.cbrt(x); break;
        case "exp": r = Math.exp(x); break;
        case "abs": r = Math.abs(x); break;
        default: r = NaN;
      }
      st.push(r);
    } else {
      const b = st.pop()!;
      const a = st.pop()!;
      switch (t) {
        case "+": st.push(a + b); break;
        case "-": st.push(a - b); break;
        case "*": st.push(a * b); break;
        case "/": st.push(a / b); break;
        case "^": st.push(Math.pow(a, b)); break;
        case "mod": st.push(a % b); break;
        case "rt": st.push(Math.sign(b) * Math.pow(Math.abs(b), 1 / a)); break;
        case "logb": st.push(Math.log(b) / Math.log(a)); break;
        default: st.push(NaN);
      }
    }
  }
  return st.length === 1 ? st[0] : NaN;
}

/* ------------------------------------------------------------------ */
/* Keypad layout (display labels) — TCS iON-style grouping            */
/* ------------------------------------------------------------------ */

// Exact TCS iON layout: each row keeps the original button order; rows have
// different button counts (8 / 10 / 11 / 11 / 10 / 10) and each row stretches
// to the full keypad width, so button widths vary slightly per row.
const ROWS: string[][] = [
  ["mod", "Deg", "Rad", "MC", "MR", "MS", "M+", "M-"],
  ["sinh", "cosh", "tanh", "Exp", "(", ")", "←", "C", "+/-", "√"],
  ["sinh⁻¹", "cosh⁻¹", "tanh⁻¹", "log₂x", "ln", "log", "7", "8", "9", "/", "%"],
  ["π", "e", "n!", "logyx", "eˣ", "10ˣ", "4", "5", "6", "*", "1/x"],
  ["sin", "cos", "tan", "xʸ", "x³", "x²", "1", "2", "3", "-"],
  ["sin⁻¹", "cos⁻¹", "tan⁻¹", "y√x", "∛", "|x|", "0", ".", "+", "="],
];

// Literal class names so Tailwind keeps them in the build.
const COLS: Record<number, string> = {
  8: "grid-cols-8",
  10: "grid-cols-10",
  11: "grid-cols-11",
};

const DIGITS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]);

/* ------------------------------------------------------------------ */
/* Calculator window                                                  */
/* ------------------------------------------------------------------ */

const CALC_W = 470;

export function GateCalculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("0");
  const [angle, setAngle] = useState<AngleMode>("DEG");
  const [memory, setMemory] = useState(0);
  const [justEvaluated, setJustEvaluated] = useState(false);

  // ---- draggable window ----
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    setPos({ x: Math.max(12, window.innerWidth - CALC_W - 24), y: 84 });
  }, []);

  const onPointerDownHeader = (e: React.PointerEvent) => {
    if (!pos) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({
      x: Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 80),
      y: Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 60),
    });
  };
  const onPointerUp = () => { drag.current = null; };

  // ---- input ----
  const append = useCallback((s: string) => {
    setExpr((prev) => {
      if (justEvaluated) {
        setJustEvaluated(false);
        const startsFresh = /^[0-9.]$/.test(s) || s === "pi" || s === "e" || s.endsWith("(");
        return startsFresh ? s : prev + s;
      }
      return prev + s;
    });
  }, [justEvaluated]);

  const compute = useCallback(() => {
    if (!expr.trim()) return;
    // auto-balance any open parentheses
    const opens = (expr.match(/\(/g) || []).length;
    const closes = (expr.match(/\)/g) || []).length;
    const balanced = expr + ")".repeat(Math.max(0, opens - closes));
    const r = evaluate(balanced, angle);
    if (Number.isNaN(r) || !Number.isFinite(r)) {
      setResult("Error");
    } else {
      const out = Math.abs(r) >= 1e12 || (Math.abs(r) < 1e-6 && r !== 0)
        ? r.toExponential(8)
        : String(parseFloat(r.toPrecision(12)));
      setResult(out);
      setExpr(out);
      setJustEvaluated(true);
    }
  }, [expr, angle]);

  const press = useCallback((label: string) => {
    if (DIGITS.has(label)) { append(label); return; }
    switch (label) {
      case "=": compute(); return;
      case "C": setExpr(""); setResult("0"); setJustEvaluated(false); return;
      case "←": setExpr((e) => e.slice(0, -1)); return;
      case "Deg": setAngle("DEG"); return;
      case "Rad": setAngle("RAD"); return;
      case "MC": setMemory(0); return;
      case "MR": append(String(memory)); return;
      case "MS": setMemory(parseFloat(result) || 0); return;
      case "M+": setMemory((m) => m + (parseFloat(result) || 0)); return;
      case "M-": setMemory((m) => m - (parseFloat(result) || 0)); return;
      case "+": append("+"); return;
      case "-": append("-"); return;
      case "*": append("*"); return;
      case "/": append("/"); return;
      case "(": append("("); return;
      case ")": append(")"); return;
      case "%": append("%"); return;
      case "mod": append(" mod "); return;
      case "+/-":
        setExpr((e) => {
          const s = e || (result !== "0" ? result : "");
          if (!s) return "-(";
          if (s.startsWith("-(") && s.endsWith(")")) return s.slice(2, -1);
          return `-(${s})`;
        });
        setJustEvaluated(false);
        return;
      case "π": append("pi"); return;
      case "e": append("e"); return;
      case "n!": append("!"); return;
      case "Exp": append("E"); return;
      case "1/x": setExpr((e) => `1/(${e || result})`); setJustEvaluated(false); return;
      case "|x|": append("abs("); return;
      case "√": append("sqrt("); return;
      case "∛": append("cbrt("); return;
      case "y√x": append(" rt "); return;
      case "x²": append("^2"); return;
      case "x³": append("^3"); return;
      case "xʸ": append("^"); return;
      case "ln": append("ln("); return;
      case "log": append("log("); return;
      case "log₂x": append("log2("); return;
      case "logyx": append(" logb "); return;
      case "eˣ": append("exp("); return;
      case "10ˣ": append("10^("); return;
      case "sin": append("sin("); return;
      case "cos": append("cos("); return;
      case "tan": append("tan("); return;
      case "sin⁻¹": append("asin("); return;
      case "cos⁻¹": append("acos("); return;
      case "tan⁻¹": append("atan("); return;
      case "sinh": append("sinh("); return;
      case "cosh": append("cosh("); return;
      case "tanh": append("tanh("); return;
      case "sinh⁻¹": append("asinh("); return;
      case "cosh⁻¹": append("acosh("); return;
      case "tanh⁻¹": append("atanh("); return;
      default: return;
    }
  }, [append, compute, memory, result]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[60] max-w-[96vw] select-none rounded-md border border-slate-500 bg-slate-300 shadow-2xl"
      style={{ left: pos.x, top: pos.y, width: CALC_W }}
      role="dialog"
      aria-label="Scientific calculator"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Title bar (drag handle) */}
      <div
        onPointerDown={onPointerDownHeader}
        className="flex items-center gap-2 px-2 py-1.5 rounded-t-md bg-gradient-to-b from-slate-600 to-slate-700 text-white cursor-move touch-none"
      >
        <span className="text-xs font-semibold tracking-wide">Scientific Calculator</span>
        <button
          onClick={onClose}
          aria-label="Close calculator"
          className="ml-auto w-6 h-6 grid place-items-center rounded-sm bg-slate-500/40 hover:bg-red-500"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12" /><path d="M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Display — two rows: top = expression entry, bottom = result */}
      <div className="px-2 pt-2">
        <div className="relative rounded-sm border border-slate-500 bg-white px-2 pt-1 pb-1 shadow-inner">
          <span className="absolute left-1.5 top-0.5 text-[9px] font-bold text-slate-500">{memory !== 0 ? "M" : ""}</span>
          <span className="absolute right-1.5 top-0.5 text-[9px] font-semibold text-slate-500">{angle}</span>
          {/* Top row: what the user is entering */}
          <div className="text-right font-mono text-xs text-slate-500 truncate min-h-[18px] leading-[18px] pt-2">
            {expr || "\u00A0"}
          </div>
          {/* Bottom row: the computed result */}
          <div className="text-right font-mono text-2xl font-semibold text-slate-900 truncate min-h-[30px] leading-[30px] border-t border-slate-200 mt-0.5">
            {result}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="p-2 space-y-1">
        {ROWS.map((row, r) => (
          <div key={r} className={cn("grid gap-1", COLS[row.length])}>
            {row.map((label, c) => {
              const active = (label === "Deg" && angle === "DEG") || (label === "Rad" && angle === "RAD");
              const tone: "red" | "green" | undefined =
                label === "←" || label === "C" || label === "+/-" ? "red"
                : label === "=" ? "green"
                : undefined;
              return (
                <Btn key={`${label}-${r}-${c}`} active={active} tone={tone} onClick={() => press(label)}>
                  {label}
                </Btn>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Btn({
  children, onClick, active, tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  tone?: "red" | "green";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-[3px] border text-[10px] font-medium leading-none grid place-items-center px-0.5 transition active:translate-y-px",
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-inner"
          : tone === "red"
          ? "border-red-700 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold hover:from-red-400 hover:to-red-500"
          : tone === "green"
          ? "border-green-700 bg-gradient-to-b from-green-500 to-green-600 text-white font-semibold hover:from-green-400 hover:to-green-500"
          : "border-slate-400 bg-gradient-to-b from-white to-slate-200 text-slate-800 hover:from-slate-50 hover:to-slate-300 active:from-slate-200 active:to-slate-300",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Floating launch button + calculator toggle (shared)               */
/* ------------------------------------------------------------------ */

export function CalculatorLauncher({ floating = true }: { floating?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {floating ? (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open virtual calculator"
          className={cn(
            "fixed bottom-20 right-3 lg:bottom-6 lg:right-6 z-[55] inline-flex items-center gap-2 rounded-full px-4 h-12 shadow-lg text-sm font-semibold transition",
            open ? "bg-brand-2 text-white" : "bg-brand text-white hover:bg-brand-2",
          )}
          title="Virtual calculator"
        >
          <span className="text-lg leading-none">🧮</span>
          <span>{open ? "Close" : "Calculator"}</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md px-3 py-1.5 text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition"
          title="Virtual calculator"
        >
          🧮 Calculator
        </button>
      )}
      {open && <GateCalculator onClose={() => setOpen(false)} />}
    </>
  );
}
