import type { ZoneCounts } from "@/lib/progress.api";

export default function ZoneDistributionBar({ counts }: { counts: ZoneCounts }) {
  if (counts.total === 0) {
    return <p className="text-sm text-ink-faint">Ingen soner registrert i perioden.</p>;
  }

  const seg = (n: number) => `${(n / counts.total) * 100}%`;

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-alt">
        {counts.green > 0 && <div className="bg-zone-green" style={{ width: seg(counts.green) }} />}
        {counts.yellow > 0 && <div className="bg-zone-yellow" style={{ width: seg(counts.yellow) }} />}
        {counts.red > 0 && <div className="bg-zone-red" style={{ width: seg(counts.red) }} />}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zone-green" /> {counts.green} grønne
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zone-yellow" /> {counts.yellow} gule
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zone-red" /> {counts.red} røde
        </span>
      </div>
    </div>
  );
}
