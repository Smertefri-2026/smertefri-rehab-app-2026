// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/sections/Section2CalendarView.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/nb";
import nbLocale from "@fullcalendar/core/locales/nb";

import { CalendarView } from "@/types/calendar";

dayjs.locale("nb");

type Props = {
  view: CalendarView;
  currentDate: Dayjs;
  events?: any[];

  /* 🔔 callbacks */
  onCreate?: (start: Date) => void;
  onEdit?: (bookingId: string) => void;

  /* ✅ swipe / ekstern view-endring */
  onViewChange?: (next: CalendarView) => void;
};

export default function Section2CalendarView({
  view,
  currentDate,
  events = [],
  onCreate,
  onEdit,
  onViewChange,
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

  // =========================
  // ✅ SWIPE: Day ↔ Week ↔ Month
  // =========================
  const viewOrder: CalendarView[] = ["day", "week", "month"]; // evt legg til "year" hvis du vil
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  function clampIndex(i: number) {
    if (i < 0) return 0;
    if (i >= viewOrder.length) return viewOrder.length - 1;
    return i;
  }

  function cycleView(direction: "next" | "prev") {
    if (!onViewChange) return;

    const idx = viewOrder.indexOf(view);
    const safeIdx = idx === -1 ? 1 : idx; // fallback -> "week"
    const nextIdx = direction === "next" ? safeIdx + 1 : safeIdx - 1;

    onViewChange(viewOrder[clampIndex(nextIdx)]);
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const sx = startX.current;
    const sy = startY.current;

    startX.current = null;
    startY.current = null;

    if (sx == null || sy == null) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;

    // ✅ Ikke trigge ved vanlig scrolling
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const MIN_SWIPE = 55; // juster ved behov (70-90 hvis for følsomt)
    if (absX < MIN_SWIPE) return;
    if (absY > absX * 0.7) return; // må være mest horisontal swipe

    // Swipe venstre = neste view (day->week->month)
    if (dx < 0) cycleView("next");

    // Swipe høyre = forrige view
    if (dx > 0) cycleView("prev");
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

        <div
          className="relative h-[calc(100vh-190px)] overflow-y-auto"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
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