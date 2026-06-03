import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/whatsapp";
import { authConfig } from "@/lib/auth.config";

// Only register Google if it's actually configured. Otherwise NextAuth crashes
// at boot trying to discover OAuth endpoints with empty client credentials.
const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

const providers: Provider[] = [];
if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Always ask the user to pick an account; smoother UX for shared devices
      authorization: { params: { prompt: "select_account" } },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  // JWT is required because the Credentials provider can't create database sessions.
  // Magic-link users still get a User row via the Prisma adapter.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    ...providers,
    // Dev-only impersonation: sign in as any seeded user by email.
    // Disabled automatically in production.
    ...(process.env.NODE_ENV !== "production"
      ? [
          Credentials({
            id: "dev-demo",
            name: "Dev demo",
            credentials: { email: { label: "Email", type: "email" } },
            async authorize(raw) {
              const email = String(raw?.email ?? "").trim().toLowerCase();
              if (!email) return null;
              const user = await db.user.findUnique({ where: { email } });
              if (!user) return null;
              await db.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
              });
              return { id: user.id, email: user.email, name: user.name, image: user.picture ?? null };
            },
          }),
        ]
      : []),
    Credentials({
      id: "whatsapp",
      name: "WhatsApp OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code:  { label: "OTP",   type: "text" },
      },
      async authorize(raw) {
        const phoneInput = String(raw?.phone ?? "");
        const code       = String(raw?.code ?? "");
        if (!/^\d{6}$/.test(code)) return null;
        const phone = normalizePhone(phoneInput);
        if (!isValidPhone(phone)) return null;

        const otp = await db.otpCode.findFirst({
          where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!otp || otp.attempts >= 5) return null;
        const ok = await bcrypt.compare(code, otp.codeHash);
        if (!ok) {
          await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
          return null;
        }

        // Find or create user. We don't have an email; synthesize a placeholder
        // that the user can change in their profile later.
        const placeholderEmail = `${phone}@wa.crackgate.in`;
        let user = await db.user.findUnique({ where: { phone } });
        if (!user) {
          user = await db.user.create({
            data: {
              phone,
              phoneVerified: new Date(),
              email: placeholderEmail,
              name: `User ${phone.slice(-4)}`,
              lastLoginAt: new Date(),
            },
          });
        } else {
          await db.user.update({
            where: { id: user.id },
            data: { phoneVerified: new Date(), lastLoginAt: new Date() },
          });
        }
        await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

        return { id: user.id, email: user.email, name: user.name, image: user.picture ?? null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as { id: string }).id;
      if (token.uid) {
        const full = await db.user.findUnique({
          where: { id: token.uid as string },
          select: { plan: true, role: true, picture: true, name: true, email: true },
        });
        if (full) {
          token.plan  = full.plan;
          token.role  = full.role;
          token.name  = full.name;
          token.email = full.email;
          if (full.picture) token.picture = full.picture;
        }
        // Elevate role to "admin" for emails in ADMIN_EMAILS env (founder access).
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        if (token.email && adminEmails.includes(String(token.email).toLowerCase())) {
          token.role = "admin";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id: string }).id = token.uid as string;
        (session.user as { plan?: string }).plan = token.plan as string | undefined;
        (session.user as { role?: string }).role = token.role as string | undefined;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Credentials providers already updated lastLoginAt in authorize().
      // For Google, the PrismaAdapter has just created/linked the User row,
      // so we bump lastLoginAt + capture the latest profile picture here.
      if (account?.provider === "google" && user.email) {
        await db.user.update({
          where: { email: user.email },
          data: {
            lastLoginAt: new Date(),
            image: user.image ?? undefined,
            picture: user.image ?? undefined,
          },
        }).catch(() => {/* first sign-in: adapter creates the user right after */});
      }
      return true;
    },
  },
  pages: { signIn: "/login" },
});
