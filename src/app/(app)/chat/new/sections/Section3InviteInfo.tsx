"use client";

export default function Section3InviteInfo() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-2">
      <p className="text-sm">🔎 Søk og start samtale med eksisterende brukere.</p>

      <p className="text-sm text-sf-muted">
        Du kan starte samtale med brukere som allerede er registrert og som har navn på profilen sin.
      </p>

      <p className="text-xs text-sf-muted">
        Finner du ingen, må personen først registrere seg og fylle inn navn – så vil de dukke opp i søket.
      </p>
    </section>
  );
}