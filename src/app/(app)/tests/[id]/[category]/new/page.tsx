// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/tests/[id]/[category]/new/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

type Category = "bodyweight" | "strength" | "cardio";
type Metric = { key: string; label: string; sort: number; unit?: string };

const CATEGORY_CONFIG: Record<
  Category,
  {
    title: string;
    subtitle: string;
    unitLabel: string; // default unit
    metrics: Metric[];
  }
> = {
  bodyweight: {
    title: "Egenvekt",
    subtitle: "4 minutter per øvelse",
    unitLabel: "reps",
    metrics: [
      { key: "knebøy", label: "Knebøy", sort: 1, unit: "reps" },
      { key: "pushups", label: "Armhevinger", sort: 2, unit: "reps" },
      { key: "situps", label: "Situps", sort: 3, unit: "reps" },
      { key: "plank_time", label: "Planke – tid", sort: 4, unit: "sek" },
      { key: "plank_breaks", label: "Planke – pauser", sort: 5, unit: "antall" },
    ],
  },
  strength: {
    title: "Styrke",
    subtitle: "1RM progresjon i baseøvelser",
    unitLabel: "kg",
    metrics: [
      { key: "knebøy", label: "Knebøy", sort: 1, unit: "kg" },
      { key: "markløft", label: "Markløft", sort: 2, unit: "kg" },
      { key: "benkpress", label: "Benkpress", sort: 3, unit: "kg" },
    ],
  },
  cardio: {
    title: "Kondisjon",
    subtitle: "4-min testers total distanse",
    unitLabel: "m",
    metrics: [
         { key: "mølle", label: "Mølle", sort: 4, unit: "m" },
       { key: "roing", label: "Roing", sort: 2, unit: "m" },
      { key: "ski", label: "Ski", sort: 3, unit: "m" },
  { key: "sykkel", label: "Sykkel", sort: 1, unit: "m" },
    ],
  },
};

function todayDateInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateToNoonISO(dateStr: string) {
  const dt = new Date(`${dateStr}T12:00:00`);
  return dt.toISOString();
}

