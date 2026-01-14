"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getMyProfile, updateMyProfile } from "@/lib/profile";

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  avatar_url?: string | null;
};

export default function Section1Personal() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProfile();
        setProfile({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          birth_date: data.birth_date ?? "",
          avatar_url: data.avatar_url ?? null,
        });
      } catch {
        setError("Kunne ikke laste profil.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateMyProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        birth_date: profile.birth_date,
        avatar_url: profile.avatar_url,
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Ikke innlogget");

      const filePath = `${user.id}.jpg`;

      await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.publicUrl } : prev
      );
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

  if (!profile) return null;

  const initials =
    (profile.first_name?.[0] ?? "") +
    (profile.last_name?.[0] ?? "");

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-6">

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

          <div>
            <h2 className="text-lg font-semibold">
              {profile.first_name} {profile.last_name}
            </h2>
          </div>
        </div>

        {/* 🧾 Personopplysninger */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">
            Personopplysninger
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-sf-muted">Fornavn</label>
              <input
                value={profile.first_name}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-sf-muted">Etternavn</label>
              <input
                value={profile.last_name}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-sf-muted">Telefon</label>
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-sf-muted">Fødselsdato</label>
              <input
                type="date"
                value={profile.birth_date}
                onChange={(e) =>
                  setProfile({ ...profile, birth_date: e.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* STATUS */}
        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}
        {saved && (
          <p className="text-xs text-green-600 text-center">
            Lagret ✅
          </p>
        )}

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

      </div>
    </section>
  );
}