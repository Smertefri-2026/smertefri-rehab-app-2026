"use client";

import { useState } from "react";
import { Button } from "@/ui/components/Button";
import { Field, Textarea } from "@/ui/components/Field";
import { cn } from "@/ui/cn";
import { submitDailyCheckin, type DailyCheckinRow } from "@/lib/zone.api";
import type { DailyCheckinInput, ZoneResult } from "@/lib/zone";

type Props = {
  clientId: string;
  existing?: DailyCheckinRow | null;
  onDone: (result: ZoneResult) => void;
};

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              value === o.value
                ? "border-primary bg-primary-subtle text-primary-ink"
                : "border-border bg-surface text-ink-soft hover:bg-surface-alt"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DailyCheckinForm({ clientId, existing, onDone }: Props) {
  const [painNow, setPainNow] = useState<number>(existing?.pain_now ?? 3);
  const [sleep, setSleep] = useState<DailyCheckinInput["sleep"] | null>(
    (existing?.sleep as DailyCheckinInput["sleep"]) ?? null
  );
  const [energy, setEnergy] = useState<DailyCheckinInput["energy"] | null>(
    (existing?.energy as DailyCheckinInput["energy"]) ?? null
  );
  const [newSymptom, setNewSymptom] = useState<boolean>(existing?.new_symptom ?? false);
  const [newSymptomNote, setNewSymptomNote] = useState<string>(existing?.new_symptom_note ?? "");
  const [completed, setCompleted] = useState<DailyCheckinInput["completedPlannedActivity"] | null>(
    (existing?.completed_planned_activity as DailyCheckinInput["completedPlannedActivity"]) ?? null
  );
  const [afraid, setAfraid] = useState<boolean>(existing?.afraid_to_train ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = sleep !== null && energy !== null && completed !== null;

  async function handleSubmit() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { zone } = await submitDailyCheckin(clientId, {
        painNow,
        sleep: sleep!,
        energy: energy!,
        newSymptom,
        newSymptomNote: newSymptomNote.trim() || undefined,
        completedPlannedActivity: completed!,
        afraidToTrain: afraid,
      });
      onDone(zone);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre innsjekken");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6 shadow-card">
      <div>
        <h2 className="text-base font-semibold text-ink">Dagens innsjekk</h2>
        <p className="mt-1 text-sm text-ink-soft">Tar rundt 30 sekunder. Svarene beregner Sonen din i dag.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-medium text-ink-soft">Smerte nå</p>
          <span className="text-sm font-semibold text-ink">{painNow} / 10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={painNow}
          onChange={(e) => setPainNow(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-ink-faint">
          <span>Ingen</span>
          <span>Verst tenkelig</span>
        </div>
      </div>

      <Choice
        label="Søvn i natt"
        value={sleep}
        onChange={setSleep}
        options={[
          { value: "dårlig", label: "Dårlig" },
          { value: "ok", label: "OK" },
          { value: "bra", label: "Bra" },
        ]}
      />

      <Choice
        label="Overskudd i dag"
        value={energy}
        onChange={setEnergy}
        options={[
          { value: "lavt", label: "Lavt" },
          { value: "ok", label: "OK" },
          { value: "høyt", label: "Høyt" },
        ]}
      />

      <Choice
        label="Gjennomførte du planlagt aktivitet?"
        value={completed}
        onChange={setCompleted}
        options={[
          { value: "ja", label: "Ja" },
          { value: "delvis", label: "Delvis" },
          { value: "nei", label: "Nei" },
        ]}
      />

      <Choice
        label="Nytt eller uventet symptom siden sist?"
        value={newSymptom ? "ja" : "nei"}
        onChange={(v) => setNewSymptom(v === "ja")}
        options={[
          { value: "nei", label: "Nei" },
          { value: "ja", label: "Ja" },
        ]}
      />

      {newSymptom && (
        <Field label="Kort om symptomet (valgfritt)">
          <Textarea
            rows={2}
            value={newSymptomNote}
            onChange={(e) => setNewSymptomNote(e.target.value)}
            placeholder="F.eks. nummenhet i foten, ny smerte et annet sted …"
          />
        </Field>
      )}

      <Choice
        label="Kjenner du frykt for å trene i dag?"
        value={afraid ? "ja" : "nei"}
        onChange={(v) => setAfraid(v === "ja")}
        options={[
          { value: "nei", label: "Nei" },
          { value: "ja", label: "Ja" },
        ]}
      />

      {error && <p className="text-sm text-danger-ink">{error}</p>}

      <Button onClick={handleSubmit} disabled={!ready || saving} className="w-full">
        {saving ? "Lagrer…" : existing ? "Oppdater innsjekk" : "Fullfør innsjekk"}
      </Button>
    </div>
  );
}
