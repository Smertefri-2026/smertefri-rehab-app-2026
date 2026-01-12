"use client";

export default function Section2InviteForm() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      
      {/* 📧 E-post */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-sf-text">
          E-postadresse
        </label>
        <input
          type="email"
          disabled
          placeholder="navn@epost.no"
          className="
            w-full rounded-xl border border-sf-border
            px-4 py-2 text-sm bg-sf-soft text-sf-muted
          "
        />
      </div>

      {/* 👤 Rolle */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-sf-text">
          Rolle
        </label>
        <select
          disabled
          className="
            w-full rounded-xl border border-sf-border
            px-4 py-2 text-sm bg-sf-soft text-sf-muted
          "
        >
          <option>Kunde</option>
          <option>Trener</option>
          <option>Admin</option>
        </select>
      </div>

      {/* 💬 Valgfri melding */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-sf-text">
          Valgfri melding
        </label>
        <textarea
          disabled
          rows={3}
          placeholder="Hei! Jeg inviterer deg til SmerteFri…"
          className="
            w-full rounded-xl border border-sf-border
            px-4 py-2 text-sm bg-sf-soft text-sf-muted
          "
        />
      </div>

      {/* 📩 Send-knapp */}
      <button
        disabled
        className="
          w-full rounded-full bg-[#007C80]
          px-6 py-3 text-sm font-medium text-white
          opacity-60 cursor-not-allowed
        "
      >
        Send invitasjon
      </button>
    </section>
  );
}