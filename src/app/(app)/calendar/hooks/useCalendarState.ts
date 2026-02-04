// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/hooks/useCalendarState.ts
"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { CalendarView } from "@/types/calendar";

export function useCalendarState() {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  // ✅ Når "week" på mobil egentlig er 2-dagers view (timeGridTwoDay)
  const [isMobileWeek, setIsMobileWeek] = useState(false);

  const handlePrev = () => {
    setCurrentDate((prev) => {
      if (view === "day") return prev.subtract(1, "day");
      if (view === "week") return prev.subtract(1, isMobileWeek ? "day" : "week");
      if (view === "month") return prev.subtract(1, "month");
      return prev.subtract(1, "year");
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      if (view === "day") return prev.add(1, "day");
      if (view === "week") return prev.add(1, isMobileWeek ? "day" : "week");
      if (view === "month") return prev.add(1, "month");
      return prev.add(1, "year");
    });
  };

  const handleViewChange = (nextView: CalendarView) => {
    setView(nextView);
    // ✅ behold currentDate (ikke hopp til i dag)
  };

  return {
    view,
    currentDate,
    handlePrev,
    handleNext,
    handleViewChange,
    setIsMobileWeek, // ✅ UI kan fortelle om "week" er 2-dagers mode
  };
}