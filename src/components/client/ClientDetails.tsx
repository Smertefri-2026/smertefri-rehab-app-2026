"use client";

import { useEffect, useState } from "react";
import { Client } from "@/types/client";
import { supabase } from "@/lib/supabaseClient";
import { useClients } from "@/stores/clients.store";
import { useRole } from "@/providers/RoleProvider";
import { fetchAllTrainers } from "@/lib/clients.api";

type Trainer = {
  id: string;
  first_name: string;
  last_name: string;
};

type Props = {
  client: Client;
  canEdit?: boolean;
};

export default function ClientDetails({
  client,
  canEdit = true,
}: Props) {
  const { role } = useRole();
  const { refreshClients } = useClients();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerId, setTrainerId] = useState<string | null>(
    (client as any).trainer_id ?? null
  );

  const [form, setForm] = useState({
    phone: client.phone ?? "",
    address: client.address ?? "",
    postal_code: client.postal_code ?? "",
    city: client.city ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- ADMIN: hent trenere ---------------- */

  useEffect(() => {
    if (role === "admin") {
      fetchAllTrainers()
        .then(setTrainers)
        .catch((err) => {
          console.error("Kunne ikke hente trenere", err);
        });
    }
  }, [role]);

  /* ---------------- ADMIN: FJERN TRENER ---------------- */

  async function handleRemoveTrainer() {
    if (
      !confirm(
        "Er du sikker på at du vil fjerne treneren fra denne kunden?"
      )
    ) {
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ trainer_id: null })
      .eq("id", client.id);

    if (error) {
      console.error(error);
      setError("Kunne ikke fjerne trener.");
    } else {
      setTrainerId(null);
      await refreshClients();
      setSaved(true);
    }

    setSaving(false);
  }

  /* ---------------- SAVE ---------------- */

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const updateData: any = {
      phone: form.phone || null,
      address: form.address || null,
      postal_code: form.postal_code || null,
      city: form.city || null,
    };

    // 🔐 Kun admin kan bytte trener
    if (role === "admin") {
      updateData.trainer_id = trainerId;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", client.id);

    if (error) {
      console.error(error);
      setError("Kunne ikke lagre kundedetaljer.");
    } else {
      await refreshClients();
      setSaved(true);
    }

    setSaving(false);
  }

  /* ---------------- RENDER ---------------- */

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-sm font-semibold text-sf-muted">
        Kundedetaljer
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyField label="Fornavn" value={client.first_name} />
        <ReadOnlyField label="Etternavn" value={client.last_name} />

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
          onChange={(v) =>
            setForm({ ...form, postal_code: v })
          }
          disabled={!canEdit}
        />

        <EditableField
          label="Sted"
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
          disabled={!canEdit}
        />

        {/* 🔐 ADMIN: BYTT / FJERN TRENER */}
        {role === "admin" && (
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs text-sf-muted">Trener</label>

            <select
              value={trainerId ?? ""}
              onChange={(e) =>
                setTrainerId(e.target.value || null)
              }
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">— Ingen trener —</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>

            {trainerId && (
              <button
                type="button"
                onClick={handleRemoveTrainer}
                disabled={saving}
                className="mt-2 rounded-lg border px-4 py-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {saving ? "Fjerner trener…" : "Fjern trener"}
              </button>
            )}
          </div>
        )}
      </div>

      {canEdit && (
        <>
          {error && (
            <p className="text-xs text-red-500 text-center">
              {error}
            </p>
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