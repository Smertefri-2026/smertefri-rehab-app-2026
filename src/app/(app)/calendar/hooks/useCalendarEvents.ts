// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/hooks/useCalendarEvents.ts
"use client";

import { useMemo } from "react";
import type { Dayjs } from "dayjs";
import type { CalendarView } from "@/types/calendar";
import type { Booking } from "@/types/booking";
import type { WeeklyAvailability } from "../sections/Section6TrainerAvailability";

import { mapBookingsToEvents } from "@/lib/calendarEvents";
import { mapAvailabilityToBackgroundEvents } from "@/lib/availabilityEvents";

type AdminExtras = {
  trainerName?: string | null;
  clientNamesById?: Record<string, string>;
};

type Args = {
  adminHasSelection: boolean;
  availability: WeeklyAvailability | null;
  currentDate: Dayjs;
  view: CalendarView;
  bookings: Booking[];
  eventRole: any;
  namesById: Record<string, string>;
  adminExtras?: AdminExtras;
};

export function useCalendarEvents({
  adminHasSelection,
  availability,
  currentDate,
  view,
  bookings,
  eventRole,
  namesById,
  adminExtras,
}: Args) {
  const availabilityEvents = useMemo(() => {
    if (!adminHasSelection) return [];
    return availability ? mapAvailabilityToBackgroundEvents(availability, currentDate, view) : [];
  }, [availability, currentDate, view, adminHasSelection]);

  const calendarEvents = useMemo(() => {
    if (!adminHasSelection) return [];
    return [
      ...availabilityEvents,
      ...mapBookingsToEvents(bookings, {
        role: eventRole,
        namesById,
        trainerName: adminExtras?.trainerName ?? undefined, // ✅ ikke null
        clientNamesById: adminExtras?.clientNamesById ?? {}, // ok
      }),
    ];
  }, [availabilityEvents, bookings, eventRole, namesById, adminExtras?.trainerName, adminExtras?.clientNamesById, adminHasSelection]);

  return { availabilityEvents, calendarEvents };
}