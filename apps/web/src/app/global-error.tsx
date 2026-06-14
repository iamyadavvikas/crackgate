"use client";

// Captures uncaught errors in the React tree (root layout level) and reports
// them to Sentry before rendering a minimal fallback. No-op reporting until a
// DSN is configured.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>
            We&apos;ve been notified and are looking into it. Please refresh and
            try again.
          </p>
        </div>
      </body>
    </html>
  );
}
