import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit tests for pure server-side logic (grading, NAT bands, …).
// Resolves the `@/*` path alias from tsconfig so tests import like the app does.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    // Playwright specs live under e2e/ and run with their own runner.
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
  },
});
