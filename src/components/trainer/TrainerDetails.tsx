"use client";

import { useState } from "react";
import { Trainer } from "@/types/trainer";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { useTrainers } from "@/stores/trainers.store";

type Props = {
  trainer: Trainer;
  canEdit?: boolean;
};

export default function TrainerDetails({
  trainer,
  canEdit = true,
}: Props) {
  const { role } = useRole();
  const { refreshTrainers } = useTrainers();

  const [form, setForm] = useState({
    phone: trainer.phone ?? "",
    address: trainer.address ?? "",
    postal_code: trainer.postal_code ?? "",
    city: trainer.city ?? "",
    trainer_bio: trainer.trainer_bio ?? "",
    trainer_public: trainer.trainer_public ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const updateData = {
      phone: form.phone || null,
      address: form.address || null,
      postal_code: form.postal_code || null,
      city: form.city || null,
      trainer_bio: form.trainer_bio || null,
      trainer_public: form.trainer_public,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", trainer.id);

    if (error) {
      console.error(error);
      setError("Kunne ikke lagre trenerdetaljer.");
    } else {
      await refreshTrainers();
      setSaved(true);
    }

    setSaving(false);
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-sm font-semibold text-sf-muted">
        Trenerdetaljer
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* READ ONLY */}
        <ReadOnlyField label="Fornavn" value={trainer.first_name} />
        <ReadOnlyField label="Etternavn" value={trainer.last_name} />
        <ReadOnlyField label="E-post" value={trainer.email} />

        {/* EDITABLE */}
        <EditableField
          label="Telefon"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        <EditableField
          label="Adresse"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
        />

        <EditableField
          label="Postnummer"
          value={form.postal_code}
          onChange={(v) =>
            setForm({ ...form, postal_code: v })
          }
        />

        <EditableField
          label="Sted"
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
        />

        {/* 🧠 BIO */}
        <div className="sm:col-span-2">
          <label className="text-xs text-sf-muted">Bio</label>
          <textarea
            value={form.trainer_bio}
            onChange={(e) =>
              setForm({ ...form, trainer_bio: e.target.value })
            }
            rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        {/* 👁 ADMIN: SYNLIGHET */}
        {role === "admin" && (
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs text-sf-muted">Synlighet</label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.trainer_public}
                onChange={(e) =>
                  setForm({
                    ...form,
                    trainer_public: e.target.checked,
                  })
                }
              />
              Vis trener i kundesøk
            </label>
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
              {saving ? "Lagrer…" : "Lagre trenerdetaljer"}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-sf-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}