import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/dashboard", "/mocks", "/pyq", "/practice", "/aits", "/study", "/settings", "/admin"];

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  if (needsAuth && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next|.*\\..*).*)"],
};
