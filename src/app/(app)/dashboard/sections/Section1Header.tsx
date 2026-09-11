// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section1Header.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRole } from "@/providers/RoleProvider";
import { CalendarClock, Users } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useBookings } from "@/stores/bookings.store";
import { getProfilesByIds } from "@/lib/profile";
import { getActiveTrainerIdForClient } from "@/lib/assignments.api";
import { supabase } from "@/lib/supabaseClient";

type NameMap = Record<string, string>;

function fullNameRow(r: { id: string; first_name: string | null; last_name: string | null }) {
  const n = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim();
  return n || r.id;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() + 1);
  return x;
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

export default function Section1Header() {
  const { role, userId } = useRole();
  const { bookings } = useBookings();

  // ===== Min profil (navn + trainer_id for kunde) =====
  const [myName, setMyName] = useState<string>(""); // fallback vises hvis tom
  const [myTrainerId, setMyTrainerId] = useState<string | null>(null);

  // ===== Navne-cache for bookings (trainer/client) =====
  const [namesById, setNamesById] = useState<NameMap>({});

  // ===== Admin stats =====
  const [adminCounts, setAdminCounts] = useState<{
    clients: number;
    trainers: number;
  } | null>(null);

  // 1) Hent min profil (navn + trainer_id hvis kunde)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!userId) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, role")
          .eq("id", userId)
          .single();

        if (error) throw error;

        const name = `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim();
        if (alive) setMyName(name);

        if (data?.role === "client") {
          const trainerId = await getActiveTrainerIdForClient(userId);
          if (alive) setMyTrainerId(trainerId);
        } else if (alive) {
          setMyTrainerId(null);
        }
      } catch (e: any) {
        console.warn("Kunne ikke hente min profil:", e?.message);
        if (alive) {
          setMyName("");
          setMyTrainerId(null);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  // 2) Bygg name-cache fra bookings (slik at “Kunde/Trener” blir faktiske navn)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ids = Array.from(
          new Set(
            (bookings ?? [])
              .flatMap((b: any) => [b.client_id, b.trainer_id])
              .filter(Boolean)
          )
        ) as string[];

        if (!ids.length) return;

        const rows = await getProfilesByIds(ids);

        const map: NameMap = {};
        for (const r of rows) map[r.id] = fullNameRow(r);

        if (!cancelled) setNamesById((prev) => ({ ...prev, ...map }));
      } catch (e) {
        console.warn("getProfilesByIds failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookings]);

  // 3) Admin: hent counts (kunder + trenere)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (role !== "admin") return;

        const { count: clientCount, error: cErr } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "client");

        if (cErr) throw cErr;

        const { count: trainerCount, error: tErr } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "trainer");

        if (tErr) throw tErr;

        if (alive) {
          setAdminCounts({
            clients: clientCount ?? 0,
            trainers: trainerCount ?? 0,
          });
        }
      } catch (e: any) {
        console.warn("Kunne ikke hente admin counts:", e?.message);
        if (alive) setAdminCounts(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role]);

  const todayStart = useMemo(() => startOfDay(new Date()), []);
  const todayEnd = useMemo(() => endOfDay(new Date()), []);

  // ====== KUNDE: neste time ======
  const hasTrainer = role === "client" ? Boolean(myTrainerId) : false;

  const nextClientBooking = useMemo(() => {
    if (role !== "client" || !userId) return null;

    const upcoming = (bookings ?? [])
      .filter((b: any) => b.status !== "cancelled")
      .filter((b: any) => b.client_id === userId)
      .map((b: any) => ({
        ...b,
        _start: new Date(b.start_time),
      }))
      .filter((b: any) => b._start.getTime() > Date.now())
      .sort((a: any, b: any) => a._start.getTime() - b._start.getTime());

    return upcoming[0] ?? null;
  }, [role, userId, bookings]);

  const nextClientSessionView = useMemo(() => {
    if (!nextClientBooking) return null;

    const start = new Date(nextClientBooking.start_time);
    const trainerId = nextClientBooking.trainer_id as string;
    const trainerName = namesById[trainerId] ?? "Trener";

    return {
      date: formatDateNo(start),
      time: formatTimeHHMM(start),
      trainer: trainerName,
    };
  }, [nextClientBooking, namesById]);

  // ====== TRENER: dagens timer (eller neste arbeidsdag) ======
  const trainerSessionsToday = useMemo(() => {
    if (role !== "trainer" || !userId) return [];

    return (bookings ?? [])
      .filter((b: any) => b.status !== "cancelled")
      .filter((b: any) => b.trainer_id === userId)
      .map((b: any) => {
        const start = new Date(b.start_time);
        return {
          id: b.id,
          start,
          time: formatTimeHHMM(start),
          clientId: b.client_id as string,
        };
      })
      .filter((s) => s.start >= todayStart && s.start < todayEnd)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [role, userId, bookings, todayStart, todayEnd]);

  const trainerNextWorkdaySessions = useMemo(() => {
    if (role !== "trainer" || !userId) return null;
    if (trainerSessionsToday.length > 0) return null;

    const future = (bookings ?? [])
      .filter((b: any) => b.status !== "cancelled")
      .filter((b: any) => b.trainer_id === userId)
      .map((b: any) => ({
        id: b.id,
        start: new Date(b.start_time),
        time: formatTimeHHMM(new Date(b.start_time)),
        clientId: b.client_id as string,
      }))
      .filter((s: any) => s.start.getTime() > Date.now())
      .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

    if (!future.length) return null;

    const firstDay = future[0].start;
    const sameDayList = future.filter((s: any) => sameDay(s.start, firstDay)).slice(0, 6);

    return {
      dayLabel: formatDateNo(firstDay),
      sessions: sameDayList,
    };
  }, [role, userId, bookings, trainerSessionsToday.length]);

  // Navn i trener-listene
  const trainerSessionsTodayView = useMemo(() => {
    return trainerSessionsToday.map((s) => ({
      time: s.time,
      client: namesById[s.clientId] ?? "Kunde",
    }));
  }, [trainerSessionsToday, namesById]);

  const trainerNextWorkdayView = useMemo(() => {
    if (!trainerNextWorkdaySessions) return null;
    return {
      dayLabel: trainerNextWorkdaySessions.dayLabel,
      sessions: trainerNextWorkdaySessions.sessions.map((s) => ({
        time: s.time,
        client: namesById[s.clientId] ?? "Kunde",
      })),
    };
  }, [trainerNextWorkdaySessions, namesById]);

  // ====== ADMIN: sessions today + “high activity” ======
  const adminSessionsTodayCount = useMemo(() => {
    if (role !== "admin") return 0;

    return (bookings ?? [])
      .filter((b: any) => b.status !== "cancelled")
      .map((b: any) => new Date(b.start_time))
      .filter((d: Date) => d >= todayStart && d < todayEnd).length;
  }, [role, bookings, todayStart, todayEnd]);

  const highActivity = useMemo(() => {
    if (role !== "admin") return false;
    return adminSessionsTodayCount >= 40;
  }, [role, adminSessionsTodayCount]);

  return (
    <section className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl font-semibold text-sf-text">Hei{myName ? `, ${myName}` : ""} 👋</h1>

        <p className="text-sm text-sf-muted mt-1">
          {role === "client" && "Din personlige oversikt"}
          {role === "trainer" && "Din arbeidsdag"}
          {role === "admin" && "System- og driftsoversikt"}
        </p>
      </div>

      {/* ================= KUNDE ================= */}
      {role === "client" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!hasTrainer && (
            <DashboardCard
              title="Rehabtrener"
              icon={<Users size={18} />}
              variant="info"
              href="/trainer"
            >
              <p>Du er ikke koblet med en rehabtrener akkurat nå.</p>
              <p className="text-sm text-ink-soft">
                SmerteFri kobler deg med en som en del av oppstarten.
              </p>
            </DashboardCard>
          )}

          {hasTrainer && nextClientSessionView && (
            <DashboardCard
              title="Neste treningstime"
              icon={<CalendarClock size={18} />}
              variant="info"
              href="/calendar"
            >
              <p className="font-medium">
                {nextClientSessionView.date} · {nextClientSessionView.time}
              </p>
              <p className="text-sm text-sf-muted">Trener: {nextClientSessionView.trainer}</p>
            </DashboardCard>
          )}

          {hasTrainer && !nextClientSessionView && (
            <DashboardCard
              title="Ingen kommende avtale"
              icon={<CalendarClock size={18} />}
              variant="info"
              href="/calendar"
            >
              <p>Du har ingen flere økter planlagt.</p>
              <p className="text-sm text-sf-muted">Book ny time når det passer deg.</p>
            </DashboardCard>
          )}
        </div>
      )}

      {/* ================= TRENER ================= */}
      {role === "trainer" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainerSessionsTodayView.length > 0 ? (
            <DashboardCard
              title="Dagens økter"
              icon={<CalendarClock size={18} />}
              variant="info"
              href="/calendar"
            >
              <ul className="text-sm space-y-1">
                {trainerSessionsTodayView.slice(0, 8).map((s) => (
                  <li key={`${s.time}-${s.client}`}>
                    {s.time} – {s.client}
                  </li>
                ))}
              </ul>
            </DashboardCard>
          ) : trainerNextWorkdayView ? (
            <DashboardCard
              title={`Ingen økter i dag – neste dag: ${trainerNextWorkdayView.dayLabel}`}
              icon={<CalendarClock size={18} />}
              variant="info"
              href="/calendar"
            >
              <ul className="text-sm space-y-1">
                {trainerNextWorkdayView.sessions.slice(0, 8).map((s) => (
                  <li key={`${s.time}-${s.client}`}>
                    {s.time} – {s.client}
                  </li>
                ))}
              </ul>
            </DashboardCard>
          ) : (
            <DashboardCard
              title="Ingen kommende økter"
              icon={<CalendarClock size={18} />}
              variant="info"
              href="/calendar"
            >
              <p>Dagen er tom – og du har ingen bookinger framover.</p>
            </DashboardCard>
          )}
        </div>
      )}

      {/* ================= ADMIN ================= */}
      {role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="Status i dag"
            icon={<Users size={18} />}
            variant="info"
            href="/calendar"
          >
            <ul className="text-sm space-y-1">
              <li>Aktive kunder: {adminCounts?.clients ?? "—"}</li>
              <li>Rehab-trenere: {adminCounts?.trainers ?? "—"}</li>
              <li>Økter i dag: {adminSessionsTodayCount}</li>
            </ul>
          </DashboardCard>

          {highActivity && (
            <DashboardCard
              title="Høy aktivitet"
              icon={<Users size={18} />}
              variant="warning"
              href="/calendar"
            >
              <p>Uvanlig mange økter i dag.</p>
            </DashboardCard>
          )}
        </div>
      )}
    </section>
  );
}