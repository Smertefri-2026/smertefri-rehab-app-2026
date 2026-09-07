import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
    "./src/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",

        brand: "var(--brand)",
        "brand-ink": "var(--brand-ink)",
        "brand-soft": "var(--brand-soft)",

        // Legacy namespace — keep alongside the flat keys above so the
        // ~109 existing files using bg-sf-bg / text-sf-text / rounded-sf
        // etc. keep working unchanged. Do not remove until those files
        // are migrated (not required for the SmerteFri transformation).
        sf: {
          primary: "var(--sf-primary)",
          ink: "var(--sf-primary-ink)",
          soft: "var(--sf-primary-soft)",
          bg: "var(--sf-bg)",
          surface: "var(--sf-surface)",
          border: "var(--sf-border)",
          text: "var(--sf-text)",
          muted: "var(--sf-muted)",
        },
      },
      borderRadius: {
        app: "var(--radius)",
        sf: "var(--sf-radius)",
      },

      /**
       * Viktig for “tablet portrait vs landscape”
       * (kan justeres, men dette fungerer veldig bra i praksis)
       */
      screens: {
        sidebar: "900px", // slå på sidebar her
      },
    },
  },
  plugins: [],
};

export default config;
