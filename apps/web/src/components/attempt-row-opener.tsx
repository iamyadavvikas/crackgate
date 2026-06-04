"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Wraps a table row so clicking anywhere on it sets `?attempt=<id>` —
 * AttemptDetailModal picks that up and renders. Keeps the row keyboard-
 * activatable too (role=button, Enter/Space).
 */
export function AttemptRowOpener({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const open = useCallback(() => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("attempt", id);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }, [router, params, id]);

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="border-b border-line/60 cursor-pointer hover:bg-canvas/40 focus:bg-canvas/40 outline-none"
    >
      {children}
    </tr>
  );
}
