// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/tests/[id]/[category]/new/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

function isNumericLike(s: string) {
  if (s == null) return false;
  const t = String(s).trim();
  if (!t) return false;
  const n = Number(t);
  return Number.isFinite(n);
}

export default function TestNewPage() {
  const router = useRouter();
  const params = useParams<{ id: string; category: string }>();
  const search = useSearchParams();

  const clientId = params?.id;
  const category = params?.category as Category;

  const sessionIdFromUrl = search.get("sessionId");
  const isEdit = Boolean(sessionIdFromUrl);

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

  // ✅ “lagre én og én”
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMetric = metrics[currentIndex];

  // ✅ session id som vi kan opprette on-demand
  const [sessionId, setSessionId] = useState<string | null>(sessionIdFromUrl);
  const sessionIdRef = useRef<string | null>(sessionIdFromUrl);

  // ✅ track hvilke øvelser som er lagret
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  // ✅ Kunde-tilgang: kun hvis kunde uten trener
  const [myTrainerId, setMyTrainerId] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);

  // local draft
  const draftKey = useMemo(() => {
    const cid = clientId ?? "x";
    return `sf:testdraft:${cid}:${category}`;
  }, [clientId, category]);

  const setVal = (k: string, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  // Init values
  useEffect(() => {
    if (!cfg) return;
    const init: Record<string, string> = {};
    for (const m of cfg.metrics) init[m.key] = "";
    setValues(init);
    setCurrentIndex(0);
    setSavedKeys(new Set());
  }, [cfg]);

  // Restore draft (kun når vi IKKE redigerer eksisterende session)
  useEffect(() => {
    if (!cfg) return;
    if (sessionIdFromUrl) return;

    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        date?: string;
        values?: Record<string, string>;
        savedKeys?: string[];
      };
      if (parsed?.date) setDate(parsed.date);
      if (parsed?.values) setValues((prev) => ({ ...prev, ...parsed.values }));
      if (parsed?.savedKeys?.length) setSavedKeys(new Set(parsed.savedKeys));
    } catch {
      // ignore
    }
  }, [cfg, draftKey, sessionIdFromUrl]);

  // Persist draft
  useEffect(() => {
    if (!cfg) return;
    if (sessionIdFromUrl) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          date,
          values,
          savedKeys: Array.from(savedKeys),
        })
      );
    } catch {
      // ignore
    }
  }, [cfg, date, values, savedKeys, draftKey, sessionIdFromUrl]);

  // ✅ hent trainer_id for kunde (for å avgjøre tilgang)
  useEffect(() => {
    const run = async () => {
      if (role !== "client") return;
      if (!userId) return;

      setAccessLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("trainer_id")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setMyTrainerId((data as any)?.trainer_id ?? null);
      } catch {
        setMyTrainerId(null);
      } finally {
        setAccessLoading(false);
      }
    };
    run();
  }, [role, userId]);

  // ✅ load existing session (edit)
  useEffect(() => {
    if (!cfg || !sessionIdFromUrl) return;

    let alive = true;

    (async () => {
      setErr(null);

      const [sessRes, entRes] = await Promise.all([
        supabase
          .from("test_sessions")
          .select("id, created_at")
          .eq("id", sessionIdFromUrl)
          .single(),
        supabase
          .from("test_entries")
          .select("metric_key, value")
          .eq("session_id", sessionIdFromUrl),
      ]);

      if (!alive) return;

      if (sessRes.error) {
        setErr(sessRes.error.message);
        return;
      }

      // sync sessionId state
      setSessionId(sessionIdFromUrl);
      sessionIdRef.current = sessionIdFromUrl;

      if (sessRes.data?.created_at) {
        setDate(isoToDateInputValue(sessRes.data.created_at));
      }

      if (entRes.error) {
        setErr(entRes.error.message);
        return;
      }

      const map: Record<string, string> = {};
      for (const m of metrics) map[m.key] = "";

      const saved = new Set<string>();

      for (const row of (entRes.data ?? []) as any[]) {
        map[row.metric_key] = String(row.value ?? "");
        if (row.metric_key) saved.add(String(row.metric_key));
      }

      setValues(map);
      setSavedKeys(saved);

      // start på første som ikke er fylt
      const firstEmpty = metrics.findIndex((m) => !isNumericLike(map[m.key] ?? ""));
      setCurrentIndex(firstEmpty >= 0 ? firstEmpty : 0);
    })();

    return () => {
      alive = false;
    };
  }, [cfg, sessionIdFromUrl, metrics]);

  /* ---------------- validation ---------------- */

  const validateOne = (m: Metric) => {
    if (!cfg) return "Ugyldig kategori.";
    const raw = values[m.key];
    if (raw == null || raw.trim() === "") return `Mangler verdi for ${m.label}.`;

    const n = Number(raw);
    if (!Number.isFinite(n)) return `Ugyldig tall for ${m.label}.`;

    if (m.key === "plank_time") {
      if (n < 0 || n > 240) return "Planke – tid må være mellom 0 og 240 sek.";
    }
    if (m.key === "plank_breaks") {
      if (n < 0) return "Planke – pauser kan ikke være negativ.";
      if (!Number.isInteger(n)) return "Planke – pauser må være et helt tall.";
    }

    return null;
  };

  const validateAll = () => {
    if (!cfg) return "Ugyldig kategori.";
    for (const m of cfg.metrics) {
      const e = validateOne(m);
      if (e) return e;
    }
    return null;
  };

  /* ---------------- db ops ---------------- */

  async function ensureSession(): Promise<string> {
    if (!cfg || !clientId) throw new Error("Mangler cfg/clientId");
    if (!userId) throw new Error("Mangler userId");

    const existing = sessionIdRef.current;
    if (existing) return existing;

    const createdAt = dateToNoonISO(date);

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
      throw new Error(sErr?.message ?? "Kunne ikke opprette test.");
    }

    const newId = String(sess.id);
    setSessionId(newId);
    sessionIdRef.current = newId;

    // oppdater URL så refresh ikke mister session
    const url = `/tests/${encodeURIComponent(clientId)}/${category}/new?sessionId=${encodeURIComponent(newId)}`;
    router.replace(url);

    return newId;
  }

  async function upsertEntry(sessId: string, m: Metric) {
    if (!cfg) throw new Error("Mangler cfg");

    const unit = m.unit ?? cfg.unitLabel;
    const value = Number(values[m.key]);

    const { error } = await supabase.from("test_entries").upsert(
      {
        session_id: sessId,
        metric_key: m.key,
        value,
        unit,
        sort: m.sort,
      },
      // krever UNIQUE(session_id, metric_key) i db (anbefalt)
      { onConflict: "session_id,metric_key" }
    );

    if (error) throw error;

    setSavedKeys((prev) => {
      const next = new Set(prev);
      next.add(m.key);
      return next;
    });
  }

  async function updateSessionDateIfNeeded(sessId: string) {
    const createdAt = dateToNoonISO(date);
    const { error } = await supabase
      .from("test_sessions")
      .update({ created_at: createdAt })
      .eq("id", sessId);
    if (error) throw error;
  }

  /* ---------------- handlers ---------------- */

  const handleSaveOne = async (goNext: boolean) => {
    if (!cfg || !clientId || !currentMetric) return;
    setErr(null);

    if (!userId) {
      setErr("Mangler innlogget bruker (userId). Prøv å logge inn på nytt.");
      return;
    }

    const vErr = validateOne(currentMetric);
    if (vErr) {
      setErr(vErr);
      return;
    }

    setBusy(true);
    try {
      const sessId = await ensureSession();
      await updateSessionDateIfNeeded(sessId);
      await upsertEntry(sessId, currentMetric);

      if (goNext) {
        setCurrentIndex((i) => Math.min(i + 1, metrics.length - 1));
      }
    } catch (e: any) {
      setErr(e?.message ?? "Kunne ikke lagre.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAll = async () => {
    if (!cfg || !clientId) return;
    setErr(null);

    if (!userId) {
      setErr("Mangler innlogget bruker (userId). Prøv å logge inn på nytt.");
      return;
    }

    const vErr = validateAll();
    if (vErr) {
      setErr(vErr);
      return;
    }

    setBusy(true);
    try {
      const sessId = await ensureSession();
      await updateSessionDateIfNeeded(sessId);

      for (const m of cfg.metrics) {
        await upsertEntry(sessId, m);
      }

      // draft ferdig
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }

      router.push(`/tests/${encodeURIComponent(clientId)}/${category}`);
    } catch (e: any) {
      setErr(e?.messagexmessage ?? e?.message ?? "Kunne ikke lagre.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- access control ---------------- */

  if (roleLoading || clientsLoading || (role === "client" && accessLoading)) return null;

  // ✅ tillat: trener/admin alltid
  // ✅ tillat: client kun hvis egen side + ingen trener
  const clientSelf = role === "client" && userId && clientId && userId === clientId;
  const clientHasNoTrainer = role === "client" && clientSelf && !myTrainerId;
  const allowed = role === "trainer" || role === "admin" || clientHasNoTrainer;

  if (!allowed) {
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

  const unit = currentMetric?.unit ?? cfg.unitLabel;

  const hint =
    currentMetric?.key === "plank_time"
      ? "0–240 (full planke i 4 min = 240)"
      : currentMetric?.key === "plank_breaks"
      ? "antall ganger du måtte ned (kne/i bakken)"
      : "0";

  const isLast = currentIndex === metrics.length - 1;
  const isSaved = currentMetric ? savedKeys.has(currentMetric.key) : false;

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

            {/* ✅ Progress / navigasjon */}
            <div className="flex items-center justify-between rounded-xl border border-sf-border bg-sf-soft px-4 py-3">
              <p className="text-sm">
                Øvelse <span className="font-medium">{currentIndex + 1}</span> / {metrics.length}
                {currentMetric ? (
                  <>
                    {" "}
                    • <span className="font-medium">{currentMetric.label}</span>{" "}
                    <span className="text-sf-muted">({unit})</span>
                  </>
                ) : null}
              </p>

              <span className="text-xs text-sf-muted">{isSaved ? "Lagret ✓" : "Ikke lagret"}</span>
            </div>

            {/* ✅ Kun én input av gangen (mobilvennlig) */}
            {currentMetric ? (
              <div>
                <label className="block text-sm font-medium text-sf-text mb-1">
                  {currentMetric.label} ({unit})
                </label>
                <input
                  inputMode="numeric"
                  value={values[currentMetric.key] ?? ""}
                  onChange={(e) => setVal(currentMetric.key, e.target.value)}
                  placeholder={hint}
                  className="w-full rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
                />
                {currentMetric.key === "plank_time" && (
                  <p className="mt-1 text-xs text-sf-muted">
                    Tips: Tenk “total tid i planke innen 4 minutter”. Kort pause = stopp tiden.
                  </p>
                )}
              </div>
            ) : null}

            {/* ✅ Navigasjon mellom øvelser */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                disabled={busy || currentIndex === 0}
                className="w-full rounded-xl border border-sf-border bg-white py-2.5 text-sm font-medium text-sf-text hover:bg-sf-soft disabled:opacity-50"
              >
                Forrige
              </button>

              {/* ✅ VIKTIG: Neste = LAGRE & NESTE */}
              <button
                type="button"
                onClick={() => handleSaveOne(true)}
                disabled={busy || currentIndex === metrics.length - 1}
                className="w-full rounded-xl border border-sf-border bg-white py-2.5 text-sm font-medium text-sf-text hover:bg-sf-soft disabled:opacity-50"
              >
                {busy ? "Lagrer..." : "Neste"}
              </button>
            </div>

            {/* ✅ Lagre per øvelse */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSaveOne(false)}
                disabled={busy}
                className="w-full rounded-xl bg-[#007C80] py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
              >
                {busy ? "Lagrer..." : "Lagre øvelse"}
              </button>

              <button
                type="button"
                onClick={() => handleSaveOne(true)}
                disabled={busy}
                className="w-full rounded-xl bg-[#007C80] py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
              >
                {busy ? "Lagrer..." : isLast ? "Lagre (bli her)" : "Lagre & neste"}
              </button>
            </div>

            {/* ✅ Fullfør / lagre alt */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={busy}
              className="mt-1 w-full rounded-xl border border-sf-border bg-white py-2.5 text-sm font-medium text-sf-text hover:bg-sf-soft disabled:opacity-50"
            >
              {busy ? "Lagrer..." : "Fullfør / lagre alt"}
            </button>

            <p className="text-xs text-sf-muted">
              Tips: Neste lagrer automatisk. Du mister ikke data om du lukker appen underveis.
            </p>
          </div>
        </div>
      </AppPage>
    </main>
  );
}