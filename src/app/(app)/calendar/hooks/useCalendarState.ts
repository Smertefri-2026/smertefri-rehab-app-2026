// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/hooks/useCalendarState.ts
"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { CalendarView } from "@/types/calendar";

export function useCalendarState() {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  const handlePrev = () => {
    setCurrentDate((prev) =>
      view === "day"
        ? prev.subtract(1, "day")
        : view === "week"
        ? prev.subtract(1, "week")
        : view === "month"
        ? prev.subtract(1, "month")
        : prev.subtract(1, "year")
    );
  };

  const handleNext = () => {
    setCurrentDate((prev) =>
      view === "day"
        ? prev.add(1, "day")
        : view === "week"
        ? prev.add(1, "week")
        : view === "month"
        ? prev.add(1, "month")
        : prev.add(1, "year")
    );
  };

  const handleViewChange = (nextView: CalendarView) => {
    setView(nextView);
    // ✅ behold currentDate slik at du ikke hopper til "i dag" når du bytter view
    // (hvis du heller vil reset til i dag: sett tilbake setCurrentDate(dayjs()))
  };

  return { view, currentDate, handlePrev, handleNext, handleViewChange };
}