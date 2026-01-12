"use client";

import { useRole } from "@/providers/RoleProvider";

export default function Section4Billing() {
  const { role } = useRole();

  if (!role) return null;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-sf-text">
          Abonnement & betaling
        </h3>

        {/* ================= KUNDE ================= */}
        {role === "client" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-sf-soft p-4">
              <p className="text-sm font-medium">
                Aktivt abonnement
              </p>
              <p className="text-sm text-sf-muted">
                Rehab Basis · 1 495 kr / mnd
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Neste betaling: 01.02.2026
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button className="rounded-full bg-[#007C80] px-6 py-3 text-sm text-white">
                Oppgrader abonnement
              </button>
              <button className="rounded-full border px-6 py-3 text-sm">
                Se betalingshistorikk
              </button>
            </div>
          </div>
        )}

        {/* ================= TRENER ================= */}
        {role === "trainer" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-sf-soft p-4">
              <p className="text-sm font-medium">
                Trenerabonnement
              </p>
              <p className="text-sm text-sf-muted">
                Pro Trener · 999 kr / mnd
              </p>
            </div>

            <button className="rounded-full bg-[#007C80] px-6 py-3 text-sm text-white">
              Administrer abonnement
            </button>
          </div>
        )}

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-sf-soft p-4">
              <p className="text-sm font-medium">
                Betalingssystem
              </p>
              <p className="text-sm text-sf-muted">
                Stripe aktiv · System OK
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}