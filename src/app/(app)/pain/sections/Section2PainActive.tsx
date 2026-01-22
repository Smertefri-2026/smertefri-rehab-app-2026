// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/pain/sections/Section2PainActive.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Save } from "lucide-react";
import { usePain } from "@/stores/pain.store";
import type { PainPattern, PainQuality } from "@/types/pain";

type Area = { key: string; label: string };

type Props = {
  clientId: string;
  selectedArea: Area | null;
  onClearSelected: () => void;

  /** ✅ valgfri: gjør at klikking på aktivt kort åpner skjema */
  onPickArea?: (area: Area) => void;
};

const QUALITY: { key: PainQuality; label: string }[] = [
  { key: "murrende", label: "Murrende" },
  { key: "stikkende", label: "Stikkende" },
  { key: "brennende", label: "Brennende" },
  { key: "strålende", label: "Strålende" },
  { key: "verkende", label: "Verkende" },
  { key: "strammende", label: "Strammende" },
];

const PATTERN: { key: PainPattern; label: string }[] = [
  { key: "konstant", label: "Konstant" },
  { key: "episodisk", label: "Episodisk" },
  { key: "ved_belastning", label: "Ved belastning" },
  { key: "morgenverst", label: "Morgenverst" },
  { key: "etter_trening", label: "Etter trening" },
];

const PROVOKES = ["Sitte", "Stå", "Gå", "Løfting", "Bøying", "Søvn", "Trening"] as const;

