import { cn } from "@/ui/cn";

/** Sonen — kundens daglige status. */
export type Zone = "green" | "yellow" | "red";

const zoneConfig: Record<Zone, { label: string; classes: string; dot: string }> = {
  green: {
    label: "Grønn sone",
    classes: "bg-zone-green-subtle text-zone-green-ink",
    dot: "bg-zone-green",
  },
  yellow: {
    label: "Gul sone",
    classes: "bg-zone-yellow-subtle text-zone-yellow-ink",
    dot: "bg-zone-yellow",
  },
  red: {
    label: "Rød sone",
    classes: "bg-zone-red-subtle text-zone-red-ink",
    dot: "bg-zone-red",
  },
};

export function ZoneBadge({
  zone,
  label,
  className,
}: {
  zone: Zone;
  /** Overstyr standardteksten («Grønn sone» osv.). */
  label?: string;
  className?: string;
}) {
  const c = zoneConfig[zone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        c.classes,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", c.dot)} aria-hidden />
      {label ?? c.label}
    </span>
  );
}