function isoToDateInputValue(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TestNewPage() {
  const router = useRouter();
  const params = useParams<{ id: string; category: string }>();
  const search = useSearchParams();

  const clientId = params?.id;
  const category = params?.category as Category;
  const sessionId = search.get("sessionId");
  const isEdit = Boolean(sessionId);

  const cfg = CATEGORY_CONFIG[category];

  const { role, userId, loading: roleLoading } = useRole();
  const { getClientById, loading: clientsLoading } = useClients();

  const client = clientId ? getClientById(clientId) : null;
  const clientName = client
    ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "Klient"
    : "Klient";

  const metrics = useMemo(() => cfg?.metrics ?? [], [cfg]);

  const [date, setDate] = useState<string>(todayDateInputValue());
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!cfg) return;
    const init: Record<string, string> = {};
    for (const m of cfg.metrics) init[m.key] = "";
    setValues(init);
  }, [cfg]);

  useEffect(() => {
    if (!cfg || !sessionId) return;

    let alive = true;

    (async () => {
      setErr(null);

      const [sessRes, entRes] = await Promise.all([
        supabase
          .from("test_sessions")
          .select("id, created_at")
          .eq("id", sessionId)
          .single(),
        supabase
          .from("test_entries")
          .select("metric_key, value")
          .eq("session_id", sessionId),
      ]);

      if (!alive) return;

      if (sessRes.error) {
        setErr(sessRes.error.message);
        return;
      }

      if (sessRes.data?.created_at) {
        setDate(isoToDateInputValue(sessRes.data.created_at));
      }

      if (entRes.error) {
        setErr(entRes.error.message);
        return;
      }

      const map: Record<string, string> = {};
      for (const m of metrics) map[m.key] = "";

      for (const row of (entRes.data ?? []) as any[]) {
        map[row.metric_key] = String(row.value ?? "");
      }

      setValues(map);
    })();

    return () => {
      alive = false;
    };
  }, [cfg, sessionId, metrics]);

  const setVal = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!cfg) return "Ugyldig kategori.";

    for (const m of cfg.metrics) {
      const raw = values[m.key];
      if (raw == null || raw.trim() === "") return `Mangler verdi for ${m.label}.`;

      const n = Number(raw);
      if (!Number.isFinite(n)) return `Ugyldig tall for ${m.label}.`;

      // Litt “smart” validering på planke:
      if (m.key === "plank_time") {
        if (n < 0 || n > 240) return "Planke – tid må være mellom 0 og 240 sek.";
      }
      if (m.key === "plank_breaks") {
        if (n < 0) return "Planke – pauser kan ikke være negativ.";
        if (!Number.isInteger(n)) return "Planke – pauser må være et helt tall.";
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!cfg || !clientId) return;

    setErr(null);

    if (!userId) {
      setErr("Mangler innlogget bruker (userId). Prøv å logge inn på nytt.");
      return;
    }

    const vErr = validate();
    if (vErr) {
      setErr(vErr);
      return;
    }

    setBusy(true);

    try {
      const createdAt = dateToNoonISO(date);

      if (!isEdit) {
        const { data: sess, error: sErr } = await supabase
          .from("test_sessions")
          .insert({
            client_id: clientId,
            category,
            created_at: createdAt,
            created_by: userId,
          })
          .select("id")
          .single();

        if (sErr || !sess?.id) {
          setErr(sErr?.message ?? "Kunne ikke opprette test.");
          return;
        }

        const rows = cfg.metrics.map((m) => ({
          session_id: sess.id,
          metric_key: m.key,
          value: Number(values[m.key]),
          unit: m.unit ?? cfg.unitLabel, // ✅ per øvelse
          sort: m.sort,
        }));

        const { error: eErr } = await supabase.from("test_entries").insert(rows);
        if (eErr) {
          setErr(eErr.message);
          return;
        }

        router.push(`/tests/${encodeURIComponent(clientId)}/${category}`);
        return;
      }

      const { error: upErr } = await supabase
        .from("test_sessions")
        .update({ created_at: createdAt })
        .eq("id", sessionId);

      if (upErr) {
        setErr(upErr.message);
        return;
      }

      const { error: delErr } = await supabase
        .from("test_entries")
        .delete()
        .eq("session_id", sessionId);

      if (delErr) {
        setErr(delErr.message);
        return;
      }

      const rows = cfg.metrics.map((m) => ({
        session_id: sessionId,
        metric_key: m.key,
        value: Number(values[m.key]),
        unit: m.unit ?? cfg.unitLabel, // ✅ per øvelse
        sort: m.sort,
      }));

      const { error: insErr } = await supabase.from("test_entries").insert(rows);

      if (insErr) {
        setErr(insErr.message);
        return;
      }

      router.push(`/tests/${encodeURIComponent(clientId)}/${category}`);
    } finally {
      setBusy(false);
    }
  };

  if (roleLoading || clientsLoading) return null;

  if (role && role !== "trainer" && role !== "admin") {
    return (
      <main className="bg-[#F4FBFA]">
        <AppPage>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Ingen tilgang.
          </div>
        </AppPage>
      </main>
    );
  }

  if (!cfg) {
    return (
      <main className="bg-[#F4FBFA]">
        <AppPage>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Ugyldig kategori.
          </div>
        </AppPage>
      </main>
    );
  }

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="mx-auto w-full max-w-xl space-y-5">
          <div className="flex items-center gap-3">
            <Link
              href={`/tests/${encodeURIComponent(clientId ?? "")}/${category}`}
              className="inline-flex items-center justify-center rounded-full border border-sf-border bg-white px-3 py-2 text-sm hover:bg-sf-soft"
              title="Tilbake"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-sf-text">
                {isEdit ? "Rediger test" : "Ny test"} — {cfg.title}
              </h1>
              <p className="text-sm text-sf-muted">{clientName}</p>
            </div>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-sf-text mb-1">Dato</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-sf-muted">Kun dato (ikke klokkeslett).</p>
            </div>

            <div className="space-y-3">
              {cfg.metrics.map((m) => {
                const unit = m.unit ?? cfg.unitLabel;

                const hint =
                  m.key === "plank_time"
                    ? "0–240 (full planke i 4 min = 240)"
                    : m.key === "plank_breaks"
                    ? "antall ganger du måtte ned (kne/i bakken)"
                    : "0";

                return (
                  <div key={m.key}>
                    <label className="block text-sm font-medium text-sf-text mb-1">
                      {m.label} ({unit})
                    </label>
                    <input
                      inputMode="numeric"
                      value={values[m.key] ?? ""}
                      onChange={(e) => setVal(m.key, e.target.value)}
                      placeholder={hint}
                      className="w-full rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
                    />
                    {m.key === "plank_time" && (
                      <p className="mt-1 text-xs text-sf-muted">
                        Tips: Tenk “total tid i planke innen 4 minutter”. Kort pause = stopp tiden.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="mt-2 w-full rounded-xl bg-[#007C80] py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {busy ? "Lagrer..." : "Lagre"}
            </button>
          </div>
        </div>
      </AppPage>
    </main>
  );
}