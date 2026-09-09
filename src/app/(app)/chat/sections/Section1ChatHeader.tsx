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
          Samtaler med din tildelte rehabtrener/kunder
        </p>
      </div>

    </section>
  );
}