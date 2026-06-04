"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Three-state theme toggle: system → light → dark → system.
 * Persists to `cg.theme` localStorage. Pairs with the anti-FOUC script
 * in `app/layout.tsx` which reads the same key before paint.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "dark" || t === "light") setTheme(t);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("cg.theme", next); } catch {}
  }

  // Render a stable placeholder pre-mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-line text-muted ${className}`}
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-line text-ink hover:bg-canvas transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  );
}
