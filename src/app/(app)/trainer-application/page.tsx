"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import {
  getMyTrainerApplication,
  submitTrainerApplication,
  type TrainerApplication,
} from "@/lib/trainerApplications.api";

const STATUS_LABEL: Record<TrainerApplication["status"], string> = {
  pending: "Til vurdering",
  approved: "Godkjent",
  rejected: "Avslått",
};

export default function TrainerApplicationPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  const [application, setApplication] = useState<TrainerApplication | null | undefined>(undefined);
  const [form, setForm] = useState({
    education: "",
    certifications: "",
    bio: "",
    years_experience: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading) return;

    if (role !== "client") {
      router.replace("/dashboard");
      return;
    }

    getMyTrainerApplication()
      .then(setApplication)
      .catch((e) => setError(e?.message ?? "Kunne ikke hente søknadsstatus"));
  }, [roleLoading, role, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await submitTrainerApplication({
        education: form.education || undefined,
        certifications: form.certifications || undefined,
        bio: form.bio || undefined,
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
      });
      const mine = await getMyTrainerApplication();
      setApplication(mine);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende søknaden");
    } finally {
      setSubmitting(false);
    }
  }

  if (roleLoading || role !== "client" || application === undefined) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster …</p>
      </AppPage>
    );
  }

  if (application) {
    return (
      <AppPage>
        <div className="rounded-2xl border border-sf-border bg-white p-6 space-y-3">
          <h1 className="text-lg font-semibold">Din søknad som rehabtrener</h1>
          <p className="text-sm">
            Status:{" "}
            <span className="font-medium">{STATUS_LABEL[application.status]}</span>
          </p>
          {application.status === "pending" && (
            <p className="text-sm text-sf-muted">
              Vi vurderer søknaden din og gir beskjed så snart den er behandlet.
            </p>
          )}
          {application.status === "rejected" && application.review_notes && (
            <p className="text-sm text-sf-muted">Kommentar: {application.review_notes}</p>
          )}
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Søk om å bli rehabtrener</h1>
          <p className="text-sm text-sf-muted">
            SmerteFri godkjenner alle rehabtrenere manuelt før de kan få tildelt kunder.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Utdanning">
            <input
              value={form.education}
              onChange={(e) => setForm({ ...form, education: e.target.value })}
              placeholder="F.eks. Fysioterapeut, PT-utdanning …"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Sertifiseringer">
            <input
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Års erfaring">
            <input
              type="number"
              min={0}
              value={form.years_experience}
              onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Kort om deg selv">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-sf-primary px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Sender…" : "Send søknad"}
          </button>
        </form>
      </div>
    </AppPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-sf-muted">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
