"use client";

import { useRole } from "@/providers/RoleProvider";
import {
  Utensils,
  AlertTriangle,
  BarChart,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section6Nutrition() {
  const { role } = useRole();

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Kosthold
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ======================= KUNDE ======================= */}
        {role === "client" && (
          <>
            <DashboardCard
              title="Status i dag"
              icon={<Utensils size={18} />}
            >
              <p>Ingen registrering i dag.</p>
              <p className="text-xs text-sf-muted">
                Logg matinntak for bedre oversikt.
              </p>

              <div className="mt-3">
                <button className="w-full rounded-xl bg-[#E6F3F6] py-2 text-sm font-medium text-[#007C80]">
                  Logg dagens matinntak
                </button>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Siste 7 dager"
              icon={<BarChart size={18} />}
            >
              <p>Snitt: <strong>2092 kcal</strong></p>
              <p className="text-xs text-sf-muted">
                Basert på siste registreringer
              </p>

              <div className="mt-3">
                <button className="w-full rounded-xl border border-sf-border py-2 text-sm">
                  Se kosthold
                </button>
              </div>
            </DashboardCard>
          </>
        )}

        {/* ======================= TRENER ======================= */}
        {role === "trainer" && (
          <>
            <DashboardCard
              title="Manglende logging"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p>6 klienter har ikke logget kosthold.</p>

              <div className="mt-3">
                <button
                  disabled
                  className="w-full rounded-xl border border-sf-border py-2 text-sm opacity-50 cursor-not-allowed"
                >
                  Se klienter
                </button>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Under energibehov"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p>3 klienter ligger under beregnet behov.</p>

              <div className="mt-3">
                <button
                  disabled
                  className="w-full rounded-xl border border-sf-border py-2 text-sm opacity-50 cursor-not-allowed"
                >
                  Følg opp
                </button>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Ufullstendige profiler"
              icon={<Users size={18} />}
            >
              <p>2 klienter mangler kostholdsprofil.</p>
            </DashboardCard>
          </>
        )}

        {/* ======================= ADMIN ======================= */}
        {role === "admin" && (
          <>
            <DashboardCard
              title="Aktiv kostholdslogging"
              icon={<BarChart size={18} />}
            >
              <p>68 % av aktive kunder logger kosthold.</p>
            </DashboardCard>

            <DashboardCard
              title="Fullførte profiler"
              icon={<Users size={18} />}
            >
              <p>74 % har ferdig kostholdsprofil.</p>
            </DashboardCard>

            <DashboardCard
              title="Systemoversikt"
              icon={<Utensils size={18} />}
            >
              <p>Kostholdsdata mottatt siste 7 dager:</p>
              <p className="text-sm"><strong>412 registreringer</strong></p>
            </DashboardCard>
          </>
        )}

      </div>
    </section>
  );
}