"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  // Active when exact match or a deeper child route (e.g. /mocks/mn-mock-01 highlights "Mocks")
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "text-brand bg-brand/5"
          : "text-ink/70 hover:text-brand hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute left-3 right-3 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-brand to-accent"
        />
      )}
    </Link>
  );
}