function toggle<T extends string>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ Enkel UUID-sjekk (hindrer "invalid input syntax for type uuid: ''")
function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default function Section2PainActive({
  clientId,
  selectedArea,
  onClearSelected,
  onPickArea,
}: Props) {
  const { entries, loading, error, fetchForClient, upsertDailyEntry, setActive, remove } = usePain();

  const clientIdReady = !!clientId && isUuid(clientId);
  const today = useMemo(() => todayISO(), []);

  // ✅ Fetch bare når clientId faktisk er en uuid
  useEffect(() => {
    if (!clientIdReady) return;
    fetchForClient(clientId);
  }, [clientIdReady, clientId, fetchForClient]);

  const activeLatest = useMemo(() => {
    // “aktiv liste” = siste entry per område der is_active=true
    const map = new Map<string, (typeof entries)[number]>();
    for (const e of entries) {
      if (!e.is_active) continue;

      const prev = map.get(e.area_key);
      if (!prev) {
        map.set(e.area_key, e);
        continue;
      }

      const a = (e.entry_date ?? e.created_at) as string;
      const b = (prev.entry_date ?? prev.created_at) as string;
      if (a > b) map.set(e.area_key, e);
    }
    return Array.from(map.values());
  }, [entries]);

  // ✅ Finn dagens entry / siste entry for valgt område
  const { todayEntry, latestEntryForArea } = useMemo(() => {
    if (!selectedArea) return { todayEntry: null as any, latestEntryForArea: null as any };

    const areaEntries = entries.filter((e) => e.area_key === selectedArea.key);
    const te = areaEntries.find((e) => e.entry_date === today) ?? null;
    const le = areaEntries[0] ?? null; // entries er allerede sortert desc fra store
    return { todayEntry: te, latestEntryForArea: le };
  }, [entries, selectedArea, today]);

  const hasTodayEntry = !!todayEntry;
  const seed = todayEntry ?? latestEntryForArea;

  // form state (for selected area)
  const [intensity, setIntensity] = useState<number>(5);
  const [quality, setQuality] = useState<PainQuality[]>([]);
  const [pattern, setPattern] = useState<PainPattern[]>([]);
  const [provokes, setProvokes] = useState<string[]>([]);
  const [functionNote, setFunctionNote] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // ✅ Prefill når område velges / entries endres
  useEffect(() => {
    if (!selectedArea) return;

    setIntensity(typeof seed?.intensity === "number" ? seed.intensity : 5);
    setQuality(Array.isArray(seed?.quality) ? seed.quality : []);
    setPattern(Array.isArray(seed?.pattern) ? seed.pattern : []);
    setProvokes(Array.isArray(seed?.provokes) ? seed.provokes : []);
    setFunctionNote(typeof seed?.function_note === "string" ? seed.function_note : "");
    setNote(typeof seed?.note === "string" ? seed.note : "");
  }, [
    selectedArea?.key,
    seed?.id,
    seed?.intensity,
    seed?.note,
    seed?.function_note,
    // arrays: trigger via seed?.id is enough
  ]);

  async function handleSave() {
    if (!selectedArea) return;
    if (!clientIdReady) return;

    setSaving(true);
    try {
      await upsertDailyEntry({
        clientId,
        area_key: selectedArea.key,
        area_label: selectedArea.label,
        intensity,
        quality,
        pattern,
        provokes,
        function_note: functionNote,
        note,
        // entry_date default = i dag i store
      });
      onClearSelected();
    } finally {
      setSaving(false);
    }
  }

  const saveLabel = hasTodayEntry ? "Oppdater (i dag)" : "Lagre (i dag)";

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Du jobber med nå</h2>
          <p className="text-sm text-sf-muted">
            Velg et område over (eller et aktivt kort) for å registrere dagens smerte og oppfølging.
          </p>
        </div>

        {!clientIdReady ? (
          <p className="text-sm text-sf-muted">Laster bruker… (venter på klient-ID)</p>
        ) : null}

        {/* 🔧 registrering for valgt område */}
        {selectedArea ? (
          <div className="rounded-2xl border border-sf-border p-4 space-y-4 bg-sf-soft/30">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">{selectedArea.label}</div>
              <button
                type="button"
                onClick={onClearSelected}
                className="text-sm text-sf-muted hover:text-sf-text"
              >
                Lukk
              </button>
            </div>

            {/* Intensitet */}
            <div className="rounded-xl border border-sf-border bg-white p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Smerteintensitet</div>
                <div className="text-sm font-semibold text-amber-600">{intensity}/10</div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-sf-muted">
                <span>Ingen</span>
                <span>Utholdelig</span>
              </div>
            </div>

            {/* Type smerte */}
            <div className="rounded-xl border border-sf-border bg-white p-4 space-y-2">
              <div className="text-sm font-medium">Type smerte</div>
              <div className="flex flex-wrap gap-2">
                {QUALITY.map((q) => {
                  const active = quality.includes(q.key);
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => setQuality((arr) => toggle(arr, q.key))}
                      className={[
                        "rounded-full px-4 py-2 text-sm border transition",
                        active
                          ? "bg-[#007C80] text-white border-transparent"
                          : "border-sf-border hover:bg-sf-soft",
                      ].join(" ")}
                    >
                      {q.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mønster */}
            <div className="rounded-xl border border-sf-border bg-white p-4 space-y-2">
              <div className="text-sm font-medium">Mønster</div>
              <div className="flex flex-wrap gap-2">
                {PATTERN.map((p) => {
                  const active = pattern.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPattern((arr) => toggle(arr, p.key))}
                      className={[
                        "rounded-full px-4 py-2 text-sm border transition",
                        active
                          ? "bg-[#007C80] text-white border-transparent"
                          : "border-sf-border hover:bg-sf-soft",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verre ved */}
            <div className="rounded-xl border border-sf-border bg-white p-4 space-y-2">
              <div className="text-sm font-medium">Verre ved</div>
              <div className="flex flex-wrap gap-2">
                {PROVOKES.map((x) => {
                  const active = provokes.includes(x);
                  return (
                    <button
                      key={x}
                      type="button"
                      onClick={() => setProvokes((arr) => toggle(arr, x))}
                      className={[
                        "rounded-full px-4 py-2 text-sm border transition",
                        active
                          ? "bg-[#007C80] text-white border-transparent"
                          : "border-sf-border hover:bg-sf-soft",
                      ].join(" ")}
                    >
                      {x}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Funksjon / notat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-sf-border bg-white p-4 space-y-2">
                <div className="text-sm font-medium">Funksjon</div>
                <textarea
                  value={functionNote}
                  onChange={(e) => setFunctionNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm outline-none"
                  placeholder="Hva klarer du ikke i hverdagen?"
                />
              </div>

              <div className="rounded-xl border border-sf-border bg-white p-4 space-y-2">
                <div className="text-sm font-medium">Notat (valgfritt)</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm outline-none"
                  placeholder="F.eks. stråling, søvn, stress, hva hjalp…"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !clientIdReady}
                className="inline-flex items-center gap-2 rounded-xl bg-sf-primary px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Lagrer…" : saveLabel}
              </button>
            </div>
          </div>
        ) : null}

        {/* aktiv liste */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-sf-muted">Laster smerter…</p>
          ) : activeLatest.length === 0 ? (
            <p className="text-sm text-sf-muted">Ingen aktive smerter registrert enda.</p>
          ) : (
            activeLatest.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-2xl border border-sf-border px-5 py-4"
              >
                <button
                  type="button"
                  className="text-left flex-1 pr-4"
                  onClick={() => {
                    onPickArea?.({ key: e.area_key, label: e.area_label });
                  }}
                >
                  <p className="font-medium">{e.area_label}</p>
                  <p className="text-sm text-sf-muted">Intensitet: {e.intensity}/10</p>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActive(e.id, false)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-sf-soft"
                    disabled={loading}
                  >
                    Deaktiver
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="text-red-500 hover:opacity-80 transition disabled:opacity-50"
                    aria-label="Fjern smerte"
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}