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

function dateISOFromEntry(e: any) {
  const raw = (e?.entry_date ?? e?.created_at ?? "") as string;
  return raw ? raw.slice(0, 10) : "";
}

function daysBetweenISO(aISO: string, bISO: string) {
  const a = new Date(`${aISO}T00:00:00`);
  const b = new Date(`${bISO}T00:00:00`);
  const diff = a.getTime() - b.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function relativeDayLabel(entryISO: string, todayISOValue: string) {
  if (!entryISO) return "ukjent";
  const diff = daysBetweenISO(todayISOValue, entryISO);
  if (diff === 0) return "i dag";
  if (diff === 1) return "i går";
  if (diff > 1) return `${diff} dager siden`;
  if (diff === -1) return "i morgen";
  return `${Math.abs(diff)} dager frem`;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-sf-border bg-sf-soft/40 px-2.5 py-1 text-xs text-sf-text">
      {children}
    </span>
  );
}

export default function Section2PainActive({
  clientId,
  selectedArea,
  onClearSelected,
  onPickArea,
}: Props) {
  const { entries, loading, error, fetchForClient, upsertDailyEntry, setActive, remove } = usePain();

  const clientIdReady = !!clientId && isUuid(clientId);

  // ✅ FIX: "today" må kunne endre seg hvis siden står åpen over midnatt
  const [today, setToday] = useState<string>(() => todayISO());
  useEffect(() => {
    const id = setInterval(() => {
      const t = todayISO();
      setToday((prev) => (prev === t ? prev : t));
    }, 60 * 1000); // sjekk hvert minutt (billig og stabilt)
    return () => clearInterval(id);
  }, []);

  // ✅ Fetch bare når clientId faktisk er en uuid
  useEffect(() => {
    if (!clientIdReady) return;
    fetchForClient(clientId);
  }, [clientIdReady, clientId, fetchForClient]);

  const activeLatest = useMemo(() => {
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

    // entry_date i DB er "date" → typisk "YYYY-MM-DD"
    const te = areaEntries.find((e) => (e.entry_date ?? "").slice(0, 10) === today) ?? null;

    // entries er sortert desc fra store (antatt)
    const le = areaEntries[0] ?? null;

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
  }, [selectedArea?.key, seed?.id, seed?.intensity, seed?.note, seed?.function_note]);

  async function handleSave() {
    if (!selectedArea) return;
    if (!clientIdReady) return;

    // ✅ VARSEL: Hvis det allerede finnes en logg i dag → spør før overskriving
    if (hasTodayEntry) {
      const ok = window.confirm(
        `Du har allerede registrert "${selectedArea.label}" i dag.\n\nVil du oppdatere (overskrive) dagens logg?`
      );
      if (!ok) return;
    }

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
        // entry_date default = i dag i store / backend
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
                        active ? "bg-[#007C80] text-white border-transparent" : "border-sf-border hover:bg-sf-soft",
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
                        active ? "bg-[#007C80] text-white border-transparent" : "border-sf-border hover:bg-sf-soft",
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
                        active ? "bg-[#007C80] text-white border-transparent" : "border-sf-border hover:bg-sf-soft",
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
            activeLatest.map((e: any) => {
              const lastISO = dateISOFromEntry(e);
              const lastLabel = relativeDayLabel(lastISO, today);

              const q = Array.isArray(e?.quality) ? (e.quality as string[]) : [];
              const p = Array.isArray(e?.pattern) ? (e.pattern as string[]) : [];
              const pr = Array.isArray(e?.provokes) ? (e.provokes as string[]) : [];

              const qText = q.slice(0, 2).join(", ");
              const pText = p.slice(0, 2).join(", ");

              return (
                <div
                  key={e.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-sf-border px-5 py-4"
                >
                  <button
                    type="button"
                    className="text-left flex-1"
                    onClick={() => onPickArea?.({ key: e.area_key, label: e.area_label })}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{e.area_label}</p>
                      <span className="text-xs text-sf-muted">
                        Sist: <span className="font-medium text-sf-text">{lastLabel}</span>
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-sf-muted">Intensitet: {e.intensity}/10</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.length ? <Chip>Type: {qText}{q.length > 2 ? "…" : ""}</Chip> : null}
                      {p.length ? <Chip>Mønster: {pText}{p.length > 2 ? "…" : ""}</Chip> : null}
                      {pr.length ? <Chip>Verre ved: {pr.length}</Chip> : null}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 pt-1">
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
              );
            })
          )}
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}