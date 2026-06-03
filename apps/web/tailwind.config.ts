import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#4f46e5", 2: "#7c3aed" },
        accent: "#f59e0b",
        ok: "#16a34a",
        bad: "#dc2626",
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 16px rgba(15, 23, 42, .06)",
        pop: "0 20px 40px rgba(15, 23, 42, .12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
