"use client";

import { useEffect, useState } from "react";

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
  return new Date(iso).toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Kundens lesevisning av Trappen. Brukes inne i «Min plan». */
export default function TrappenView() {
  const { userId } = useRole();

  const [state, setState] = useState<TrappStateRow | null | undefined>(undefined);
  const [history, setHistory] = useState<TrappHistoryRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      try {
        const [s, h] = await Promise.all([getTrappState(userId), getTrappHistory(userId)]);
        if (!alive) return;
        setState(s);
        setHistory(h);
      } catch {
        if (alive) setState(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  if (state === undefined) {
    return <p className="text-sm text-ink-soft">Laster Trappen …</p>;
  }

  if (!state) {
    return (
      <p className="text-sm text-ink-soft">
        Trappen din settes opp når kartleggingen er fullført.
      </p>
    );
  }

  const info = TRAPP_STAGES[state.current_stage];
  const next = nextStage(state.current_stage);

  return (
    <div className="space-y-4">
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
        <h3 className="text-sm font-semibold text-ink-soft">Hva skal til for neste trinn?</h3>
        <p className="mt-2 text-sm text-ink">{info.advanceCriteria}</p>
        {next && (
          <p className="mt-3 text-xs text-ink-faint">
            Neste trinn:{" "}
            <span className="font-medium text-ink-soft">{TRAPP_STAGES[next].label}</span> —{" "}
            {TRAPP_STAGES[next].goal} Rehabtreneren din avgjør når du er klar.
          </p>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <h3 className="text-sm font-semibold text-ink-soft">Historikk</h3>
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
  );
}
