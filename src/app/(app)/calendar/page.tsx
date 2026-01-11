"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { useRole } from "@/providers/RoleProvider";

import { CalendarView } from "@/types/calendar";

/* Seksjoner */
import Section1CalendarHeader from "./sections/Section1CalendarHeader";
import Section2CalendarView from "./sections/Section2CalendarView";
import Section3CalendarDialogHost from "./sections/Section3CalendarDialogHost";
import Section4ClientUpcoming from "./sections/Section4ClientUpcoming";
import Section5ClientHistory from "./sections/Section5ClientHistory";
import Section6TrainerAvailability from "./sections/Section6TrainerAvailability";
import Section7AdminSearch from "./sections/Section7AdminSearch";

export default function CalendarPage() {
  const { role, loading } = useRole();

  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  /* ⬅️ Forrige periode */
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

  /* ➡️ Neste periode */
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

  /* ✅ Bytte view = hopp til NÅ (også fra år-visning) */
  const handleViewChange = (nextView: CalendarView) => {
    setView(nextView);
    setCurrentDate(dayjs());
  };

  if (loading) return null;

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* 1️⃣ Header */}
        <Section1CalendarHeader
          view={view}
          onViewChange={handleViewChange}
          onPrev={handlePrev}
          onNext={handleNext}
          role={role}
        />

        {/* 2️⃣ Kalender */}
        <div className="relative h-[calc(100vh-180px)] overflow-hidden">
          <Section2CalendarView
            view={view}
            currentDate={currentDate}
          />
        </div>

        {/* 3️⃣ Dialog / handlinger (alle roller – visuell) */}
        <Section3CalendarDialogHost />

        {/* 4️⃣ Kunde – kommende timer */}
        {role === "client" && <Section4ClientUpcoming />}

        {/* 5️⃣ Kunde – historikk */}
        {role === "client" && <Section5ClientHistory />}

        {/* 6️⃣ Trener – tilgjengelighet */}
        {role === "trainer" && <Section6TrainerAvailability />}

        {/* 7️⃣ Admin – søk */}
        {role === "admin" && <Section7AdminSearch />}

      </div>
    </main>
  );
}