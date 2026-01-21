// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/sections/Section2CalendarView.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/nb";
import nbLocale from "@fullcalendar/core/locales/nb";

import { useEffect, useRef, useState } from "react";
import { CalendarView } from "@/types/calendar";

dayjs.locale("nb");

type Props = {
  view: CalendarView;
  currentDate: Dayjs;
  events?: any[];

  /* 🔔 callbacks */
  onCreate?: (start: Date) => void;
  onEdit?: (bookingId: string) => void;
};

export default function Section2CalendarView({
  view,
  currentDate,
  events = [],
  onCreate,
  onEdit,
}: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  /* 📱 Mobil-detektering */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* 🎯 App-view → FullCalendar-view */
  const effectiveView =
    view === "week"
      ? isMobile
        ? "timeGridTwoDay"
        : "timeGridWeek"
      : view === "day"
      ? "timeGridDay"
      : view === "month"
      ? "dayGridMonth"
      : "multiMonthYear";

  /* 🔁 Bytt view */
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(effectiveView);
  }, [effectiveView]);

  /* 🔁 Synk dato */
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.gotoDate(currentDate.toDate());
  }, [currentDate]);

  /* ➕ Klikk på tomt tidspunkt */
  const handleDateClick = (arg: DateClickArg) => {
    onCreate?.(arg.date);
  };

  /* ✏️ Klikk på eksisterende booking */
  // NB: Typen varierer mellom FullCalendar-versjoner, så vi bruker minimal typing
  const handleEventClick = (arg: any) => {
    const bookingId = arg?.event?.id;
    if (bookingId) onEdit?.(bookingId);
  };

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
        <div className="sticky top-0 z-10 bg-white border-b border-sf-border py-2 flex justify-center">
          <h2 className="text-sm font-semibold text-center">
            {view === "day" && currentDate.format("dddd D. MMMM")}
            {view === "week" &&
              `${currentDate.startOf("week").format("D. MMM")} – ${currentDate
                .endOf("week")
                .format("D. MMM YYYY")}`}
            {view === "month" && currentDate.format("MMMM YYYY")}
            {view === "year" && currentDate.format("YYYY")}
          </h2>
        </div>

        <div className="relative h-[calc(100vh-190px)] overflow-y-auto">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              multiMonthPlugin,
            ]}
            locale={nbLocale}
            initialView={effectiveView}
            initialDate={currentDate.toDate()}
            headerToolbar={false}
            height="auto"
            expandRows
            stickyHeaderDates
            firstDay={1}
            nowIndicator
            allDaySlot={false}
            selectable={false}
            editable={false}
            events={events}
            /* ✅ KLIKK */
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            /* ✅ UKENUMMER */
            weekNumbers={true}
            weekNumberCalculation="ISO"
            weekText=""
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            views={{
              timeGridDay: {
                slotMinTime: "06:00:00",
                slotMaxTime: "22:00:00",
                slotDuration: "00:30:00",
                slotLabelFormat: {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
                dayHeaderFormat: { weekday: "short", day: "numeric" },
              },
              timeGridWeek: {
                slotMinTime: "06:00:00",
                slotMaxTime: "22:00:00",
                slotDuration: "00:30:00",
                slotLabelFormat: {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
                dayHeaderFormat: { weekday: "short", day: "numeric" },
              },
              timeGridTwoDay: {
                type: "timeGrid",
                duration: { days: 2 },
                slotMinTime: "06:00:00",
                slotMaxTime: "22:00:00",
                slotDuration: "00:30:00",
                slotLabelFormat: {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
                dayHeaderFormat: { weekday: "short", day: "numeric" },
              },
              dayGridMonth: { fixedWeekCount: false },
              multiMonthYear: {
                type: "multiMonth",
                duration: { months: 12 },
                multiMonthMaxColumns: isMobile ? 1 : 4,
              },
            }}
            eventColor="#007C80"
            eventTextColor="#ffffff"
            dayMaxEvents
          />
        </div>
      </div>
    </section>
  );
}