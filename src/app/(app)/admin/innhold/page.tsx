"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { TRAPP_STAGES } from "@/lib/trapp/stages";
import {
  getExercises,
  getTemplates,
  type Exercise,
  type ProgramTemplate,
} from "@/lib/program.api";

function stageLabel(stage: string | null) {
  if (!stage) return "Alle trinn";
  return TRAPP_STAGES[stage as keyof typeof TRAPP_STAGES]?.label ?? stage;
}

export default function AdminInnholdPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const [ex, tpl] = await Promise.all([getExercises(), getTemplates()]);
        if (!alive) return;
        setExercises(ex);
        setTemplates(tpl);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Kunne ikke hente innhold");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [role, roleLoading, router]);

  if (roleLoading || role !== "admin") {
    return (
      <AppPage title="Innhold">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Innhold"
      subtitle="Øvelsesbiblioteket og standardprogrammene rehabtrenerne tildeler fra."
    >
      {error && <p className="text-sm text-danger-ink">{error}</p>}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">Standardprogrammer</h2>
          <span className="text-xs text-ink-faint">{templates.length}</span>
        </div>

        {loading ? (
          <p className="text-sm text-ink-soft">Laster …</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-ink-soft">Ingen maler registrert.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-ink">
                    {stageLabel(t.relevant_stage)}
                  </span>
                </div>
                {t.description && (
                  <p className="mt-1 text-sm text-ink-soft">{t.description}</p>
                )}
                {t.body_area && (
                  <p className="mt-1 text-xs text-ink-faint">Område: {t.body_area}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">Øvelser</h2>
          <span className="text-xs text-ink-faint">{exercises.length}</span>
        </div>

        {loading ? (
          <p className="text-sm text-ink-soft">Laster …</p>
        ) : exercises.length === 0 ? (
          <p className="text-sm text-ink-soft">Ingen øvelser registrert.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border shadow-card">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-surface-alt text-xs font-semibold text-ink-soft">
                <tr>
                  <th className="px-4 py-2.5">Navn</th>
                  <th className="px-4 py-2.5">Trinn</th>
                  <th className="px-4 py-2.5">Område</th>
                  <th className="px-4 py-2.5">Formål</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exercises.map((e) => (
                  <tr key={e.id} className="bg-surface">
                    <td className="px-4 py-2.5 font-medium text-ink">{e.name}</td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {(e.relevant_stages ?? []).map((s) => stageLabel(s)).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {(e.body_areas ?? []).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {(e.purposes ?? []).join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppPage>
  );
}
