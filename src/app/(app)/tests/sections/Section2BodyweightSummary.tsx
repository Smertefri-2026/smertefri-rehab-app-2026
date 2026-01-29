"use client";

type Props = {
  periodLabel: string;
  baseline: number | null;
  latest: number | null;
  deltaPct: number | null;
  unitLabel: string;
  onOpen: () => void;
};

function fmtPct(v: number | null) {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${Math.round(v)}%`;
}

export default function Section2BodyweightSummary({
  periodLabel,
  baseline,
  latest,
  deltaPct,
  unitLabel,
  onOpen,
}: Props) {
  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF5EF] text-[#2F6B4F]">
              🏃
            </div>
            <div>
              <h3 className="text-base font-semibold text-sf-text">Egenvekt</h3>
              <p className="text-sm text-sf-muted">{periodLabel}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-sf-muted uppercase">Total endring</p>
            <p className="text-sm font-semibold text-[#2F6B4F]">{fmtPct(deltaPct)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <p>
            <span className="font-medium">Baseline:</span>{" "}
            {baseline == null ? "—" : `${baseline} ${unitLabel}`}
          </p>
          <p>
            <span className="font-medium">Siste test:</span>{" "}
            {latest == null ? "—" : `${latest} ${unitLabel}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-full bg-[#2F6B4F] py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Åpne Egenvekt-tester
        </button>
      </div>
    </section>
  );
}