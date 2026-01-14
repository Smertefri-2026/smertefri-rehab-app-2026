"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/profile";

type AddressProfile = {
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

export default function Section2Address() {
  const [profile, setProfile] = useState<AddressProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProfile();
        setProfile({
          address: data.address ?? "",
          postal_code: data.postal_code ?? "",
          city: data.city ?? "",
        });
      } catch {
        setError("Kunne ikke laste adresse.");
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
        address: profile.address,
        postal_code: profile.postal_code,
        city: profile.city,
      });

      setSaved(true);
    } catch {
      setError("Kunne ikke lagre adresse.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-sf-muted">Laster adresse …</p>
      </section>
    );
  }

  if (!profile) return null;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">

        {/* 🏠 Header */}
        <h3 className="text-sm font-semibold text-sf-text">
          Adresse
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Gateadresse */}
          <div className="sm:col-span-2">
            <label className="text-xs text-sf-muted">
              Gateadresse
            </label>
            <input
              type="text"
              value={profile.address ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {/* Postnummer */}
          <div>
            <label className="text-xs text-sf-muted">
              Postnummer
            </label>
            <input
              type="text"
              value={profile.postal_code ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, postal_code: e.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {/* Sted */}
          <div>
            <label className="text-xs text-sf-muted">
              Sted
            </label>
            <input
              type="text"
              value={profile.city ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, city: e.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
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
        <div className="text-center pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-sf-primary px-6 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Lagrer…" : "Lagre adresse"}
          </button>
        </div>
      </div>
    </section>
  );
}