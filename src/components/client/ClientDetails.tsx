"use client";

import { useState } from "react";
import { Client } from "@/types/client";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  client: Client;
  canEdit?: boolean; // trainer/admin
};

export default function ClientDetails({
  client,
  canEdit = true,
}: Props) {
  // 🔗 Samme data som kunden redigerer i sin profil (profiles-tabellen)
  const [form, setForm] = useState({
    phone: client.phone ?? "",
    address: client.address ?? "",
    postal_code: client.postal_code ?? "",
    city: client.city ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        phone: form.phone || null,
        address: form.address || null,
        postal_code: form.postal_code || null,
        city: form.city || null,
      })
      .eq("id", client.id);

    if (error) {
      console.error(error);
      setError("Kunne ikke lagre kundedetaljer.");
    } else {
      setSaved(true);
    }

    setSaving(false);
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-sm font-semibold text-sf-muted">
        Kundedetaljer
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* READ-ONLY */}
        <ReadOnlyField label="Fornavn" value={client.first_name} />
        <ReadOnlyField label="Etternavn" value={client.last_name} />

        {/* EDITABLE – samme felt som på profil */}
        <EditableField
          label="Telefon"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          disabled={!canEdit}
        />

        <EditableField
          label="Adresse"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
          disabled={!canEdit}
        />

        <EditableField
          label="Postnummer"
          value={form.postal_code}
          onChange={(v) => setForm({ ...form, postal_code: v })}
          disabled={!canEdit}
        />

        <EditableField
          label="Sted"
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
          disabled={!canEdit}
        />
      </div>

      {canEdit && (
        <>
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
          {saved && (
            <p className="text-xs text-green-600 text-center">
              Lagret ✅
            </p>
          )}

          <div className="text-center pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-sf-primary px-6 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Lagrer…" : "Lagre kundedetaljer"}
            </button>
          </div>
        </>
      )}

      {!canEdit && (
        <p className="text-xs text-sf-muted">
          Kundedetaljer er skrivebeskyttet.
        </p>
      )}
    </section>
  );
}

/* ---------- helpers ---------- */

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs text-sf-muted">{label}</p>
      <p className="mt-1 rounded-lg border bg-sf-soft px-3 py-2 text-sm">
        {value || "—"}
      </p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-sf-muted">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm disabled:bg-sf-soft"
      />
    </div>
  );
}