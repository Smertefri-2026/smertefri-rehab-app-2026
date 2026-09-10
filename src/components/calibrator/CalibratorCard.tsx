"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Minus, ArrowDownRight, Check, X } from "lucide-react";

import { Button } from "@/ui/components/Button";
import { cn } from "@/ui/cn";
import {
  getCalibratorView,
  logCalibratorDecision,
  decisionIsFresh,
  type CalibratorView,
} from "@/lib/calibrator.api";

const KIND_META = {
  expand: {
    label: "Øk belastningen",
    icon: ArrowUpRight,
    tone: "border-transparent bg-success-subtle",
    ink: "text-success-ink",
  },
  hold: {
    label: "Hold nivået",
    icon: Minus,
    tone: "border-border bg-surface",
    ink: "text-ink-soft",
  },
  retreat: {
    label: "Trapp ned",
    icon: ArrowDownRight,
    tone: "border-transparent bg-warning-subtle",
    ink: "text-warning-ink",
  },
} as const;

/**
 * Kalibratoren — beslutningsstøtte for treneren på kundesiden. Viser dagens
 * forslag med begrunnelsen i klartekst. Anvender aldri noe selv: treneren
 * følger eller avviser, og handler videre med Trapp-/programkontrollene.
 */
export default function CalibratorCard({ clientId }: { clientId: string }) {
  const [view, setView] = useState<CalibratorView | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [showDismiss, setShowDismiss] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setView(await getCalibratorView(clientId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke hente Kalibratoren");
      setView(null);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (view === undefined) return null;

  if (view === null) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-soft">Kalibratoren</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {error ??
            "Kalibratoren starter når kunden har fullført kartleggingen og har et startpunkt i Trappen."}
        </p>
      </section>
    );
  }

  const { suggestion, input, lastEvent, hasEnoughData } = view;
  const meta = KIND_META[suggestion.kind];
  const Icon = meta.icon;
  const alreadyHandled = decisionIsFresh(lastEvent, suggestion.kind);

  async function decide(decision: "followed" | "dismissed") {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await logCalibratorDecision(clientId, suggestion, input, decision, note);
      setNote("");
      setShowDismiss(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke lagre avgjørelsen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={cn("space-y-4 rounded-lg border p-6 shadow-card", meta.tone)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-soft">Kalibratoren</h2>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-2.5 py-1 text-xs font-semibold",
            meta.ink
          )}
        >
          <Icon size={13} />
          {meta.label}
        </span>
      </div>

      <div>
        <p className="text-base font-semibold text-ink">{suggestion.headline}</p>
        <p className="mt-1.5 text-sm text-ink-soft">{suggestion.reasoning}</p>
      </div>

      <div className="rounded-md bg-surface/70 p-3">
        <p className="text-[13px] font-semibold text-ink-soft">Forslag til handling</p>
        <p className="mt-1 text-sm text-ink">{suggestion.action.detail}</p>
      </div>

      {!hasEnoughData && (
        <p className="text-xs text-ink-faint">
          Foreløpig tynt datagrunnlag — forslaget blir sikrere etter noen flere dager med innsjekk.
        </p>
      )}

      {error && <p className="text-sm text-danger-ink">{error}</p>}

      {alreadyHandled ? (
        <p className="text-xs text-ink-faint">
          {lastEvent?.trainer_decision === "followed" ? "Fulgt" : "Avvist"}{" "}
          {lastEvent?.decided_at &&
            `· ${new Date(lastEvent.decided_at).toLocaleDateString("no-NO")}`}
          {lastEvent?.trainer_note && ` — «${lastEvent.trainer_note}»`}
        </p>
      ) : showDismiss ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kort begrunnelse (valgfritt) — hvorfor avviker du fra forslaget?"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-page"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => decide("dismissed")} disabled={busy}>
              Bekreft avvisning
            </Button>
            <button
              type="button"
              onClick={() => setShowDismiss(false)}
              className="text-xs text-ink-soft hover:underline"
            >
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => decide("followed")} disabled={busy}>
            <Check size={14} /> Følg forslaget
          </Button>
          <button
            type="button"
            onClick={() => setShowDismiss(true)}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface"
          >
            <X size={14} /> Avvis
          </button>
          {suggestion.kind !== "hold" && (
            <span className="text-xs text-ink-faint">
              Deretter: bruk {suggestion.kind === "retreat" ? "Program-" : "Program-/Trapp-"}
              kontrollen under.
            </span>
          )}
        </div>
      )}
    </section>
  );
}
