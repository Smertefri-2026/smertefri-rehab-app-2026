"use client";

export default function Section6DeleteAccount() {
  /**
   * 🔧 DUMMY STATUS
   * Logikk kobles senere mot:
   * - Supabase Auth (delete user)
   * - Soft delete i profiles
   * - Eventuell karantenetid
   */

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <div className="space-y-4">

        {/* ⚠️ Header */}
        <h3 className="text-sm font-semibold text-red-700">
          Fareområde
        </h3>

        {/* 📄 Forklaring */}
        <div className="space-y-2 text-sm text-red-700">
          <p>
            Å slette kontoen er <strong>permanent</strong>.
          </p>
          <p>
            All personlig informasjon, historikk, tester og
            meldinger vil bli fjernet.
          </p>
        </div>

        {/* 🧨 Handling */}
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-red-700">
              Slett konto
            </p>
            <p className="text-sm text-red-600">
              Denne handlingen kan ikke angres.
            </p>
          </div>

          <button
            className="
              rounded-full
              border border-red-300
              px-6 py-2.5
              text-sm font-medium
              text-red-700
              hover:bg-red-100
            "
            onClick={() =>
              alert(
                "Dette er kun en dummy.\nKonto slettes ikke ennå."
              )
            }
          >
            Slett konto
          </button>
        </div>

        {/* 🧠 Fotnote */}
        <p className="text-xs text-red-600">
          Tips: Dersom du kun ønsker en pause, kan du kontakte
          support for midlertidig deaktivering.
        </p>
      </div>
    </section>
  );
}