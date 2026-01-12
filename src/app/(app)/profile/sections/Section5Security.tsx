"use client";

export default function Section5Security() {
  /**
   * 🔧 DUMMY STATUS
   * Kobles senere mot Supabase Auth
   */
  const security = {
    emailVerified: true,
    passwordLastChanged: "3 måneder siden",
    twoFactorEnabled: false,
    sessionsActive: 1,
  };

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-5">

        {/* 🔐 Header */}
        <h3 className="text-sm font-semibold text-sf-text">
          Sikkerhet & innlogging
        </h3>

        {/* ================== E-POST ================== */}
        <div className="flex items-center justify-between rounded-xl border border-sf-border p-4">
          <div>
            <p className="text-sm font-medium">E-postbekreftelse</p>
            <p className="text-sm text-sf-muted">
              {security.emailVerified
                ? "E-post er bekreftet"
                : "E-post er ikke bekreftet"}
            </p>
          </div>

          {security.emailVerified ? (
            <span className="text-sm font-medium text-emerald-600">
              Bekreftet
            </span>
          ) : (
            <button className="rounded-full bg-[#007C80] px-5 py-2 text-sm font-medium text-white hover:opacity-90">
              Send bekreftelse
            </button>
          )}
        </div>

        {/* ================== PASSORD ================== */}
        <div className="flex items-center justify-between rounded-xl border border-sf-border p-4">
          <div>
            <p className="text-sm font-medium">Passord</p>
            <p className="text-sm text-sf-muted">
              Sist endret: {security.passwordLastChanged}
            </p>
          </div>

          <button className="rounded-full border border-sf-border px-5 py-2 text-sm hover:bg-sf-soft">
            Endre passord
          </button>
        </div>

        {/* ================== 2FA ================== */}
        <div className="flex items-center justify-between rounded-xl border border-sf-border p-4">
          <div>
            <p className="text-sm font-medium">
              Tofaktorautentisering (2FA)
            </p>
            <p className="text-sm text-sf-muted">
              {security.twoFactorEnabled
                ? "Ekstra sikkerhet er aktivert"
                : "Anbefales for økt sikkerhet"}
            </p>
          </div>

          <button
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              security.twoFactorEnabled
                ? "border border-sf-border hover:bg-sf-soft"
                : "bg-[#007C80] text-white hover:opacity-90"
            }`}
          >
            {security.twoFactorEnabled
              ? "Administrer"
              : "Aktiver 2FA"}
          </button>
        </div>

        {/* ================== ØKTER ================== */}
        <div className="flex items-center justify-between rounded-xl border border-sf-border p-4">
          <div>
            <p className="text-sm font-medium">Aktive økter</p>
            <p className="text-sm text-sf-muted">
              Innlogget på {security.sessionsActive} enhet
            </p>
          </div>

          <button className="rounded-full border border-red-200 px-5 py-2 text-sm text-red-600 hover:bg-red-50">
            Logg ut alle
          </button>
        </div>

      </div>
    </section>
  );
}