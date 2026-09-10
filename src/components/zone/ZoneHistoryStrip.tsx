import { cn } from "@/ui/cn";
import type { ZoneHistoryRow } from "@/lib/zone.api";

const dot: Record<ZoneHistoryRow["zone"], string> = {
  green: "bg-zone-green",
  yellow: "bg-zone-yellow",
  red: "bg-zone-red",
};

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("no-NO", { day: "2-digit", month: "2-digit" });
}

export default function ZoneHistoryStrip({
  zones,
  bare = false,
}: {
  zones: ZoneHistoryRow[];
  /** Uten kort-ramme (når den ligger inne i et annet kort). */
  bare?: boolean;
}) {
  if (zones.length === 0) return null;

  const ordered = [...zones].sort((a, b) => (a.zone_date < b.zone_date ? -1 : 1));

  const body = (
    <>
      <h3 className="text-sm font-semibold text-ink">Siste 14 dager</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {ordered.map((z) => (
          <div key={z.id} className="flex flex-col items-center gap-1" title={z.computed_reason}>
            <span className={cn("h-3 w-3 rounded-full", dot[z.zone])} />
            <span className="text-[11px] text-ink-faint">{shortDate(z.zone_date)}</span>
          </div>
        ))}
      </div>
    </>
  );

  if (bare) return <div>{body}</div>;
  return <div className="rounded-lg border border-border bg-surface p-5 shadow-card">{body}</div>;
}
