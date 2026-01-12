"use client";

export default function Section3TrainerActions() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 👤 Åpne trenerprofil */}
        <button
          className="
            w-full flex items-center justify-center gap-2
            rounded-full bg-[#007C80]
            px-6 py-3
            text-sm font-medium text-white
            hover:opacity-90
          "
        >
          👤 Åpne trenerprofil
        </button>

        {/* ✏️ Rediger trenerkort (admin / trener selv) */}
        <button
          className="
            w-full flex items-center justify-center gap-2
            rounded-full border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          ✏️ Rediger trenerkort
        </button>

        {/* 💬 Send melding */}
        <button
          className="
            w-full flex items-center justify-center gap-2
            rounded-full border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          💬 Send melding
        </button>

        {/* 📆 Åpne kalender */}
        <button
          className="
            w-full flex items-center justify-center gap-2
            rounded-full border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          📆 Se tilgjengelighet
        </button>

      </div>
    </section>
  );
}