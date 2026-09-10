"use client";

/**
 * Sletting av konto. Håndteres på forespørsel i V1 — en selvbetjent
 * sletteflyt (Supabase Auth + soft-delete + karantene) kommer senere.
 */
export default function Section6DeleteAccount() {
  return (
    <section className="rounded-lg border border-transparent bg-danger-subtle p-6 shadow-card">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-danger-ink">Slett konto</h3>

        <p className="text-sm text-danger-ink">
          Du kan når som helst be om å få slettet kontoen din. Da fjerner vi
          personopplysninger, historikk, tester og meldinger permanent.
        </p>

        <p className="text-sm text-danger-ink">
          Send en forespørsel via{" "}
          <a
            href="https://smertefri.no/#kontakt"
            className="font-medium underline hover:no-underline"
          >
            kontaktskjemaet
          </a>{" "}
          med e-postadressen kontoen er registrert på, så behandler vi den.
        </p>

        <p className="text-xs text-danger-ink">
          Vil du bare ta en pause? Rehabtreneren din kan sette opplegget i
          vedlikeholdsmodus uten at du mister noe.
        </p>
      </div>
    </section>
  );
}
