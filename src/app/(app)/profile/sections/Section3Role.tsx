"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useRole } from "@/providers/RoleProvider";
import { getMyProfile, updateMyTrainerProfile, type MyProfile } from "@/lib/profile";

export default function Section3Role() {
  const { role } = useRole();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Trener: lokal skjematilstand for bio/spesialiteter
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setBio(data.trainer?.bio ?? "");
      setSpecialties(data.trainer?.specialties ?? []);
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
  const trainerName = trainer ? `${trainer.first_name ?? ""} ${trainer.last_name ?? ""}`.trim() : "";

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-sf-text">Rolle & tilknytning</h3>

        {/* ===================== KUNDE ===================== */}
        {role === "client" && (
          <div className="space-y-4">
            <p className="text-sm text-sf-muted">
              Du er registrert som kunde. SmerteFri tildeler deg en rehabtrener.
            </p>

            {trainer ? (
              <div className="rounded-xl border border-sf-border bg-sf-soft p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {trainer.avatar_url ? (
                      <img
                        src={trainer.avatar_url}
                        alt="Trener"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {(trainer.first_name?.[0] ?? "")}
                        {(trainer.last_name?.[0] ?? "")}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{trainerName || "Din trener"}</p>
                    <p className="text-xs text-sf-muted truncate">{trainer.city ?? ""}</p>
                  </div>
                </div>

                <Link
                  href="/trainer"
                  className="inline-block rounded-lg bg-sf-primary px-4 py-2 text-xs text-white"
                >
                  Se din rehabtrener
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border bg-sf-soft p-4 space-y-2">
                <p className="text-sm">Du har ikke fått tildelt en rehabtrener ennå.</p>
                <p className="text-xs text-sf-muted">
                  Ønsker du selv å bli rehabtrener?{" "}
                  <Link href="/trainer-application" className="text-sf-primary underline">
                    Søk her
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TRENER ===================== */}
        {role === "trainer" && (
          <div className="space-y-4">
            <p className="text-sm text-sf-muted">
              Du er registrert som trener. Denne informasjonen vises for kundene dine.
            </p>

            {/* BIO */}
            <div>
              <label className="text-xs font-medium">Kort beskrivelse (maks 300 ord)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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
                  const selected = specialties.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const set = new Set(specialties);
                        selected ? set.delete(s) : set.add(s);
                        setSpecialties(Array.from(set));
                      }}
                      className={`px-4 py-1 rounded-full text-xs border ${
                        selected ? "bg-sf-primary text-white" : "bg-white text-sf-muted"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LAGRE */}
            <button
              disabled={saving}
              onClick={async () => {
                if (saving) return;
                setSaving(true);
                setSaved(false);
                try {
                  await updateMyTrainerProfile({ bio: bio || null, specialties });
                  setSaved(true);
                } catch (e: any) {
                  console.error("Lagre trenerprofil feilet:", e);
                  alert(e?.message ?? "Kunne ikke lagre trenerprofil");
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-lg bg-sf-primary px-6 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Lagrer…" : saved ? "Lagret ✅" : "Lagre trenerprofil"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
