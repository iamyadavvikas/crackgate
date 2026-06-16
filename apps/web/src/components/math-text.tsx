/**
 * MathText — renders authored question/solution text with embedded LaTeX.
 *
 * Supports:
 *   • Block math:   $$ ... $$   (KaTeX display mode)
 *   • Inline math:  $ ... $     (KaTeX inline mode)
 *   • **bold**      → <strong>
 *   • blank lines   → paragraph breaks, single newlines → <br/>
 *
 * Question banks store solutions as rich strings following the CrackGate
 * "matured solution" schema (Concept → Formula → Given data → Derivation →
 * Final answer). KaTeX requires its stylesheet — imported once in layout.tsx.
 */
import katex from "katex";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMath(src: string, display: boolean): string {
  try {
    return katex.renderToString(src.trim(), {
      displayMode: display,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return escapeHtml(src);
  }
}

function renderText(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

/** Convert a source string with $…$ / $$…$$ segments into safe HTML.
 *  Non-math text is HTML-escaped, so this is safe for dangerouslySetInnerHTML. */
export function toHtml(src: string): string {
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out += renderText(src.slice(last, m.index));
    if (m[1] != null) out += renderMath(m[1], true);
    else out += renderMath(m[2], false);
    last = re.lastIndex;
  }
  if (last < src.length) out += renderText(src.slice(last));
  return out;
}

export function MathText({ children, className }: { children?: string; className?: string }) {
  return (
    <div
      className={className}
      // KaTeX + authored content is trusted (no user input), rendered server/client side.
      dangerouslySetInnerHTML={{ __html: toHtml(children ?? "") }}
    />
  );
}
