// /Users/oystein/smertefri-rehab-app-2026/src/components/client/ClientDetails.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Client } from "@/types/client";
import { supabase } from "@/lib/supabaseClient";
import { useClients, notifyClientsChanged } from "@/stores/clients.store";
import { useRole } from "@/providers/RoleProvider";
import { fetchAllTrainers } from "@/lib/clients.api";

type Trainer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type Props = {
  client: Client;
  canEdit?: boolean;
};

function calcAge(birthDateISO: string | null | undefined): number | null {
  if (!birthDateISO) return null;
  const d = new Date(birthDateISO);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();

  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  if (age < 0 || age > 130) return null;
  return age;
}

function formatBirthDate(birthDateISO: string | null | undefined) {
  if (!birthDateISO) return "—";
  const d = new Date(birthDateISO);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("no-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ClientDetails({ client, canEdit = true }: Props) {
  const { role } = useRole();
  const { refreshClients } = useClients();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerId, setTrainerId] = useState<string | null>((client as any).trainer_id ?? null);

  const [form, setForm] = useState({
    phone: (client as any).phone ?? "",
    address: (client as any).address ?? "",
    postal_code: (client as any).postal_code ?? "",
    city: (client as any).city ?? "",
  });

  // ✅ Email: vis fra client hvis den finnes, ellers fetch fra profiles
  const [email, setEmail] = useState<string | null>((client as any).email ?? null);

  // ✅ Birth date: vis fra client hvis den finnes, ellers fetch fra profiles
  const [birthDate, setBirthDate] = useState<string | null>((client as any).birth_date ?? null);

  const age = useMemo(() => calcAge(birthDate), [birthDate]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- ADMIN: hent trenere ---------------- */

  useEffect(() => {
    if (role === "admin") {
      fetchAllTrainers()
        .then(setTrainers)
        .catch((err) => console.error("Kunne ikke hente trenere", err));
    }
  }, [role]);

  /* ---------------- FETCH EMAIL + BIRTHDATE (fallback) ---------------- */

  useEffect(() => {
    let alive = true;

    const run = async () => {
      const existingEmail = (client as any).email;
      const existingBirth = (client as any).birth_date;

      if (existingEmail) setEmail(existingEmail);
      if (existingBirth) setBirthDate(existingBirth);

      // Hvis vi allerede har begge, trenger vi ikke hente
      if (existingEmail && existingBirth) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("email, birth_date")
          .eq("id", client.id)
          .single();

        if (error) throw error;

        if (!alive) return;
        const row: any = data ?? {};
        if (!existingEmail) setEmail(row.email ?? null);
        if (!existingBirth) setBirthDate(row.birth_date ?? null);
      } catch {
        if (!alive) return;
        if (!existingEmail) setEmail(null);
        if (!existingBirth) setBirthDate(null);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [client.id, (client as any).email, (client as any).birth_date]);

  /* ---------------- ADMIN: FJERN TRENER ---------------- */

  async function handleRemoveTrainer() {
    if (!confirm("Er du sikker på at du vil avslutte tildelingen for denne kunden?")) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase.rpc("end_assignment", { p_client_id: client.id });

    if (error) {
      console.error(error);
      setError("Kunne ikke avslutte tildelingen.");
    } else {
      setTrainerId(null);
      await refreshClients();
      notifyClientsChanged();
      setSaved(true);
    }

    setSaving(false);
  }

  /* ---------------- SAVE ---------------- */

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
      setSaving(false);
      return;
    }

    // 🔐 Kun admin kan tildele/bytte trener, og kun via assign_trainer()
    // (SECURITY DEFINER) — aldri en direkte skriving mot client_trainer_assignments.
    const existingTrainerId = (client as any).trainer_id ?? null;
    if (role === "admin" && trainerId && trainerId !== existingTrainerId) {
      const { error: assignErr } = await supabase.rpc("assign_trainer", {
        p_client_id: client.id,
        p_trainer_id: trainerId,
      });

      if (assignErr) {
        console.error(assignErr);
        setError("Kunne ikke tildele trener.");
        setSaving(false);
        return;
      }
    }

    await refreshClients();
    notifyClientsChanged();
    setSaved(true);
    setSaving(false);
  }

  /* ---------------- RENDER ---------------- */

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-sm font-semibold text-sf-muted">Kundedetaljer</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyField label="Fornavn" value={(client as any).first_name} />
        <ReadOnlyField label="Etternavn" value={(client as any).last_name} />

        {/* ✅ Fødselsdato */}
        <ReadOnlyField label="Fødselsdato" value={birthDate ? formatBirthDate(birthDate) : "—"} />

        {/* ✅ Alder */}
        <ReadOnlyField label="Alder" value={age == null ? "—" : `${age} år`} />

 {/* ✅ E-post */}
        <ReadOnlyField label="E-post" value={email} />

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

        {/* 🔐 ADMIN: BYTT / FJERN TRENER */}
        {role === "admin" && (
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs text-sf-muted">Trener</label>

            <select
              value={trainerId ?? ""}
              onChange={(e) => setTrainerId(e.target.value || null)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">— Ingen trener —</option>
              {trainers.map((t) => {
                const name = `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
                return (
                  <option key={t.id} value={t.id}>
                    {name || t.email || "Trener uten navn"}
                  </option>
                );
              })}
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
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          {saved && <p className="text-xs text-green-600 text-center">Lagret ✅</p>}

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

function ReadOnlyField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-sf-muted">{label}</p>
      <p className="mt-1 rounded-lg border bg-sf-soft px-3 py-2 text-sm">{value || "—"}</p>
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