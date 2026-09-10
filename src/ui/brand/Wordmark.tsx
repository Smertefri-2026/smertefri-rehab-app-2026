import { cn } from "@/ui/cn";

export type WordmarkTone = "on-light" | "on-dark";

/**
 * SmerteFri-ordmerket. Kun kundevendt merkevare — domener, ruter og
 * DB-navn er «smertefri». To-tone («Smerte»/«Fri») via designtokens.
 */
const toneClasses: Record<WordmarkTone, { smerte: string; fri: string }> = {
  "on-light": { smerte: "text-primary", fri: "text-accent" },
  "on-dark": { smerte: "text-white", fri: "text-accent" },
};

export function Wordmark({
  tone = "on-light",
  className,
}: {
  tone?: WordmarkTone;
  className?: string;
}) {
  const c = toneClasses[tone];
  return (
    <span
      className={cn("font-brand font-semibold tracking-tight", className)}
      aria-label="SmerteFri"
    >
      <span className={c.smerte}>Smerte</span>
      <span className={c.fri}>Fri</span>
    </span>
  );
}
