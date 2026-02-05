// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import ClientCard from "@/components/client/ClientCard";
import Section1ClientSearch from "./sections/Section1ClientSearch";
import Section2ClientAlerts from "./sections/Section2ClientAlerts";
import Section3ActiveFiltersRow from "./sections/Section3ActiveFiltersRow";

import { useClients } from "@/stores/clients.store";
import { useRole } from "@/providers/RoleProvider";

import { useTestMetricsForClients } from "@/lib/metrics/useTestMetricsForClients";
import { usePainMetricsForClients, type PainFilterKey } from "@/lib/metrics/usePainMetricsForClients";
import { useNutritionMetricsForClients } from "@/lib/metrics/useNutritionMetricsForClients";
import { useTrainingHoursMetricsForClients } from "@/lib/metrics/useTrainingHoursMetricsForClients";

import { supabase } from "@/lib/supabaseClient";
import { yyyyMmDd } from "@/modules/nutrition/storage";

/* ---------------- TYPES ---------------- */

type FilterKey =
  | "all"
  | "baseline-missing"
  | "inactive-tests"
  | "negative-progress"
  | "positive-progress";

// 3 nutrition-filtre + bakoverkompat "missing" (= missing-profile)
type NutritionFilterKey = "none" | "missing" | "missing-profile" | "no-logs-7d" | "logged-today";
type HoursFilterKey = "none" | "missing";

// ✅ NY: sort
type SortKey = "next" | "alpha";

/* ---------------- HELPERS ---------------- */

