"use client";

import { useState } from "react";
import { Button } from "@/ui/components/Button";
import { Field, Textarea } from "@/ui/components/Field";
import { ChoiceGroup } from "@/ui/components/ChoiceGroup";
import { logWorkoutCompletion, type ActiveAssignment, type LogCompletionInput } from "@/lib/program.api";

export default function LogWorkoutForm({
  assignment,
  onLogged,
}: {
  assignment: ActiveAssignment;
  onLogged: () => void;
}) {
  const [status, setStatus] = useState<LogCompletionInput["status"] | null>(null);
  const [rpe, setRpe] = useState(5);
  const [painDuring, setPainDuring] = useState(2);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!status || saving) return;
    setSaving(true);
    setError(null);
    try {
      await logWorkoutCompletion(assignment, {
        status,
        rpe: status === "nei" ? undefined : rpe,
        painDuring: status === "nei" ? undefined : painDuring,
        notes: notes.trim() || undefined,
      });
      onLogged();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold text-ink">Logg dagens økt</h2>

      <ChoiceGroup
        label="Hvordan gikk det?"
        value={status}
        onChange={setStatus}
        options={[
          { value: "ja", label: "Gjennomført" },
          { value: "delvis", label: "Delvis" },
          { value: "nei", label: "Ikke i dag" },
        ]}
      />

      {status && status !== "nei" && (
        <>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-ink-soft">Hvor hardt kjentes det? (RPE)</p>
              <span className="text-sm font-semibold text-ink">{rpe} / 10</span>
            </div>
            <input type="range" min={0} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-ink-soft">Smerte under økta</p>
              <span className="text-sm font-semibold text-ink">{painDuring} / 10</span>
            </div>
            <input type="range" min={0} max={10} value={painDuring} onChange={(e) => setPainDuring(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        </>
      )}

      <Field label="Notat (valgfritt)">
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="F.eks. «måtte hoppe over siste øvelse, ellers greit»" />
      </Field>

      {error && <p className="text-sm text-danger-ink">{error}</p>}

      <Button onClick={handleSubmit} disabled={!status || saving} className="w-full">
        {saving ? "Lagrer…" : "Lagre"}
      </Button>
    </div>
  );
}
