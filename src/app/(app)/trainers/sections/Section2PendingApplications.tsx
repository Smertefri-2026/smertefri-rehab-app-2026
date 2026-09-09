"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPendingTrainerApplications,
  reviewTrainerApplication,
  type TrainerApplication,
} from "@/lib/trainerApplications.api";

type Props = {
  onApplicationReviewed?: () => void;
};

function applicantName(a: TrainerApplication) {
  const n = `${a.applicant?.first_name ?? ""} ${a.applicant?.last_name ?? ""}`.trim();
  return n || a.applicant?.email || a.applicant_id.slice(0, 8);
}

export default function Section2PendingApplications({ onApplicationReviewed }: Props) {
  const [apps, setApps] = useState<TrainerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchPendingTrainerApplications()
      .then(setApps)
      .catch((e) => setError(e?.message ?? "Kunne ikke hente søknader"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(id: string, approve: boolean) {
    if (busyId) return;
    setBusyId(id);
    try {
      await reviewTrainerApplication(id, approve);
      await load();
      onApplicationReviewed?.();
    } catch (e: any) {
      alert(e?.message ?? "Kunne ikke behandle søknaden");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return null;
  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (apps.length === 0) return null;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold text-sf-muted">
        Ventende trenersøknader ({apps.length})
      </h2>

      <div className="space-y-3">
        {apps.map((a) => (
          <div key={a.id} className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{applicantName(a)}</p>
                <p className="text-xs text-sf-muted">
                  {a.years_experience != null ? `${a.years_experience} års erfaring` : "Erfaring ukjent"}
                  {a.education ? ` · ${a.education}` : ""}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleReview(a.id, true)}
                  disabled={busyId === a.id}
                  className="rounded-lg bg-sf-primary px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  {busyId === a.id ? "…" : "Godkjenn"}
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(a.id, false)}
                  disabled={busyId === a.id}
                  className="rounded-lg border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {busyId === a.id ? "…" : "Avslå"}
                </button>
              </div>
            </div>

            {a.bio && <p className="text-xs text-sf-muted whitespace-pre-wrap">{a.bio}</p>}
            {a.certifications && (
              <p className="text-xs text-sf-muted">Sertifiseringer: {a.certifications}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
