"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import { getMyProfile, updateMyProfile } from "@/lib/profile";

type TrainerProfile = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  trainer_specialties?: string[] | null;
};

type Profile = {
  trainer?: TrainerProfile | null;
  trainer_id?: string | null;

  trainer_bio?: string | null;
  trainer_specialties?: string[] | null;
  trainer_public?: boolean | null;

  [key: string]: any;
};

export default function Section3Role() {
  const { role } = useRole();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (e: any) {
      console.error("getMyProfile feilet:", e);
      alert(e?.message ?? "Kunne ikke hente profil");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!role || loading || !profile) return null;

  const trainer = profile.trainer ?? null;
  const trainerName = trainer
    ? `${trainer.first_name ?? ""} ${trainer.last_name ?? ""}`.trim()
    : "";

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-sf-text">
          Rolle & tilknytning
        </h3>

        {/* ===================== KUNDE ===================== */}
        {role === "client" && (
          <div className="space-y-4">
            <p className="text-sm text-sf-muted">
              Du er registrert som kunde, og dette er din trener.
            </p>

            {(trainer || profile.trainer_id) ? (
              <div className="rounded-xl border border-sf-border bg-sf-soft p-4 space-y-3">
                {/* Trenerheader */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {trainer?.avatar_url ? (
                      <img
                        src={trainer.avatar_url}
                        alt="Trener"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {(trainer?.first_name?.[0] ?? "")}
                        {(trainer?.last_name?.[0] ?? "")}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {trainerName || "Trener valgt"}
                    </p>
                    <p className="text-xs text-sf-muted truncate">
                      {trainer?.city ?? ""}
                    </p>
                  </div>
                </div>

                {/* Spesialiteter */}
                {trainer?.trainer_specialties?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {trainer.trainer_specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white px-3 py-1 text-xs border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Handlinger – KUN KNAPPER */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Link
                    href="/trainers"
                    className="rounded-lg bg-sf-primary px-4 py-2 text-xs text-white"
                  >
                    Bytt trener
                  </Link>

                  <Link
                    href="/calendar"
                    className="rounded-lg border px-4 py-2 text-xs"
                  >
                    Book time
                  </Link>

                  {(trainer?.id || profile.trainer_id) && (
                    <Link
                      href={`/trainers/${trainer?.id ?? profile.trainer_id}`}
                      className="rounded-lg border px-4 py-2 text-xs"
                    >
                      Se trenerprofil
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={reload}
                    className="rounded-lg px-3 py-2 text-xs text-sf-muted hover:bg-sf-soft"
                  >
                    Oppdater
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-sf-soft p-4">
                <p className="text-sm">
                  Du har ikke valgt trener ennå.
                </p>
                <Link
                  href="/trainers"
                  className="inline-block mt-2 rounded-lg bg-sf-primary px-4 py-2 text-xs text-white"
                >
                  Finn trener
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ===================== TRENER ===================== */}
        {role === "trainer" && (
          <div className="space-y-4">
            <p className="text-sm text-sf-muted">
              Du er registrert som trener. Denne informasjonen vises for kunder.
            </p>

            {/* BIO */}
            <div>
              <label className="text-xs font-medium">
                Kort beskrivelse (maks 300 ord)
              </label>
              <textarea
                value={profile.trainer_bio ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, trainer_bio: e.target.value })
                }
                rows={5}
                maxLength={1500}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Beskriv deg selv, din erfaring og hvordan du jobber med kunder."
              />
            </div>

            {/* SPESIALITETER */}
            <div>
              <label className="text-xs font-medium">Spesialiteter</label>
              <div className="mt-2 flex gap-3 flex-wrap">
                {["Rehabtrening", "Kosthold"].map((s) => {
                  const selected = (profile.trainer_specialties ?? []).includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const set = new Set(profile.trainer_specialties ?? []);
                        selected ? set.delete(s) : set.add(s);
                        setProfile({
                          ...profile,
                          trainer_specialties: Array.from(set),
                        });
                      }}
                      className={`px-4 py-1 rounded-full text-xs border ${
                        selected
                          ? "bg-sf-primary text-white"
                          : "bg-white text-sf-muted"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYNLIGHET */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={(profile.trainer_public ?? true) !== false}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    trainer_public: e.target.checked,
                  })
                }
              />
              <span className="text-sm">Vis meg i trener-søk</span>
            </div>

            {/* LAGRE */}
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await updateMyProfile({
                    trainer_bio: profile.trainer_bio ?? null,
                    trainer_specialties: profile.trainer_specialties ?? [],
                    trainer_public:
                      (profile.trainer_public ?? true) !== false,
                  });
                  alert("Trenerprofil lagret");
                } catch (e: any) {
                  console.error("Lagre trenerprofil feilet:", e);
                  alert(e?.message ?? "Kunne ikke lagre trenerprofil");
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-lg bg-sf-primary px-6 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Lagrer…" : "Lagre trenerprofil"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}