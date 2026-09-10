"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import TrappLadder from "@/components/trapp/TrappLadder";
import { TRAPP_STAGES, nextStage } from "@/lib/trapp/stages";
import {
  getTrappHistory,
  getTrappState,
  type TrappHistoryRow,
  type TrappStateRow,
} from "@/lib/trapp.api";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("no-NO", { day: "2-digit", month: "long", year: "numeric" });
}

export default function TrappenPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();

  const [state, setState] = useState<TrappStateRow | null>(null);
  const [history, setHistory] = useState<TrappHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;
    if (role && role !== "client") {
      router.replace("/dashboard");
      return;
    }
    if (!userId) return;
    (async () => {
      try {
        const [s, h] = await Promise.all([getTrappState(userId), getTrappHistory(userId)]);
        setState(s);
        setHistory(h);
      } finally {
        setLoading(false);
      }
    })();
  }, [roleLoading, role, userId, router]);

  if (roleLoading || role !== "client" || loading) {
    return (
      <AppPage title="Trappen">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  if (!state) {
    return (
      <AppPage title="Trappen">
        <p className="text-sm text-ink-soft">
          Trappen din settes opp når kartleggingen er fullført.
        </p>
      </AppPage>
    );
  }

  const info = TRAPP_STAGES[state.current_stage];
  const next = nextStage(state.current_stage);

  return (
    <AppPage title="Trappen" subtitle="Reisen fra ro til frihet — ett trinn av gangen.">
      <div className="space-y-6">
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
          <TrappLadder current={state.current_stage} />
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-primary-ink">
              Du er på trinn {info.index + 1}: {info.label}
              {state.is_maintenance_mode && " · vedlikeholdsmodus"}
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">{info.goal}</p>
            <p className="mt-2 text-sm text-ink-soft">{info.clientFocus}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-soft">Hva skal til for neste trinn?</h2>
          <p className="mt-2 text-sm text-ink">{info.advanceCriteria}</p>
          {next && (
            <p className="mt-3 text-xs text-ink-faint">
              Neste trinn: <span className="font-medium text-ink-soft">{TRAPP_STAGES[next].label}</span> —{" "}
              {TRAPP_STAGES[next].goal} Rehabtreneren din avgjør når du er klar.
            </p>
          )}
        </div>

        {history.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-soft">Historikk</h2>
            <ul className="mt-3 space-y-3">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <span className="text-ink">
                    {h.from_stage ? `${TRAPP_STAGES[h.from_stage].label} → ` : "Start: "}
                    {TRAPP_STAGES[h.to_stage].label}
                  </span>
                  <span className="ml-2 text-xs text-ink-faint">{fmt(h.created_at)}</span>
                  <p className="text-ink-soft">{h.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppPage>
  );
}
