/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#050816",
          muted: "#0B1220",
          subtle: "#101836",
        },
        surface: {
          DEFAULT: "#111827",
          raised: "#1E293B",
          tinted: "#1C2540",
        },
        primary: {
          DEFAULT: "#6366F1",
          foreground: "#F9FAFB",
          emphasis: "#4F46E5",
        },
        accent: {
          DEFAULT: "#22D3EE",
          foreground: "#0F172A",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#052E16",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#111827",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#111827",
        },
        text: {
          DEFAULT: "#F8FAFC",
          muted: "#CBD5F5",
          subtle: "#94A3B8",
        },
        divider: "#1F2A44",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        glow: "0 0 30px rgba(99, 102, 241, 0.35)",
        surface: "0 12px 40px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        "veil-gradient":
          "linear-gradient(135deg, rgba(31, 41, 90, 0.85), rgba(99, 102, 241, 0.25))",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      ringWidth: {
        3: "3px",
      },
      ringColor: {
        primary: "rgba(99, 102, 241, 0.45)",
      },
    },
  },
  plugins: [],
};
