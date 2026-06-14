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

test("login page renders a sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
});

test("pricing page renders", async ({ page }) => {
  const res = await page.goto("/pricing");
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});
