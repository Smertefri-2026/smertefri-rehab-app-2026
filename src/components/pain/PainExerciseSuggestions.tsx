"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/providers/RoleProvider";
import { getMyOnboarding } from "@/lib/onboarding.api";
import { getExercises, getActiveAssignment, type Exercise } from "@/lib/program.api";
import { getTrappState } from "@/lib/trapp.api";
import { activityLevelToCapacity, capacityIndex } from "@/lib/exercise/taxonomy";

/**
 * Enkle, generelle øvelsesforslag basert på hovedplagen fra kartleggingen —
 * kun for klienter uten et aktivt program ennå (har du et program, er det
 * det som gjelder, ikke generelle forslag). Tar hensyn til klientens
 * FAKTISKE Trapp-stadium (ikke hardkodet "ro") og et forsiktig avledet
 * kapasitetsnivå fra kartleggingens aktivitetsspørsmål, i tillegg til
 * smerteområdet. Ingen diagnose, ingen automatisk tildeling/erstatning av
 * trenerens program — bare et startpunkt før/mens man venter på rehabtrener.
 */
export default function PainExerciseSuggestions() {
  const { role, userId } = useRole();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [problemArea, setProblemArea] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "client" || !userId) return;
    let alive = true;

    (async () => {
      try {
        const [onboarding, assignment, trapp] = await Promise.all([
          getMyOnboarding(),
          getActiveAssignment(userId),
          getTrappState(userId),
        ]);
        if (!alive) return;

        // Har kunden allerede et program, er det programmet (og relevant
        // kartlegging trenerern har gjort der) som gjelder, ikke generelle forslag.
        if (assignment) {
          setExercises([]);
          return;
        }

        const area = onboarding?.problem_area ?? null;
        setProblemArea(area);
        if (!area) {
          setExercises([]);
          return;
        }

        // Nystartede uten et satt Trapp-trinn ennå regnes som "ro" — samme
        // trygge standardverdi som transition_trapp_stage() selv bruker.
        const stage = trapp?.current_stage ?? "ro";
        const capacity = activityLevelToCapacity(onboarding?.activity_level);
        const capIdx = capacityIndex(capacity);

        const all = await getExercises();
        if (!alive) return;

        const matches = all
          .filter((e) => e.is_active)
          .filter((e) => e.body_areas.includes(area))
          .filter((e) => e.relevant_stages.includes(stage))
          .filter((e) => e.capacity_level == null || capacityIndex(e.capacity_level) <= capIdx)
          .slice(0, 4);
        setExercises(matches);
      } catch {
        if (alive) setExercises([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, userId]);

  if (role !== "client" || loading || exercises.length === 0) return null;

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-ink-soft">Enkle øvelser som kan passe</h2>
      <p className="text-xs text-ink-faint">
        Generelle forslag basert på det du oppga om {problemArea ? "hovedplagen din" : "plagene dine"} i
        kartleggingen — ikke en diagnose eller et ferdig program. Får du en rehabtrener, avtal eventuelle
        endringer med dem.
      </p>
      <ul className="space-y-3">
        {exercises.map((e) => (
          <li key={e.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
            <p className="text-sm font-medium text-ink">{e.name}</p>
            {e.instruction && <p className="mt-0.5 text-xs text-ink-soft">{e.instruction}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
