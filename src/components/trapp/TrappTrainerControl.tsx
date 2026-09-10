"use client";

import { useCallback, useEffect, useState } from "react";
import TrappLadder from "@/components/trapp/TrappLadder";
import { Button } from "@/ui/components/Button";
import { Field, Textarea } from "@/ui/components/Field";
import { ChoiceGroup } from "@/ui/components/ChoiceGroup";
import { TRAPP_ORDER, TRAPP_STAGES, type TrappStage } from "@/lib/trapp/stages";
import { getTrappState, transitionStage, type TrappStateRow } from "@/lib/trapp.api";

/** Rehabtrener/admin: se og endre kundens Trapp-trinn. */
export default function TrappTrainerControl({ clientId }: { clientId: string }) {
  const [state, setState] = useState<TrappStateRow | null | undefined>(undefined);
  const [target, setTarget] = useState<TrappStage | null>(null);
  const [reason, setReason] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getTrappState(clientId)
      .then((s) => {
        setState(s);
        setTarget(s?.current_stage ?? "ro");
        setMaintenance(s?.is_maintenance_mode ?? false);
      })
      .catch(() => setState(null));
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === undefined) return null;

  const current = state?.current_stage ?? null;
  const changed = target !== current || maintenance !== (state?.is_maintenance_mode ?? false);

  async function handleApply() {
    if (!target || !changed || busy) return;
    if (!reason.trim()) {
      setError("Skriv en kort begrunnelse for endringen.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await transitionStage(clientId, target, reason.trim(), maintenance);
      setReason("");
      load();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke endre trinn");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-ink-soft">Trappen</h2>

      {!state ? (
        <p className="text-sm text-ink-soft">
          Kunden har ikke satt startpunkt ennå (skjer når kartleggingen er fullført).
        </p>
      ) : (
        <>
          <TrappLadder current={state.current_stage} />
          <p className="text-sm text-ink-soft">
            Nå: <span className="font-medium text-ink">{TRAPP_STAGES[state.current_stage].label}</span>
            {state.is_maintenance_mode && " · vedlikeholdsmodus"} — siden{" "}
            {new Date(state.entered_stage_at).toLocaleDateString("no-NO")}
          </p>
        </>
      )}

      <ChoiceGroup
        label="Sett trinn"
        value={target}
        onChange={setTarget}
        options={TRAPP_ORDER.map((s) => ({ value: s, label: TRAPP_STAGES[s].label }))}
      />

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={maintenance}
          onChange={(e) => setMaintenance(e.target.checked)}
        />
        Vedlikeholdsmodus (målet er nådd, parkert på dette trinnet)
      </label>

      <Field label="Begrunnelse" hint="Vises for kunden i historikken.">
        <Textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="F.eks. «bestått bevegelseskvalitetstest, stabil grønn sone i to uker»"
        />
      </Field>

      {error && <p className="text-sm text-danger-ink">{error}</p>}

      <Button onClick={handleApply} disabled={!changed || busy}>
        {busy ? "Lagrer…" : "Oppdater trinn"}
      </Button>
    </section>
  );
}
