// src/lib/availabilityEvents.ts
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { CalendarView } from "@/types/calendar";
import type {
  WeeklyAvailability,
  DayKey,
} from "@/app/(app)/calendar/sections/Section6TrainerAvailability";

dayjs.extend(isoWeek);

export function mapAvailabilityToBackgroundEvents(
  availability: WeeklyAvailability,
  referenceDate: Dayjs,
  view: CalendarView
) {
  const events: any[] = [];
  const showAllDay = view === "month" || view === "year";
  const today = dayjs().startOf("day");

  const dayMap: Record<DayKey, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };

  // ✅ Velg periode å generere for
  const rangeStart =
    view === "year"
      ? referenceDate.startOf("year").startOf("day")
      : view === "month"
      ? referenceDate.startOf("month").startOf("day")
      : referenceDate.startOf("isoWeek").startOf("day");

  const rangeEnd =
    view === "year"
      ? referenceDate.endOf("year").endOf("day")
      : view === "month"
      ? referenceDate.endOf("month").endOf("day")
      : referenceDate.endOf("isoWeek").endOf("day");

  // ✅ Iterer alle dager i perioden (month/year trenger dette)
  let d = rangeStart.clone();
  while (d.isBefore(rangeEnd)) {
    const iso = d.isoWeekday(); // 1=man ... 7=søn
    const dayKey = (Object.keys(dayMap) as DayKey[]).find(
      (k) => dayMap[k] === iso
    );

    if (!dayKey) {
      d = d.add(1, "day");
      continue;
    }

    const slots = availability[dayKey] ?? [];
    const hasSlots = slots.some((s) => s.start && s.end);

    // ✅ Month/Year: marker hele dagen (men kun fra i dag og fremover)
    if (showAllDay && hasSlots && !d.isBefore(today)) {
      events.push({
        start: d.startOf("day").toDate(),
        end: d.endOf("day").toDate(),
        allDay: true,
        display: "background",
        backgroundColor: "#E6F4F1",
        overlap: false,
        extendedProps: { type: "availability-day" },
      });
    }

    // ✅ Week/Day: legg inn timeslots (kun i week/day)
    if (!showAllDay) {
      for (const slot of slots) {
        if (!slot.start || !slot.end) continue;

        const start = dayjs(`${d.format("YYYY-MM-DD")} ${slot.start}`);
        const end = dayjs(`${d.format("YYYY-MM-DD")} ${slot.end}`);

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

    d = d.add(1, "day");
  }

  return events;
}