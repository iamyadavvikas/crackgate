import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#4f46e5", 2: "#7c3aed" },
        accent: "#f59e0b",
        ok: "#16a34a",
        bad: "#dc2626",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        canvas: "rgb(var(--bg-rgb) / <alpha-value>)",
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
