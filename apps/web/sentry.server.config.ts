// Sentry server-side init. No-op until SENTRY_DSN is set (empty DSN disables
// sending), so this is safe to ship before the DSN is provisioned.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Keep tracing light on a single small box; raise once we have headroom.
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  enabled: !!process.env.SENTRY_DSN,
});
