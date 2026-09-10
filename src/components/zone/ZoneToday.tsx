import { ZoneBadge } from "@/ui/components/ZoneBadge";
import type { ZoneHistoryRow } from "@/lib/zone.api";

/**
 * Dagens Sone med begrunnelse. Grønn/gul er selvstyrt veiledning; rød
 * betyr «vent på treneren» før progresjon fortsetter.
 */
const guidance: Record<ZoneHistoryRow["zone"], string> = {
  green: "Kjør på som planlagt. Juster underveis hvis noe kjennes annerledes.",
  yellow: "Tilpass dagen. Hold tempoet, ikke øk belastningen i dag.",
  red: "Hold igjen i dag. Rehabtreneren din ser dette og tar kontakt ved behov.",
};

export default function ZoneToday({ zone }: { zone: ZoneHistoryRow }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Sonen din i dag</h2>
        <ZoneBadge zone={zone.zone} />
      </div>

      <p className="text-sm text-ink-soft">{zone.computed_reason}</p>

      <p className="rounded-md bg-surface-alt px-4 py-3 text-sm text-ink">{guidance[zone.zone]}</p>

      {zone.trainer_overridden && (
        <p className="text-xs text-ink-faint">
          Rehabtreneren din har justert sonen manuelt
          {zone.trainer_override_note ? `: ${zone.trainer_override_note}` : "."}
        </p>
      )}
    </div>
  );
}
