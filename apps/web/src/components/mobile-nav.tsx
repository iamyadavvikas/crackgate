"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/practice", label: "Practice" },
  { href: "/mocks",    label: "Mocks" },
  { href: "/pyq",      label: "PYQs" },
  { href: "/aits",     label: "AITS" },
  { href: "/study",    label: "Notes" },
  { href: "/pricing",  label: "Pricing" },
];

export function MobileNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 -ml-1"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
          ) : (
            <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
          )}
        </svg>
      </button>

      {/* Overlay + panel */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition",
          open ? "visible" : "invisible pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-ink/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
        />
        <nav
          className={cn(
            "absolute top-0 right-0 h-full w-[82%] max-w-sm bg-white shadow-2xl",
            "flex flex-col transition-transform duration-200",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="h-16 flex items-center justify-between px-5 border-b border-line">
            <span className="font-bold">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12" /><path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-3 py-3">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-base font-medium",
                      active ? "bg-brand/10 text-brand" : "text-ink hover:bg-slate-100",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {!authed && (
            <div className="border-t border-line p-4 grid grid-cols-2 gap-2">
              <Link href="/login" className="btn btn-ghost justify-center">Login</Link>
              <Link href="/login" className="btn btn-primary justify-center">Get Started</Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
