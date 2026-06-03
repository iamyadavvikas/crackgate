import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { BrandLockup } from "@/components/brand";
import { NavLink } from "@/components/nav-link";
import { MobileNav } from "@/components/mobile-nav";

export async function SiteHeader() {
  const session = await auth();
  const u = session?.user;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-line">
      <nav className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-3 sm:gap-6">
        <MobileNav authed={!!u} />
        <BrandLockup />

        {/* Primary nav — kept tight on purpose: ordered by daily-use frequency */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <NavLink href="/practice">Practice</NavLink>
          <NavLink href="/mocks">Mocks</NavLink>
          <NavLink href="/pyq">PYQs</NavLink>
          <NavLink href="/aits">AITS</NavLink>
          <NavLink href="/study">Notes</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {u ? (
            <UserMenu
              name={u.name ?? "Aspirant"}
              email={u.email ?? ""}
              image={u.image ?? undefined}
              plan={u.plan ?? "free"}
              role={u.role}
            />
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost text-sm hidden sm:inline-flex">Login</Link>
              <Link href="/login" className="btn btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
