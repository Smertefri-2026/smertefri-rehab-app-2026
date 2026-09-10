/**
 * Normalnivå («baseline») = rullerende snitt av smerte de siste 14 dagene.
 * Ren funksjon. Returnerer null hvis det er for lite historikk til at et
 * snitt er meningsfullt — da faller Sonen tilbake på absolutte terskler.
 */
export function rollingBaseline(
  painHistory: { date: string; intensity: number }[],
  opts: { windowDays?: number; minReadings?: number; today?: string } = {}
): number | null {
  const windowDays = opts.windowDays ?? 14;
  const minReadings = opts.minReadings ?? 3;
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const cutoff = new Date(`${today}T00:00:00Z`).getTime() - windowDays * 86_400_000;

  const inWindow = painHistory
    .filter((p) => Number.isFinite(p.intensity))
    .filter((p) => new Date(`${p.date}T00:00:00Z`).getTime() >= cutoff);

  if (inWindow.length < minReadings) return null;

  const sum = inWindow.reduce((acc, p) => acc + p.intensity, 0);
  return Math.round((sum / inWindow.length) * 10) / 10;
}
