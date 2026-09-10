"use client";

import { useEffect, useState } from "react";
import Sparkline from "./Sparkline";
import ZoneDistributionBar from "./ZoneDistributionBar";
import { TRAPP_STAGES } from "@/lib/trapp/stages";
import { getTrappHistory, type TrappHistoryRow } from "@/lib/trapp.api";
import {
  getAdherence,
  getPainTrend,
  getTestProgress,
  getZoneCounts,
  type Adherence,
  type PainPoint,
  type TestProgressRow,
  type ZoneCounts,
} from "@/lib/progress.api";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-ink-soft">{title}</h2>
      {children}
    </div>
  );
}

export default function ProgressOverview({ clientId }: { clientId: string }) {
  const [pain, setPain] = useState<PainPoint[]>([]);
  const [zones, setZones] = useState<ZoneCounts | null>(null);
  const [adherence, setAdherence] = useState<Adherence | null>(null);
  const [tests, setTests] = useState<TestProgressRow[]>([]);
  const [milestones, setMilestones] = useState<TrappHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, z, a, t, m] = await Promise.all([
          getPainTrend(clientId, 30),
          getZoneCounts(clientId, 30),
          getAdherence(clientId, 14),
          getTestProgress(clientId),
          getTrappHistory(clientId),
        ]);
        if (!alive) return;
        setPain(p);
        setZones(z);
        setAdherence(a);
        setTests(t);
        setMilestones(m);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [clientId]);

  if (loading) return <p className="text-sm text-ink-soft">Laster …</p>;

  return (
    <div className="space-y-4">
      <Card title="Smerte siste 30 dager">
        <Sparkline points={pain} />
      </Card>

      {zones && (
        <Card title="Sonen siste 30 dager">
          <ZoneDistributionBar counts={zones} />
        </Card>
      )}

      {adherence && adherence.logged > 0 && (
        <Card title="Gjennomføring siste 2 uker">
          <p className="text-sm text-ink">
            <span className="text-lg font-semibold">{adherence.completed}</span> økter gjennomført
            <span className="text-ink-faint"> · {adherence.logged} logget totalt</span>
          </p>
        </Card>
      )}

      {tests.length > 0 && (
        <Card title="Tester — start vs. nå">
          <ul className="space-y-2">
            {tests.map((t) => (
              <li key={t.metric_key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink">{t.metric_key}</span>
                <span className="text-ink-soft">
                  {t.baseline ?? "–"} → {t.latest ?? "–"}
                  {t.changePct != null && (
                    <span
                      className={
                        t.changePct > 0
                          ? "ml-2 font-medium text-success-ink"
                          : t.changePct < 0
                          ? "ml-2 font-medium text-warning-ink"
                          : "ml-2 text-ink-faint"
                      }
                    >
                      {t.changePct > 0 ? "+" : ""}
                      {t.changePct}%
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {milestones.length > 0 && (
        <Card title="Milepæler i Trappen">
          <ul className="space-y-2 text-sm">
            {milestones.map((m) => (
              <li key={m.id}>
                <span className="text-ink">
                  {m.from_stage ? `${TRAPP_STAGES[m.from_stage].label} → ` : "Start: "}
                  {TRAPP_STAGES[m.to_stage].label}
                </span>
                <span className="ml-2 text-xs text-ink-faint">
                  {new Date(m.created_at).toLocaleDateString("no-NO")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
