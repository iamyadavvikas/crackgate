import { defineConfig, devices } from "@playwright/test";

// Post-deploy smoke tests. These run against a live, already-running site
// (prod by default) — they do NOT start a local server, so CI needs no DB.
// Override the target with PLAYWRIGHT_BASE_URL when testing a preview env.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://crackgate.in";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
