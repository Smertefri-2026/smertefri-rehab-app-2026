// src/lib/availabilityEvents.ts
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { CalendarView } from "@/types/calendar";
import type {
  WeeklyAvailability,
  DayKey,
} from "@/app/(app)/calendar/sections/Section6TrainerAvailability";

dayjs.extend(isoWeek);

/**
 * Mapper ukentlig tilgjengelighet til FullCalendar background-events
 * - week/day: time-slots (ikke allDay)
 * - month/year: allDay markering på dager som har minst én slot
 */
export function mapAvailabilityToBackgroundEvents(
  availability: WeeklyAvailability,
  referenceDate: Dayjs,
  view: CalendarView
) {
  const startOfWeek = referenceDate.startOf("isoWeek"); // mandag
  const events: any[] = [];

  const showAllDay = view === "month" || view === "year";

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

    // ✅ month/year: allDay-markering (kun der)
    if (showAllDay && slots.some((s) => s.start && s.end)) {
      events.push({
        start: dayDate.startOf("day").toDate(),
        end: dayDate.endOf("day").toDate(),
        allDay: true,
        display: "background",
        backgroundColor: "#E6F4F1",
        overlap: false,
        extendedProps: { type: "availability-day" },
      });
    }

    // ✅ week/day: time-slots (dette er det som skal vises grønt i timeGrid)
    for (const slot of slots) {
      if (!slot.start || !slot.end) continue;

      const start = dayjs(`${dayDate.format("YYYY-MM-DD")} ${slot.start}`);
      const end = dayjs(`${dayDate.format("YYYY-MM-DD")} ${slot.end}`);

      events.push({
        start: start.toDate(),
        end: end.toDate(),
        allDay: false,
        display: "background",
        backgroundColor: "#E6F4F1",
        overlap: false,
        extendedProps: { type: "availability" },
      });
    }
  }

  return events;
}