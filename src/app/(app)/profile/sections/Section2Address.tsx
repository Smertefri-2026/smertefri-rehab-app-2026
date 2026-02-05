// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/profile/sections/Section2Address.tsx
"use client";

import { useState } from "react";
import { useMyProfileStore } from "@/stores/profile.store";

export default function Section2Address() {
  const { profile, loading, error: loadError, patchProfileLocal, saveProfile } = useMyProfileStore();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await saveProfile({
        address: profile.address ?? "",
        postal_code: profile.postal_code ?? "",
        city: profile.city ?? "",
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

  if (!profile) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{loadError ?? "Kunne ikke laste adresse."}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-sf-text">Adresse</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-sf-muted">Gateadresse</label>
            <input
              type="text"
              value={profile.address ?? ""}
              onChange={(e) => patchProfileLocal({ address: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-sf-muted">Postnummer</label>
            <input
              type="text"
              value={profile.postal_code ?? ""}
              onChange={(e) => patchProfileLocal({ postal_code: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-sf-muted">Sted</label>
            <input
              type="text"
              value={profile.city ?? ""}
              onChange={(e) => patchProfileLocal({ city: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {(error || loadError) && <p className="text-xs text-red-500 text-center">{error ?? loadError}</p>}
        {saved && <p className="text-xs text-green-600 text-center">Lagret ✅</p>}

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