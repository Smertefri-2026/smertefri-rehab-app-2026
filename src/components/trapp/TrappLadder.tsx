import { cn } from "@/ui/cn";
import { TRAPP_ORDER, TRAPP_STAGES, type TrappStage } from "@/lib/trapp/stages";

/**
 * Visuell fem-trinns trapp. Fylte trinn = passert/nåværende, nåværende
 * uthevet.
 */
export default function TrappLadder({
  current,
  className,
}: {
  current: TrappStage;
  className?: string;
}) {
  const currentIndex = TRAPP_STAGES[current].index;

  return (
    <ol className={cn("flex items-stretch gap-1.5", className)}>
      {TRAPP_ORDER.map((stage) => {
        const info = TRAPP_STAGES[stage];
        const passed = info.index < currentIndex;
        const isCurrent = info.index === currentIndex;
        return (
          <li key={stage} className="min-w-0 flex-1">
            <div
              className={cn(
                "rounded-md border px-1.5 py-2 text-center transition-colors",
                isCurrent
                  ? "border-primary bg-primary-subtle"
                  : passed
                  ? "border-transparent bg-primary/10"
                  : "border-border bg-surface"
              )}
            >
              <span
                className={cn(
                  "block truncate text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]",
                  isCurrent ? "text-primary-ink" : passed ? "text-primary-ink/70" : "text-ink-faint"
                )}
                title={info.label}
              >
                {info.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
