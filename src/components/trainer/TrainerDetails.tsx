"use client";

import { useState } from "react";
import { Trainer } from "@/types/trainer";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

type Props = {
  trainer: Trainer;
  canEdit?: boolean;
  /** Kalles etter vellykket lagring, slik at parent kan refetch trenerdata. */
  onSaved?: () => void;
};

export default function TrainerDetails({ trainer, canEdit = true, onSaved }: Props) {
  const { role } = useRole();

  const [form, setForm] = useState({
    phone: trainer.phone ?? "",
    address: trainer.address ?? "",
    postal_code: trainer.postal_code ?? "",
    city: trainer.city ?? "",
    bio: trainer.bio ?? "",
  });

  const [statusSaving, setStatusSaving] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          phone: form.phone || null,
          address: form.address || null,
          postal_code: form.postal_code || null,
          city: form.city || null,
        })
        .eq("id", trainer.id);

      if (profileErr) throw profileErr;

      const { error: trainerErr } = await supabase
        .from("trainer_profiles")
        .update({ bio: form.bio || null })
        .eq("trainer_id", trainer.id);

      if (trainerErr) throw trainerErr;

      onSaved?.();
      setSaved(true);
    } catch (e: any) {
      console.error(e);
      setError("Kunne ikke lagre trenerdetaljer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (statusSaving) return;
    const nextStatus = trainer.status === "active" ? "inactive" : "active";

    setStatusSaving(true);
    try {
      const { error } = await supabase.rpc("set_trainer_status", {
        p_trainer_id: trainer.id,
        p_status: nextStatus,
      });
      if (error) throw error;
      onSaved?.();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Kunne ikke endre trenerstatus");
    } finally {
      setStatusSaving(false);
    }
  }

  const readOnlyMode = !canEdit;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-sm font-semibold text-sf-muted">Trenerdetaljer</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* READ ONLY (alltid) */}
        <ReadOnlyField label="Fornavn" value={trainer.first_name} />
        <ReadOnlyField label="Etternavn" value={trainer.last_name} />
        <ReadOnlyField label="E-post" value={trainer.email} />

        {/* Telefon */}
        {readOnlyMode ? (
          <ReadOnlyField label="Telefon" value={trainer.phone ?? "—"} />
        ) : (
          <EditableField
            label="Telefon"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
        )}

        {/* Adresse */}
        {readOnlyMode ? (
          <ReadOnlyField label="Adresse" value={trainer.address ?? "—"} />
        ) : (
          <EditableField
            label="Adresse"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />
        )}

        {/* Postnummer */}
        {readOnlyMode ? (
          <ReadOnlyField label="Postnummer" value={trainer.postal_code ?? "—"} />
        ) : (
          <EditableField
            label="Postnummer"
            value={form.postal_code}
            onChange={(v) => setForm({ ...form, postal_code: v })}
          />
        )}

        {/* Sted */}
        {readOnlyMode ? (
          <ReadOnlyField label="Sted" value={trainer.city ?? "—"} />
        ) : (
          <EditableField
            label="Sted"
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
          />
        )}

        {/* BIO */}
        <div className="sm:col-span-2">
          <label className="text-xs text-sf-muted">Bio</label>

          {readOnlyMode ? (
            <p className="mt-1 rounded-lg border bg-sf-soft px-3 py-2 text-sm whitespace-pre-wrap">
              {trainer.bio ?? "—"}
            </p>
          ) : (
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          )}
        </div>

        {/* 👁 ADMIN: STATUS (aktiv/inaktiv — styrer om treneren kan tildeles nye kunder) */}
        {role === "admin" && (
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs text-sf-muted">Status</label>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  trainer.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {trainer.status === "active" ? "Aktiv" : "Inaktiv"}
              </span>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusSaving}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-sf-soft disabled:opacity-50"
              >
                {statusSaving
                  ? "Oppdaterer…"
                  : trainer.status === "active"
                  ? "Sett som inaktiv"
                  : "Sett som aktiv"}
              </button>
            </div>
            <p className="text-xs text-sf-muted">
              Inaktive trenere kan ikke motta nye kundetildelinger.
            </p>
          </div>
        )}
      </div>

      {canEdit && (
        <>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          {saved && <p className="text-xs text-green-600 text-center">Lagret ✅</p>}

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
