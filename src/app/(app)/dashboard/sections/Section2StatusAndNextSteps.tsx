"use client";

import { useRole } from "@/providers/RoleProvider";
import {
  AlertTriangle,
  CreditCard,
  CalendarClock,
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section2StatusAndNextSteps() {
  const { role } = useRole();

  /* --------------------------------
     🔧 DUMMY STATUS (kun for nå)
     → erstattes senere med ekte data
  -------------------------------- */

  const status = {
    // Felles
    profileIncomplete: true,

    // Kunde
    client: {
      paymentMissing: true,
      noUpcomingSession: true,
    },

    // Trener
    trainer: {
      freeCapacity: true,
      clientsWithoutSessions: 3,
    },

    // Admin
    admin: {
      usersWithoutPayment: 12,
      profilesIncomplete: 7,
    },
  };

  /* --------------------------------
     HJELPER: finnes det varsler?
  -------------------------------- */

  const hasClientIssues =
    status.profileIncomplete ||
    status.client.paymentMissing ||
    status.client.noUpcomingSession;

  const hasTrainerIssues =
    status.profileIncomplete ||
    status.trainer.freeCapacity ||
    status.trainer.clientsWithoutSessions > 0;

  const hasAdminIssues =
    status.profileIncomplete ||
    status.admin.usersWithoutPayment > 0 ||
    status.admin.profilesIncomplete > 0;

  const shouldRender =
    (role === "client" && hasClientIssues) ||
    (role === "trainer" && hasTrainerIssues) ||
    (role === "admin" && hasAdminIssues);

  if (!shouldRender) return null;

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Varsler & mangler
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* ================== FELLES ================== */}
        {status.profileIncomplete && (
          <DashboardCard
            title="Profil ikke fullført"
            icon={<AlertTriangle size={18} />}
            variant="warning"
          >
            {role === "client" && (
              <>
                <p>Noen viktige felt mangler.</p>
                <p className="text-sm text-sf-muted">
                  Fullfør profilen for bedre oppfølging.
                </p>
              </>
            )}

            {role === "trainer" && (
              <>
                <p>Profilen din er synlig for kunder.</p>
                <p className="text-sm text-sf-muted">
                  Fullfør alle felt for tillit.
                </p>
              </>
            )}

            {role === "admin" && (
              <>
                <p>Admin-profilen er ikke komplett.</p>
                <p className="text-sm text-sf-muted">
                  Påkrevd for systemansvar.
                </p>
              </>
            )}
          </DashboardCard>
        )}

        {/* ================== KUNDE ================== */}
        {role === "client" && status.client.paymentMissing && (
          <DashboardCard
            title="Ingen aktiv betaling"
            icon={<CreditCard size={18} />}
            variant="danger"
          >
            <p>Tilgangen kan bli begrenset.</p>
            <p className="text-sm text-sf-muted">
              Registrer betalingsmetode.
            </p>
          </DashboardCard>
        )}

        {role === "client" && status.client.noUpcomingSession && (
          <DashboardCard
            title="Ingen kommende avtale"
            icon={<CalendarClock size={18} />}
            variant="info"
          >
            <p>Fast oppfølging gir bedre progresjon.</p>
            <p className="text-sm text-sf-muted">
              Finn ledig tid med rehab-trener.
            </p>
          </DashboardCard>
        )}

        {/* ================== TRENER ================== */}
        {role === "trainer" && status.trainer.freeCapacity && (
          <DashboardCard
            title="Ledig kapasitet"
            icon={<CalendarClock size={18} />}
            variant="info"
          >
            <p>Du har tilgjengelige tider.</p>
            <p className="text-sm text-sf-muted">
              Åpne for flere bookinger.
            </p>
          </DashboardCard>
        )}

        {role === "trainer" &&
          status.trainer.clientsWithoutSessions > 0 && (
            <DashboardCard
              title="Klienter uten avtale"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p>
                {status.trainer.clientsWithoutSessions} klienter
                mangler kommende økt.
              </p>
              <p className="text-sm text-sf-muted">
                Vurder å følge dem opp.
              </p>
            </DashboardCard>
          )}

        {/* ================== ADMIN ================== */}
        {role === "admin" &&
          status.admin.usersWithoutPayment > 0 && (
            <DashboardCard
              title="Manglende betalinger"
              icon={<CreditCard size={18} />}
              variant="danger"
            >
              <p>
                {status.admin.usersWithoutPayment} brukere mangler
                aktiv betaling.
              </p>
              <p className="text-sm text-sf-muted">
                Gå til betalingsoversikt.
              </p>
            </DashboardCard>
          )}

        {role === "admin" &&
          status.admin.profilesIncomplete > 0 && (
            <DashboardCard
              title="Ufullstendige profiler"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p>
                {status.admin.profilesIncomplete} brukere har
                ikke fullført profilen.
              </p>
              <p className="text-sm text-sf-muted">
                Kan påvirke kvalitet.
              </p>
            </DashboardCard>
          )}

      </div>
    </section>
  );
}