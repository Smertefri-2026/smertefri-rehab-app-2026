"use client";

export default function Section1ChatHeader() {
  return (
    <section className="flex items-center justify-between gap-4">

      {/* 📨 Tittel */}
      <div>
        <h1 className="text-xl font-semibold text-sf-text">
          Meldinger
        </h1>
        <p className="text-sm text-sf-muted">
          Samtaler med trenere og admin
        </p>
      </div>

      {/* ➕ Ny melding */}
      <a
        href="/chat/new"
        className="
          inline-flex items-center gap-2
          rounded-full bg-[#007C80]
          px-6 py-3
          text-sm font-medium text-white
          hover:opacity-90
          transition
        "
      >
        ➕ Ny melding
      </a>

    </section>
  );
}