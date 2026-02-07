"use client";

export default function Section3InviteInfo() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-2">
      <p className="text-sm">🔎 Søk og start samtale med eksisterende brukere.</p>

      <p className="text-sm text-sf-muted">
        Finner du ingen, kan du invitere via e-post. Invitasjonen blir lagret i systemet, og når personen
        registrerer seg med samme e-post vil dere kunne starte samtale.
      </p>

      <p className="text-xs text-sf-muted">
        (E-postutsending kan kobles på senere med en liten Edge Function.)
      </p>
    </section>
  );
}