import type { Config } from "tailwindcss";

/**
 * Fargene, radiene og skyggene defineres i src/styles/tokens.css og eksponeres
 * som Tailwind-utilities her. Bruk de semantiske nøklene (page, surface, ink,
 * primary, success/warning/danger, zone-*) i ny kode. `sf-*` og de flate
 * bg/text/brand-nøklene er bakoverkompatible aliaser — ikke bruk dem i nytt.
 */
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
        /* ── Semantiske roller (bruk disse) ── */
        page: "var(--page)",
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",

        border: "var(--border)",
        "border-strong": "var(--border-strong)",

        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",

        primary: "var(--primary)",
        "primary-ink": "var(--primary-ink)",
        "primary-subtle": "var(--primary-subtle)",
        accent: "var(--accent)",

        success: "var(--success)",
        "success-subtle": "var(--success-subtle)",
        "success-ink": "var(--success-ink)",
        warning: "var(--warning)",
        "warning-subtle": "var(--warning-subtle)",
        "warning-ink": "var(--warning-ink)",
        danger: "var(--danger)",
        "danger-subtle": "var(--danger-subtle)",
        "danger-ink": "var(--danger-ink)",

        "neutral-subtle": "var(--neutral-subtle)",
        "neutral-ink": "var(--neutral-ink)",
        "neutral-border": "var(--neutral-border)",

        "zone-green": "var(--zone-green)",
        "zone-green-subtle": "var(--zone-green-subtle)",
        "zone-green-ink": "var(--zone-green-ink)",
        "zone-yellow": "var(--zone-yellow)",
        "zone-yellow-subtle": "var(--zone-yellow-subtle)",
        "zone-yellow-ink": "var(--zone-yellow-ink)",
        "zone-red": "var(--zone-red)",
        "zone-red-subtle": "var(--zone-red-subtle)",
        "zone-red-ink": "var(--zone-red-ink)",

        /* ── Bakoverkompatible aliaser (ikke bruk i ny kode) ── */
        bg: "var(--bg)",
        text: "var(--text)",
        muted: "var(--muted)",
        brand: "var(--brand)",
        "brand-ink": "var(--brand-ink)",
        "brand-soft": "var(--brand-soft)",
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
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        app: "var(--radius)",
        sf: "var(--sf-radius)",
      },
      boxShadow: {
        card: "var(--shadow-sm)",
        pop: "var(--shadow-md)",
      },
      maxWidth: {
        content: "var(--content-max)",
        prose: "var(--prose-max)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        brand: ["var(--font-montserrat-alternates)", "var(--font-geist-sans)", "sans-serif"],
      },
      screens: {
        sidebar: "900px", // slår på sidebar
      },
    },
  },
  plugins: [],
};

export default config;
