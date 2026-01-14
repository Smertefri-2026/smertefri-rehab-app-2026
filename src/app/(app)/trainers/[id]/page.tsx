"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrainerById } from "@/lib/trainers";
import { selectTrainer } from "@/lib/profile";
import { MapPin } from "lucide-react";

export default function TrainerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;

  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTrainerById(trainerId);
        setTrainer(data);
      } catch (e) {
        setError("Fant ikke treneren.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [trainerId]);

  async function handleSelectTrainer() {
    try {
      setSaving(true);
      await selectTrainer(trainerId);
      router.push("/dashboard");
    } catch {
      setError("Kunne ikke velge trener. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 text-sm text-sf-muted">
        Laster trenerprofil …
      </main>
    );
  }

  if (!trainer) {
    return (
      <main className="p-6 text-sm text-red-600">
        Trener ikke funnet.
      </main>
    );
  }

  const initials =
    (trainer.first_name?.[0] ?? "") +
    (trainer.last_name?.[0] ?? "");

  return (
    <main className="bg-[#F4FBFA] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">

        {/* PROFILTOPP */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-sf-soft flex items-center justify-center overflow-hidden text-xl font-semibold text-sf-muted">
              {trainer.avatar_url ? (
                <img
                  src={trainer.avatar_url}
                  alt="Profilbilde"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            {/* Navn + sted */}
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-sf-text">
                {trainer.first_name} {trainer.last_name}
              </h1>

              {trainer.city && (
                <p className="text-sm text-sf-muted flex items-center gap-1">
                  <MapPin size={14} />
                  {trainer.city}
                </p>
              )}
            </div>
          </div>

          {/* Spesialiteter */}
          {trainer.trainer_specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trainer.trainer_specialties.map((s: string) => (
                <span
                  key={s}
                  className="rounded-full bg-sf-soft px-3 py-1 text-xs border"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* BIO */}
        {trainer.trainer_bio && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-sf-text">
              Om treneren
            </h2>
            <p className="text-sm text-sf-text leading-relaxed whitespace-pre-line">
              {trainer.trainer_bio}
            </p>
          </section>
        )}

        {/* HANDLING */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleSelectTrainer}
            disabled={saving}
            className="w-full rounded-lg bg-sf-primary px-6 py-3 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Velger trener …" : "Velg denne treneren"}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full rounded-lg border px-6 py-3 text-sm"
          >
            Tilbake til oversikt
          </button>
        </section>

      </div>
    </main>
  );
}