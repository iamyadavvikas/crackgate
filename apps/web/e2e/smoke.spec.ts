import { expect, test } from "@playwright/test";

// Smoke tests: verify the deployed site renders its critical pages and the
// health endpoint is green. Kept intentionally shallow and resilient — they
// guard against broken deploys (white screens, 500s), not feature behaviour.

test("health endpoint returns ok", async ({ request }) => {
  const res = await request.get("/api/healthz");
  expect(res.ok()).toBeTruthy();
});

test("homepage renders the hero and core copy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CrackGate/i);
  await expect(
    page.getByRole("heading", { name: /crack GATE MN/i }),
  ).toBeVisible();
});

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/login");
  // "Welcome back" is server-rendered regardless of which auth providers are
  // enabled, so it's the stable smoke signal that the route isn't 500/blank.
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("pricing page renders", async ({ page }) => {
  const res = await page.goto("/pricing");
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});
