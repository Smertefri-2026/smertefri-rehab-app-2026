"use client";

import { cn } from "@/ui/cn";

type Option<T extends string> = { value: T; label: string };

/**
 * Enkeltvalg som «pills». Brukes i innsjekk, onboarding osv.
 */
export function ChoiceGroup<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  layout = "flow",
}: {
  label?: string;
  hint?: string;
  value: T | null;
  options: Option<T>[];
  onChange: (v: T) => void;
  /** "flow" = pills på rad; "stack" = full bredde-knapper (lengre etiketter). */
  layout?: "flow" | "stack";
}) {
  const stack = layout === "stack";
  return (
    <div className="space-y-2">
      {label && <p className="text-[13px] font-medium text-ink-soft">{label}</p>}
      <div className={cn(stack ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-wrap gap-2")}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "border text-sm font-medium transition-colors",
              stack ? "rounded-md px-4 py-2.5 text-left" : "rounded-full px-4 py-1.5",
              value === o.value
                ? "border-primary bg-primary-subtle text-primary-ink"
                : "border-border bg-surface text-ink-soft hover:bg-surface-alt"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="text-[13px] text-ink-faint">{hint}</p>}
    </div>
  );
}
