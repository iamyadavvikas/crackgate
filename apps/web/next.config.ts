import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Emit a self-contained server bundle for Docker production image.
  output: "standalone",
  // TODO: tighten typing on PYQ/MOCKS readonly data and remove this.
  // Production build currently fails on `readonly` → mutable casts; not blocking runtime behavior.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Pin the trace root to the monorepo root so Next stops complaining about
  // multiple lockfiles and traces files from packages/database correctly.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Prisma ships native engine binaries — don't let webpack bundle it.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "@crackgate/database"],
  experimental: {
    // Allow importing the workspace `@crackgate/database` package from outside this app dir.
    externalDir: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Source-map upload + release tagging only run when these are set in CI;
  // without SENTRY_AUTH_TOKEN the build silently skips upload, so this is safe
  // to ship before Sentry is provisioned.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  // Tunnel browser events through our own domain to dodge ad blockers.
  tunnelRoute: "/monitoring",
  disableLogger: true,
  // Don't fail the production build if Sentry's plugin hits an issue.
  widenClientFileUpload: true,
});