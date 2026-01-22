"use client";

import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import {
  Activity,
  AlertTriangle,
  TrendingDown,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section5Tests() {
  const { role } = useRole();

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Tester & fremgang
      </h2>

      {/* =======================
         KUNDE – EGEN FREMGANG
      ======================= */}
     {role === "client" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

    {/* EGENVEKT */}
    <DashboardCard
      title="Egenvekt"
      icon={<Activity size={18} />}
      status="+8%"
    >
      <p className="text-sm text-sf-muted">
        Baseline → siste test
      </p>
      <p className="text-xs text-sf-muted">
        Sist testet: 23.11.25
      </p>

      <div className="mt-4">
        <Link
          href="/tests/egenvekt"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80] hover:bg-[#d8eef2] transition"
        >
          Åpne egenvekt-tester
        </Link>
      </div>
    </DashboardCard>

    {/* STYRKE */}
    <DashboardCard
      title="Styrke"
      icon={<Activity size={18} />}
      status="+10%"
    >
      <p className="text-sm text-sf-muted">
        1RM progresjon
      </p>
      <p className="text-xs text-sf-muted">
        Sist testet: 24.11.25
      </p>

      <div className="mt-4">
        <Link
          href="/tests/styrke"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80]"
        >
          Åpne styrke-tester
        </Link>
      </div>
    </DashboardCard>

    {/* KONDISJON */}
    <DashboardCard
      title="Kondisjon"
      icon={<Activity size={18} />}
      status="+100%"
    >
      <p className="text-sm text-sf-muted">
        4-minutters tester
      </p>
      <p className="text-xs text-sf-muted">
        Sist testet: 09.12.25
      </p>

      <div className="mt-4">
        <Link
          href="/tests/kondisjon"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80]"
        >
          Åpne kondisjon-tester
        </Link>
      </div>
    </DashboardCard>
  </div>
)}
      {/* =======================
         TRENER – KLIENTSTATUS
      ======================= */}
      {role === "trainer" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <Link href="/trainer/clients?filter=baseline">
            <DashboardCard
              title="Mangler baseline"
              status="3"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p className="text-sm">
                Klienter uten første test.
              </p>
              <p className="text-xs text-sf-muted mt-2">
                Se klienter →
              </p>
            </DashboardCard>
          </Link>

          <Link href="/trainer/clients?filter=inactive-tests">
            <DashboardCard
              title="Ikke testet siste 30 dager"
              status="5"
              icon={<Users size={18} />}
              variant="info"
            >
              <p className="text-sm">
                Kan trenge ny vurdering.
              </p>
              <p className="text-xs text-sf-muted mt-2">
                Se klienter →
              </p>
            </DashboardCard>
          </Link>

          <Link href="/trainer/clients?filter=negative-progress">
            <DashboardCard
              title="Negativ progresjon"
              status="1"
              icon={<TrendingDown size={18} />}
              variant="danger"
            >
              <p className="text-sm">
                Krever ekstra oppfølging.
              </p>
              <p className="text-xs text-sf-muted mt-2">
                Se klient →
              </p>
            </DashboardCard>
          </Link>

        </div>
      )}

      {/* =======================
         ADMIN – SYSTEMOVERSIKT
      ======================= */}
      {role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Link href="/admin/clients?filter=has-tests">
            <DashboardCard title="Klienter med tester" status="42">
              <p className="text-sm">
                Har minst én registrert test.
              </p>
            </DashboardCard>
          </Link>

          <Link href="/admin/clients?filter=no-tests">
            <DashboardCard
              title="Uten tester"
              status="11"
              variant="warning"
            >
              <p className="text-sm">
                Lav verdiopplevelse.
              </p>
              <p className="text-xs text-sf-muted mt-2">
                Se liste →
              </p>
            </DashboardCard>
          </Link>

          <Link href="/admin/clients?filter=no-trainer-no-tests">
            <DashboardCard
              title="Uten trener & tester"
              status="4"
              variant="danger"
            >
              <p className="text-sm">
                Kritisk risiko.
              </p>
              <p className="text-xs text-sf-muted mt-2">
                Se detaljer →
              </p>
            </DashboardCard>
          </Link>

          <DashboardCard title="Tester siste 30 dager" status="128">
            <p className="text-sm">
              Total aktivitet.
            </p>
          </DashboardCard>

        </div>
      )}
    </section>
  );
}