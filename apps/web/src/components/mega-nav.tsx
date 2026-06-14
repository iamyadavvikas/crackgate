"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CIL_ROWS } from "@/data/cil";

type Branch = { label: string; href: string };

const GATE_BRANCHES: Branch[] = [
  { label: "Mining (MN)", href: "/gate/mining" },
  { label: "Civil (CE)", href: "/gate/civil" },
  { label: "Geology (GG)", href: "/gate/geology" },
];

const PSU_BRANCHES: Branch[] = CIL_ROWS.map((r) => ({
  label: r.discipline,
  href: `/psu/cil/${r.slug}`,
}));

export function MegaNav() {
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on route change
  useEffect(() => setOpen(null), [pathname]);

  // Escape + outside click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const openMenu = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const triggerCls = (id: string, activeHrefs: string[]) =>
    cn(
      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      open === id || activeHrefs.some(isActive)
        ? "text-brand bg-brand/5"
        : "text-ink/70 hover:text-brand hover:bg-canvas",
    );

  return (
    <div ref={ref} className="hidden md:flex items-center gap-1 ml-4">
      {/* GATE */}
      <div className="relative" onMouseEnter={() => openMenu("gate")} onMouseLeave={scheduleClose}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open === "gate"}
          onClick={() => setOpen(open === "gate" ? null : "gate")}
          className={triggerCls("gate", ["/gate", "/learn", "/practice", "/mocks", "/aits", "/study", "/pricing"])}
        >
          GATE <Chevron open={open === "gate"} />
        </button>
        {open === "gate" && (
          <Panel className="w-72">
            {GATE_BRANCHES.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  isActive(b.href) ? "text-brand bg-brand/5" : "text-ink hover:bg-canvas",
                )}
              >
                {b.label}
              </Link>
            ))}
          </Panel>
        )}
      </div>

      {/* PSU */}
      <div className="relative" onMouseEnter={() => openMenu("psu")} onMouseLeave={scheduleClose}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open === "psu"}
          onClick={() => setOpen(open === "psu" ? null : "psu")}
          className={triggerCls("psu", ["/psu"])}
        >
          PSU <Chevron open={open === "psu"} />
        </button>
        {open === "psu" && (
          <Panel className="w-72">
            <Link
              href="/psu/cil"
              className="mb-1 block rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-canvas"
            >
              Coal India Limited (CIL)
            </Link>
            {PSU_BRANCHES.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm",
                  isActive(b.href) ? "text-brand bg-brand/5" : "text-muted hover:bg-canvas hover:text-ink",
                )}
              >
                {b.label}
              </Link>
            ))}
          </Panel>
        )}
      </div>

      {/* State Level */}
      <Link href="/state" className={triggerCls("state", ["/state"])}>
        State Level Exam
      </Link>

      {/* Diploma */}
      <Link href="/diploma" className={triggerCls("diploma", ["/diploma"])}>
        Diploma
      </Link>

      {/* News */}
      <Link href="/news" className={triggerCls("news", ["/news"])}>
        News
      </Link>

      {/* About */}
      <Link href="/about" className={triggerCls("about", ["/about"])}>
        About us
      </Link>
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="menu"
      className={cn(
        "absolute left-0 top-full mt-1 rounded-xl border border-line bg-surface p-3 shadow-pop",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform", open && "rotate-180")}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
