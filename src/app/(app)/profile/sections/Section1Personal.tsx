// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/profile/sections/Section1Personal.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DatePicker } from "@/components/ui/DatePicker";
import { useMyProfileStore } from "@/stores/profile.store";

export default function Section1Personal() {
  const { profile, loading, error: loadError, patchProfileLocal, saveProfile } = useMyProfileStore();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await saveProfile({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        phone: profile.phone ?? "",
        birth_date: profile.birth_date ?? "",
        avatar_url: profile.avatar_url ?? null,
      });
      setSaved(true);
    } catch {
      setError("Kunne ikke lagre profilen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!profile) return;

    setUploading(true);
    setError(null);
    setSaved(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Ikke innlogget");

      const filePath = `${user.id}.jpg`;

      await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // lokal patch + lagre i db
      patchProfileLocal({ avatar_url: data.publicUrl });
      await saveProfile({ avatar_url: data.publicUrl });

      setSaved(true);
    } catch {
      setError("Kunne ikke laste opp bilde.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-sf-muted">Laster profil …</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{loadError ?? "Kunne ikke laste profil."}</p>
      </section>
    );
  }

  const initials = (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "");

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-6">
      {/* 🧍 Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profilbilde"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#007C80] text-2xl font-semibold text-white">
            {initials || "?"}
          </div>
        )}

        <label className="cursor-pointer text-xs text-[#007C80] hover:underline">
          {uploading ? "Laster opp…" : "Endre bilde"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </label>
      </div>

      {/* 🧾 Personopplysninger */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Personopplysninger</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fornavn"
            value={profile.first_name ?? ""}
            onChange={(v) => patchProfileLocal({ first_name: v })}
          />

          <Input
            label="Etternavn"
            value={profile.last_name ?? ""}
            onChange={(v) => patchProfileLocal({ last_name: v })}
          />

          <Input
            label="Telefon"
            value={profile.phone ?? ""}
            onChange={(v) => patchProfileLocal({ phone: v })}
          />

          <div>
            <label className="text-xs text-sf-muted">Fødselsdato</label>
            <div className="mt-1">
              <DatePicker
                value={profile.birth_date ?? ""}
                onChange={(v) => patchProfileLocal({ birth_date: v })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATUS */}
      {(error || loadError) && <p className="text-xs text-red-500 text-center">{error ?? loadError}</p>}
      {saved && <p className="text-xs text-green-600 text-center">Lagret ✅</p>}

      {/* LAGRE */}
      <div className="text-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-sf-primary px-6 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Lagrer…" : "Lagre personopplysninger"}
        </button>
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */

function Input({
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