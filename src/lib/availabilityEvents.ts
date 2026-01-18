import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { WeeklyAvailability, DayKey } from "@/app/(app)/calendar/sections/Section6TrainerAvailability";

dayjs.extend(isoWeek);

/**
 * Mapper ukentlig tilgjengelighet til FullCalendar background-events
 * - timeGrid/dayGrid: time-basert grønn bakgrunn (som før)
 * - month/year: allDay-grønn markering på dager som har tilgjengelighet
 */
export function mapAvailabilityToBackgroundEvents(
  availability: WeeklyAvailability,
  referenceDate: dayjs.Dayjs
) {
  const startOfWeek = referenceDate.startOf("isoWeek"); // mandag
  const events: any[] = [];

  const dayMap: Record<DayKey, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  for (const dayKey of Object.keys(availability) as DayKey[]) {
    const dayIndex = dayMap[dayKey];
    const dayDate = startOfWeek.add(dayIndex, "day");
    const slots = availability[dayKey] ?? [];

    // ✅ 1) month/year: allDay-markering hvis dagen har minst én slot
    if (slots.some((s) => s.start && s.end)) {
      const dayStart = dayDate.startOf("day");
      const dayEnd = dayDate.endOf("day");

      events.push({
        start: dayStart.toDate(),
        end: dayEnd.toDate(),
        allDay: true,
        display: "background",
        backgroundColor: "#E6F4F1",
        overlap: false,
        extendedProps: { type: "availability-day" },
      });
    }

    // ✅ 2) week/day/2day: time-slots som før
    for (const slot of slots) {
      if (!slot.start || !slot.end) continue;

      const start = dayjs(`${dayDate.format("YYYY-MM-DD")} ${slot.start}`);
      const end = dayjs(`${dayDate.format("YYYY-MM-DD")} ${slot.end}`);

      events.push({
        start: start.toDate(),
        end: end.toDate(),
        display: "background",
        backgroundColor: "#E6F4F1",
        overlap: false,
        extendedProps: {
          type: "availability",
        },
      });
    }
  }

  return events;
}