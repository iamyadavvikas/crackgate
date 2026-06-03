/** Edge-safe NextAuth config — NO Prisma, NO database calls.
 *  This is what `middleware.ts` imports so it can run on the Edge runtime.
 *  The full config (with Prisma adapter + DB callbacks) lives in `src/lib/auth.ts`
 *  and runs only in Node route handlers / server components. */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  // No providers here — middleware only needs session decoding, not sign-in flows.
  providers: [],
  callbacks: {
    // Minimal callback: just expose role to middleware via the JWT.
    // Role is set by the Node-side jwt callback when the token is first issued.
    authorized() { return true; },
    // Expose token.role / token.plan / token.uid on session.user so middleware
    // (which only sees authConfig) can read req.auth.user.role for /admin gating.
    async session({ session, token }) {
      if (session.user) {
        if (token.uid)  (session.user as { id?: string }).id   = token.uid as string;
        if (token.role) (session.user as { role?: string }).role = token.role as string;
        if (token.plan) (session.user as { plan?: string }).plan = token.plan as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
