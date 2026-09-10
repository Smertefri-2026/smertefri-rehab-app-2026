import type { PainPoint } from "@/lib/progress.api";

/**
 * Liten trendlinje for smerte (0–10). Bevisst enkel, ingen chart-lib.
 */
export default function Sparkline({
  points,
  height = 64,
}: {
  points: PainPoint[];
  height?: number;
}) {
  if (points.length < 2) {
    return <p className="text-sm text-ink-faint">For lite data til å vise en trend ennå.</p>;
  }

  const W = 320;
  const H = height;
  const PAD = 6;
  const maxY = 10;

  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / maxY) * (H - PAD * 2);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.intensity).toFixed(1)}`).join(" ");
  const first = points[0].intensity;
  const last = points[points.length - 1].intensity;
  const delta = last - first;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Smerte-trend">
        <line x1={PAD} y1={y(5)} x2={W - PAD} y2={y(5)} stroke="var(--border)" strokeDasharray="3 3" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(points.length - 1)} cy={y(last)} r="3" fill="var(--primary)" />
      </svg>
      <p className="text-[13px] text-ink-soft">
        Smerte nå {last}/10 ·{" "}
        {delta === 0 ? (
          "uendret siste periode"
        ) : delta < 0 ? (
          <span className="text-success-ink">ned {Math.abs(delta)} fra start</span>
        ) : (
          <span className="text-warning-ink">opp {delta} fra start</span>
        )}
      </p>
    </div>
  );
}
