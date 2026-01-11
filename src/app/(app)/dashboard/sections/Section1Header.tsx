"use client";

import { useRole } from "@/providers/RoleProvider";
import { CalendarClock, Users } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section1Header() {
  const { role } = useRole();
  const name = "Øistein"; // erstattes senere av profil-data

  /* --------------------------------
     DUMMY DATA (kun for nå)
     kobles mot ekte data senere
  -------------------------------- */

  // Kunde
  const hasUpcomingSession = true;

  // Trener
  const trainerSessionsToday = [
    { time: "09:00", client: "Kunde A" },
    { time: "11:30", client: "Kunde B" },
  ];
  const isTrainerFullyBooked = false;

  // Admin
  const adminStats = {
    clients: 128,
    trainers: 14,
    sessionsToday: 36,
    highActivity: false,
  };

  return (
    <section className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl font-semibold text-sf-text">
          Hei, {name} 👋
        </h1>

        <p className="text-sm text-sf-muted mt-1">
          {role === "client" && "Din personlige oversikt"}
          {role === "trainer" && "Din arbeidsdag"}
          {role === "admin" && "System- og driftsoversikt"}
        </p>
      </div>

      {/* ================= KUNDE ================= */}
      {role === "client" && hasUpcomingSession && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="Neste treningstime"
            icon={<CalendarClock size={18} />}
            variant="info"
          >
            <p className="font-medium">
              Onsdag 31.12 · 09:00
            </p>
            <p className="text-sm text-sf-muted">
              Trener: Øistein
            </p>
          </DashboardCard>
        </div>
      )}

      {/* ================= TRENER ================= */}
      {role === "trainer" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainerSessionsToday.length === 0 && (
            <DashboardCard
              title="Ingen økter i dag"
              icon={<CalendarClock size={18} />}
              variant="info"
            >
              <p>Dagen er foreløpig uten bookinger.</p>
            </DashboardCard>
          )}

          {trainerSessionsToday.length > 0 && (
            <DashboardCard
              title="Dagens økter"
              icon={<CalendarClock size={18} />}
              variant="info"
            >
              <ul className="text-sm space-y-1">
                {trainerSessionsToday.map((s) => (
                  <li key={s.time}>
                    {s.time} – {s.client}
                  </li>
                ))}
              </ul>
            </DashboardCard>
          )}

          {isTrainerFullyBooked && (
            <DashboardCard
              title="Fullbooket dag"
              icon={<CalendarClock size={18} />}
              variant="warning"
            >
              <p>Flere økter enn normalt i dag.</p>
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
          >
            <ul className="text-sm space-y-1">
              <li>Aktive kunder: {adminStats.clients}</li>
              <li>Rehab-trenere: {adminStats.trainers}</li>
              <li>Økter i dag: {adminStats.sessionsToday}</li>
            </ul>
          </DashboardCard>

          {adminStats.highActivity && (
            <DashboardCard
              title="Høy aktivitet"
              icon={<Users size={18} />}
              variant="warning"
            >
              <p>Uvanlig mange økter og innlogginger.</p>
            </DashboardCard>
          )}
        </div>
      )}
    </section>
  );
}