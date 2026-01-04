import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        sf: "var(--sf-radius)",
      },
    },
  },
  plugins: [],
};

export default config;