function pickOne<T extends string>(v: string | null, allowed: readonly T[], fallback: T): T {
  if (!v) return fallback;
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

function formatShort(ts: string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("no-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateNo(d: Date) {
  // f.eks. "Onsdag 31.12"
  const weekday = d.toLocaleDateString("no-NO", { weekday: "long" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${dd}.${mm}`;
}

function formatTimeHHMM(d: Date) {
  return d.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function prettyDateTime(ts: string | null | undefined) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return `${formatDateNo(d)} · ${formatTimeHHMM(d)}`;
}

function testStatusText(m: any): string {
  if (!m) return "Ingen tester";
  const missing = (m?.missingCategories?.length ?? 0) > 0;
  if (missing) return "Mangler baseline";

  const pct = Number(m?.avgPct ?? 0);
  if (pct > 0) return `+${Math.round(pct)}%`;
  if (pct < 0) return `${Math.round(pct)}%`;
  return "OK";
}

function painStatusText(p: any): string {
  if (!p) return "—";
  if (p.isStale) return "Mangler";
  if (p.isHigh) return "Høy";
  if (p.isUp) return "Økende";
  return "OK";
}

function hoursStatusText(h: any, hasUpcoming?: boolean): string {
  const nextAt = h?.nextAt ?? h?.nextStart ?? h?.next_session_at ?? null;
  if (nextAt) return formatShort(nextAt);

  if (hasUpcoming === true) return "Har";
  if (hasUpcoming === false) return "Mangler";
  return "—";
}

function hasAnyMacros(row: any) {
  const kcal = Number(row?.calories_kcal ?? 0);
  const p = Number(row?.protein_g ?? 0);
  const f = Number(row?.fat_g ?? 0);
  const k = Number(row?.carbs_g ?? 0);
  return kcal > 0 || p > 0 || f > 0 || k > 0;
}

// ✅ for alfabetisk sort
function fullNameKey(c: any) {
  const first = String(c?.first_name ?? "").trim();
  const last = String(c?.last_name ?? "").trim();
  return `${last} ${first}`.trim().toLowerCase();
}

/* ---------------- PAGE ---------------- */

export default function ClientsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { role, userId, loading: roleLoading } = useRole();
  const { clients, loading, error } = useClients();

  // =========================
  // ROLE GUARD (client-side)
  // =========================
  useEffect(() => {
    if (roleLoading) return;
    if (role === "trainer" || role === "admin") return;
    router.replace("/dashboard");
  }, [role, roleLoading, router]);

  if (roleLoading) return null;
  if (role !== "trainer" && role !== "admin") return null;

  // =========================
  // URL PARAMS
  // =========================
  const activeFilter = pickOne<FilterKey>(
    searchParams.get("filter"),
    ["all", "baseline-missing", "inactive-tests", "negative-progress", "positive-progress"] as const,
    "all"
  );

  const activePain = pickOne<PainFilterKey>(
    searchParams.get("pain"),
    ["none", "high", "up", "stale"] as const,
    "none"
  );

  const activeNutrition = pickOne<NutritionFilterKey>(
    searchParams.get("nutrition"),
    ["none", "missing", "missing-profile", "no-logs-7d", "logged-today"] as const,
    "none"
  );

  const activeHours = pickOne<HoursFilterKey>(
    searchParams.get("hours"),
    ["none", "missing"] as const,
    "none"
  );

  const activeUnassigned = searchParams.get("unassigned") === "1";

  // ✅ NY: sort (default = next)
  const activeSort = pickOne<SortKey>(searchParams.get("sort"), ["next", "alpha"] as const, "next");

  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  function pushParam(key: string, value: string | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (!value || value === "none" || value === "all") sp.delete(key);
    else sp.set(key, value);
    router.push(`${pathname}?${sp.toString()}`);
  }

  function setFilter(next: FilterKey) {
    pushParam("filter", next === "all" ? null : next);
  }
  function setPain(next: PainFilterKey) {
    pushParam("pain", next === "none" ? null : next);
  }
  function setNutrition(next: NutritionFilterKey) {
    pushParam("nutrition", next === "none" ? null : next);
  }
  function setHours(next: HoursFilterKey) {
    pushParam("hours", next === "none" ? null : next);
  }
  function clearUnassigned() {
    pushParam("unassigned", null);
  }

  // ✅ NY: set sort (vi lagrer "alpha" i url, "next" er default og fjernes)
  function setSort(next: SortKey) {
    pushParam("sort", next === "next" ? null : next);
  }

  function resetAllFilters() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("filter");
    sp.delete("pain");
    sp.delete("nutrition");
    sp.delete("hours");
    sp.delete("unassigned");
    sp.delete("sort"); // ✅ NY
    router.push(`${pathname}?${sp.toString()}`);
  }

  // =========================
  // Visible clients (admin = alle, trainer = egne)
  // =========================
  const visibleClients = useMemo(() => {
    if (role === "admin") return clients;
    return clients.filter((c) => c.trainer_id === userId);
  }, [clients, role, userId]);

  const visibleClientIds = useMemo(() => visibleClients.map((c) => c.id), [visibleClients]);

  // Søk påvirker kun lista, ikke varselkort
  const searched = useMemo(() => {
    if (!query.trim()) return visibleClients;
    const q = query.toLowerCase();
    return visibleClients.filter((c) =>
      `${c.first_name ?? ""} ${c.last_name ?? ""} ${c.city ?? ""}`.toLowerCase().includes(q)
    );
  }, [query, visibleClients]);

  // =========================
  // METRICS
  // =========================
  const {
    loading: testsLoading,
    error: testsError,
    byClientId: testByClientId,
    stats: testStats,
  } = useTestMetricsForClients({
    clientIds: visibleClientIds,
    inactiveDays: 30,
  });

  const {
    loading: painLoading,
    error: painError,
    byClientId: painByClientId,
    stats: painStats,
  } = usePainMetricsForClients({
    clientIds: visibleClientIds,
    highThreshold: 7,
    staleDays: 10,
  });

  // PROFIL (nutrition_profiles)
  const {
    loading: nutLoading,
    error: nutError,
    hasProfileByClientId,
    missingCount: missingNutritionCount,
  } = useNutritionMetricsForClients({ clientIds: visibleClientIds });

  const {
    loading: hoursLoading,
    error: hoursError,
    hasUpcomingByClientId,
    missingUpcomingCount,
    byClientId: hoursByClientIdMaybe,
  } = useTrainingHoursMetricsForClients({
    clientIds: visibleClientIds,
    daysAhead: 30,
  }) as any;

  const hoursByClientId: Record<string, any> = hoursByClientIdMaybe ?? {};

  // =========================
  // ✅ NESTE TIME (korrekt per klient – hentes direkte fra bookings)
  //    Dette fikser "Mangler" selv om det finnes time.
  // =========================
  const [nextSessionByClientId, setNextSessionByClientId] = useState<Record<string, string>>({});
  // ✅ NY (kun for sortering): behold ISO start_time
  const [nextSessionAtByClientId, setNextSessionAtByClientId] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!visibleClientIds.length) {
        setNextSessionByClientId({});
        setNextSessionAtByClientId({});
        return;
      }

      try {
        const nowISO = new Date().toISOString();

        // Hent kommende bookinger for alle synlige klienter (ikke cancelled)
        const { data, error } = await supabase
          .from("bookings")
          .select("client_id,start_time,status")
          .in("client_id", visibleClientIds)
          .neq("status", "cancelled")
          .gte("start_time", nowISO)
          .order("start_time", { ascending: true })
          .limit(5000);

        if (error) throw error;

        // plukk første (tidligste) booking per klient
        const mapLabel: Record<string, string> = {};
        const mapISO: Record<string, string> = {};

        for (const r of (data ?? []) as any[]) {
          const cid = String(r.client_id ?? "");
          if (!cid) continue;
          if (mapISO[cid]) continue; // første er tidligst pga order

          const iso = String(r.start_time ?? "");
          const label = prettyDateTime(iso);
          if (!iso || !label) continue;

          mapISO[cid] = iso;
          mapLabel[cid] = label;
        }

        if (!alive) return;
        setNextSessionByClientId(mapLabel);
        setNextSessionAtByClientId(mapISO);
      } catch (e) {
        if (!alive) return;
        // ved feil: ikke kræsje – bare fall back til "Mangler/Har"
        setNextSessionByClientId({});
        setNextSessionAtByClientId({});
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [visibleClientIds]);

  // =========================
  // NUTRITION ACTIVITY (logs)
  // =========================
  const [nutActLoading, setNutActLoading] = useState(false);
  const [nutActError, setNutActError] = useState<string | null>(null);
  const [hasLoggedTodayByClientId, setHasLoggedTodayByClientId] = useState<Record<string, boolean>>({});
  const [hasAnyLogLast7ByClientId, setHasAnyLogLast7ByClientId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const run = async () => {
      if (!visibleClientIds.length) {
        setHasLoggedTodayByClientId({});
        setHasAnyLogLast7ByClientId({});
        return;
      }

      setNutActLoading(true);
      setNutActError(null);

      try {
        const today = yyyyMmDd(new Date());
        const from7 = yyyyMmDd(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

        const { data, error } = await supabase
          .from("nutrition_days")
          .select("user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g")
          .in("user_id", visibleClientIds)
          .gte("day_date", from7)
          .lte("day_date", today);

        if (error) throw error;

        const byUser = new Map<string, { any7: boolean; today: boolean }>();
        for (const uid of visibleClientIds) byUser.set(uid, { any7: false, today: false });

        for (const r of (data ?? []) as any[]) {
          const uid = String(r.user_id ?? "");
          const day = String(r.day_date ?? "");
          if (!uid || !day) continue;
          if (!hasAnyMacros(r)) continue;

          const cur = byUser.get(uid) ?? { any7: false, today: false };
          cur.any7 = true;
          if (day === today) cur.today = true;
          byUser.set(uid, cur);
        }

        const mapToday: Record<string, boolean> = {};
        const map7: Record<string, boolean> = {};
        for (const [uid, v] of byUser.entries()) {
          mapToday[uid] = !!v.today;
          map7[uid] = !!v.any7;
        }

        setHasLoggedTodayByClientId(mapToday);
        setHasAnyLogLast7ByClientId(map7);
      } catch (e: any) {
        setNutActError(e?.message ?? "Ukjent feil");
        setHasLoggedTodayByClientId({});
        setHasAnyLogLast7ByClientId({});
      } finally {
        setNutActLoading(false);
      }
    };

    run();
  }, [visibleClientIds]);

  // =========================
  // FILTER + SORT (liste)
  // =========================
  const results = useMemo(() => {
    let list = searched;

    // ✅ Uten trener (unassigned)
    if (activeUnassigned) {
      list = list.filter((c) => !c.trainer_id);
    }

    // Test-filter
    if (activeFilter !== "all") {
      list = list.filter((c) => {
        const m = testByClientId[c.id];

        if (activeFilter === "baseline-missing") return (m?.missingCategories?.length ?? 0) > 0 || !m;
        if (activeFilter === "inactive-tests") return (m?.daysSinceLastTest ?? 9999) > 30;
        if (activeFilter === "negative-progress") return (m?.avgPct ?? 0) < 0;
        if (activeFilter === "positive-progress") return (m?.avgPct ?? 0) > 0;
        return true;
      });
    }

    // Pain-param
    if (activePain !== "none") {
      list = list.filter((c) => {
        const p = painByClientId[c.id];
        if (!p) return activePain === "stale";
        if (activePain === "high") return p.isHigh;
        if (activePain === "up") return p.isUp;
        if (activePain === "stale") return p.isStale;
        return true;
      });
    }

    // Nutrition-param (bakoverkompat "missing" => missing-profile)
    const nutKey = activeNutrition === "missing" ? "missing-profile" : activeNutrition;

    if (nutKey === "missing-profile") {
      list = list.filter((c) => !hasProfileByClientId[c.id]);
    }
    if (nutKey === "no-logs-7d") {
      list = list.filter((c) => !hasAnyLogLast7ByClientId[c.id]);
    }
    if (nutKey === "logged-today") {
      list = list.filter((c) => !!hasLoggedTodayByClientId[c.id]);
    }

    // Hours-param
    if (activeHours === "missing") {
      list = list.filter((c) => !hasUpcomingByClientId[c.id]);
    }

    // ✅ SORTERING (frontend only)
    const sorted = [...list].sort((a, b) => {
      if (activeSort === "alpha") {
        return fullNameKey(a).localeCompare(fullNameKey(b), "no", { sensitivity: "base" });
      }

      // default = "next"
      const aISO = nextSessionAtByClientId[a.id] ?? null;
      const bISO = nextSessionAtByClientId[b.id] ?? null;

      const aT = aISO ? new Date(aISO).getTime() : Number.POSITIVE_INFINITY;
      const bT = bISO ? new Date(bISO).getTime() : Number.POSITIVE_INFINITY;

      if (aT !== bT) return aT - bT;

      // fallback alfabetisk
      return fullNameKey(a).localeCompare(fullNameKey(b), "no", { sensitivity: "base" });
    });

    return sorted;
  }, [
    searched,
    activeUnassigned,
    activeFilter,
    activePain,
    activeNutrition,
    activeHours,
    activeSort,
    testByClientId,
    painByClientId,
    hasProfileByClientId,
    hasAnyLogLast7ByClientId,
    hasLoggedTodayByClientId,
    hasUpcomingByClientId,
    nextSessionAtByClientId,
  ]);

  // =========================
  // LOADING / ERROR (clients)
  // =========================
  if (loading) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster kunder…</p>
      </AppPage>
    );
  }

  if (error) {
    return (
      <AppPage>
        <p className="text-sm text-red-600">{error}</p>
      </AppPage>
    );
  }

  // =========================
  // COUNTS FOR ALERT CARDS
  // =========================
  const painMissingJournal = painStats.stale ?? 0;
  const baselineMissing = testStats.missingBaseline ?? 0;

  const nutritionMissingProfile = missingNutritionCount ?? 0;
  const nutritionNoLogs7d = Object.values(hasAnyLogLast7ByClientId).filter((v) => v === false).length;
  const nutritionLoggedToday = Object.values(hasLoggedTodayByClientId).filter((v) => v === true).length;

  const trainingHoursMissing = missingUpcomingCount ?? 0;

  return (
    <AppPage>
      {/* 🔍 Søk */}
      <Section1ClientSearch value={query} onChange={setQuery} />

      {/* ✅ NY: Sorter dropdown */}
      <div className="mt-3 flex items-center justify-end">
        <select
          value={activeSort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
          title="Sorter kunder"
        >
          <option value="next">Sorter: Neste time</option>
          <option value="alpha">Sorter: Alfabetisk</option>
        </select>
      </div>

      {/* 🚨 Varsler */}
      <Section2ClientAlerts
        painMissingJournal={painMissingJournal}
        baselineMissing={baselineMissing}
        trainingHoursMissing={trainingHoursMissing}
        nutritionMissingProfile={nutritionMissingProfile}
        nutritionNoLogs7d={nutritionNoLogs7d}
        nutritionLoggedToday={nutritionLoggedToday}
        painLoading={painLoading}
        testsLoading={testsLoading}
        nutLoading={nutLoading || nutActLoading}
        hoursLoading={hoursLoading}
        painError={painError}
        testsError={testsError}
        nutError={nutError ?? nutActError}
        hoursError={hoursError}
        onPainStale={() => setPain("stale")}
        onBaselineMissing={() => setFilter("baseline-missing")}
        onNutritionMissingProfile={() => setNutrition("missing-profile")}
        onNutritionNoLogs7d={() => setNutrition("no-logs-7d")}
        onNutritionLoggedToday={() => setNutrition("logged-today")}
        onHoursMissing={() => setHours("missing")}
      />

      {/* ✅ Aktive filtre */}
      <Section3ActiveFiltersRow
        activeFilter={activeFilter}
        activePain={activePain}
        activeNutrition={activeNutrition === "missing" ? "missing-profile" : activeNutrition}
        activeHours={activeHours}
        activeUnassigned={activeUnassigned}
        onClearTest={() => setFilter("all")}
        onClearPain={() => setPain("none")}
        onClearNutrition={() => setNutrition("none")}
        onClearHours={() => setHours("none")}
        onClearUnassigned={clearUnassigned}
        onResetAll={resetAllFilters}
      />

      {/* 👥 Kunde-kort */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {results.map((client) => {
          const cid = client.id;

          const t = testByClientId[cid];
          const p = painByClientId[cid];
          const hasNutProfile = Boolean(hasProfileByClientId[cid]);
          const hasUpcoming = Boolean(hasUpcomingByClientId[cid]);
          const h = hoursByClientId[cid];

          // ✅ Bruk "ekte" neste time (datotekst) hvis vi har den
          const nextLabel = nextSessionByClientId[cid] ?? null;

          const status = {
            nextSession: nextLabel ?? (hasUpcoming ? hoursStatusText(h, hasUpcoming) : "Mangler"),
            painLevel: painStatusText(p),
            testStatus: testStatusText(t),
            nutritionStatus: hasNutProfile ? "OK" : "Mangler",
          };

          return <ClientCard key={cid} client={client} href={`/clients/${cid}`} status={status} />;
        })}
      </section>

      {results.length === 0 && <p className="text-sm text-sf-muted mt-4">Ingen kunder matcher søk/filter.</p>}
    </AppPage>
  );
}