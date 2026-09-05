import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#FBEAEE",
          100: "#F3CBD4",
          400: "#C13A54",
          500: "#A81C38", // primary — Amrita Crimson
          600: "#8B1730",
          700: "#6E1226",
        },
        indigo: {
          400: "#6366F1",
          500: "#4F46E5", // accent
          600: "#4338CA",
        },
        surface: {
          light: "#F8FAFC",
          dark: "#0F172A",
          "dark-card": "#141F38",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.08)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
        "glow-maroon": "0 0 0 1px rgba(168, 28, 56, 0.15), 0 4px 24px -4px rgba(168, 28, 56, 0.25)",
        "glow-indigo": "0 0 0 1px rgba(79, 70, 229, 0.15), 0 4px 24px -4px rgba(79, 70, 229, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(168, 28, 56, 0.35)" },
          "100%": { boxShadow: "0 0 0 12px rgba(168, 28, 56, 0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    // Glassmorphism utility classes
    function ({ addUtilities }: any) {
      addUtilities({
        ".glass": {
          "background-color": "rgba(255, 255, 255, 0.65)",
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
        },
        ".glass-dark": {
          "background-color": "rgba(20, 31, 56, 0.55)",
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        },
        ".glass-card": {
          "background-color": "rgba(255, 255, 255, 0.75)",
          "backdrop-filter": "blur(12px) saturate(160%)",
          "-webkit-backdrop-filter": "blur(12px) saturate(160%)",
          border: "1px solid rgba(15, 23, 42, 0.06)",
        },
      });
    },
  ],
};

export default config;
