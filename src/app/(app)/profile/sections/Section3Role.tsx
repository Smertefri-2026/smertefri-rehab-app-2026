"use client";

import { useRole } from "@/providers/RoleProvider";

export default function Section3Role() {
  const { role } = useRole();

  if (!role) return null;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-sf-text">
          Rolle & tilknytning
        </h3>

        {/* ================= KUNDE ================= */}
        {role === "client" && (
          <div className="space-y-3">
            <p className="text-sm text-sf-muted">
              Du er registrert som kunde.
            </p>

            <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
              <p className="text-sm font-medium">Din trener</p>
              <p className="text-sm text-sf-muted">
                PT Øystein · Drammen
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs border">
                  Rehab-trening
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs border">
                  Online oppfølging
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TRENER ================= */}
        {role === "trainer" && (
          <div className="space-y-3">
            <p className="text-sm text-sf-muted">
              Du er registrert som trener.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-sf-soft p-4">
                <p className="text-sm font-medium">Aktive kunder</p>
                <p className="text-lg font-semibold">14</p>
              </div>

              <div className="rounded-xl border bg-sf-soft p-4">
                <p className="text-sm font-medium">Ledige timer</p>
                <p className="text-lg font-semibold">6</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <div className="space-y-3">
            <p className="text-sm text-sf-muted">
              Du har administrator-tilgang.
            </p>

            <div className="rounded-xl border bg-sf-soft p-4">
              <p className="text-sm font-medium">Systemansvar</p>
              <p className="text-sm text-sf-muted">
                Full tilgang til brukere, trenere og innstillinger.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}