import type { ProgramDayExercise } from "@/lib/program.api";

function fmtDuration(sec: number): string {
  return sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec} sek`;
}

function dose(e: ProgramDayExercise): string {
  const parts: string[] = [];
  if (e.sets && e.reps) parts.push(`${e.sets} × ${e.reps}`);
  else if (e.sets && e.duration_sec) parts.push(`${e.sets} × ${fmtDuration(e.duration_sec)}`);
  else if (e.duration_sec) parts.push(fmtDuration(e.duration_sec));
  else if (e.reps) parts.push(`${e.reps} rep`);
  else if (e.sets) parts.push(`${e.sets} sett`);
  if (e.load_note) parts.push(e.load_note);
  return parts.join(" · ");
}

export default function DayExerciseList({ exercises }: { exercises: ProgramDayExercise[] }) {
  return (
    <ol className="divide-y divide-border">
      {exercises.map((e, i) => (
        <li key={e.id} className="py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-ink">
              {i + 1}. {e.exercise.name}
            </p>
            <span className="shrink-0 text-[13px] text-ink-soft">{dose(e)}</span>
          </div>
          {e.exercise.instruction && (
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{e.exercise.instruction}</p>
          )}
          {e.exercise.video_url && (
            <a
              href={e.exercise.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[13px] font-medium text-primary-ink hover:underline"
            >
              Se video
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}
