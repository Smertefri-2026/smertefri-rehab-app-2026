"use client";

export default function EmailSentPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-sf-border bg-white p-8 shadow-xl text-center">
      {/* LOGO */}
      <h1
        className="text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-montserrat-alternates)" }}
      >
        <span className="text-[#007C80]">Smerte</span>
        <span className="text-[#29A9D6]">Fri</span>
      </h1>

      {/* ICON */}
      <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F3F6] text-3xl">
        ✅
      </div>

      {/* TITLE */}
      <h2 className="mt-6 text-xl font-semibold text-sf-text">
        E-posten din er bekreftet
      </h2>

      {/* TEXT */}
      <p className="mt-3 text-sm text-sf-muted">
        Kontoen din er nå aktivert.
      </p>

      <p className="mt-2 text-sm text-sf-muted">
        Neste steg er å logge inn og fullføre profilen din, slik at vi kan gi deg riktig
        oppfølging og tilgang fra start.
      </p>

      {/* ACTIONS */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => {
            window.location.href = "https://app.smertefri.no/login";
          }}
          className="rounded-full bg-[#007C80] py-3 text-base font-medium text-white hover:opacity-90 transition"
          style={{ fontFamily: "var(--font-montserrat-alternates)" }}
        >
          Logg inn
        </button>

        <button
          onClick={() => {
            window.location.href = "https://smertefri.no/";
          }}
          className="rounded-full border border-[#007C80] py-3 text-base font-medium text-[#007C80] hover:bg-[#E6F3F6] transition"
          style={{ fontFamily: "var(--font-montserrat-alternates)" }}
        >
          Til forsiden
        </button>
      </div>

      {/* HELP */}
      <p className="mt-6 text-xs text-sf-muted">
        Trenger du hjelp? Kontakt support eller prøv igjen senere.
      </p>
    </div>
  );
}