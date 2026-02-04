// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/sections/Section2CalendarView.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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

  /* ✅ swipe i tid (prev/next) */
  onPrev?: () => void;
  onNext?: () => void;
};

export default function Section2CalendarView({
  view,
  currentDate,
  events = [],
  onCreate,
  onEdit,
  onPrev,
  onNext,
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

  /**
   * ✅ Defensive: FullCalendar kan mutere event-objekter.
   * Gjør start/end til ISO-strenger + ny object-referanse.
   */
  const safeEvents = useMemo(() => {
    return (events ?? []).map((e: any) => {
      const start =
        e?.start instanceof Date
          ? e.start.toISOString()
          : typeof e?.start === "string"
          ? e.start
          : e?.start;

      const end =
        e?.end instanceof Date
          ? e.end.toISOString()
          : typeof e?.end === "string"
          ? e.end
          : e?.end;

      return { ...e, start, end };
    });
  }, [events]);

  /**
   * ✅ Når vi er i 2-dagers timeGrid (mobil/uke):
   * filtrer til synlig range [currentDate, currentDate + 2 dager).
   * Dette hindrer at events fra “forrige vindu” blir med.
   */
  const visibleEvents = useMemo(() => {
    if (effectiveView !== "timeGridTwoDay") return safeEvents;

    const rangeStart = currentDate.startOf("day").toDate().getTime();
    const rangeEnd = currentDate.startOf("day").add(2, "day").toDate().getTime();

    return safeEvents.filter((e: any) => {
      const s =
        typeof e?.start === "string"
          ? new Date(e.start).getTime()
          : e?.start instanceof Date
          ? e.start.getTime()
          : NaN;

      if (!Number.isFinite(s)) return false;
      return s >= rangeStart && s < rangeEnd;
    });
  }, [safeEvents, effectiveView, currentDate]);

  /* 🔁 Bytt view i FullCalendar når app-view endres */
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(effectiveView);
  }, [effectiveView]);

  /* 🔁 Synk dato (alltid start på dagen) */
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.gotoDate(currentDate.startOf("day").toDate());
  }, [currentDate]);

  /* ➕ Klikk på tomt tidspunkt */
  const handleDateClick = (arg: DateClickArg) => {
    onCreate?.(arg.date);
  };

  /* ✏️ Klikk på eksisterende booking */
  const handleEventClick = (arg: any) => {
    const bookingId = arg?.event?.id;
    if (bookingId) onEdit?.(bookingId);
  };

  // =========================
  // ✅ SWIPE: Prev/Next
  // =========================
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

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

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const MIN_SWIPE = 55; // øk til 70-90 hvis for følsomt
    if (absX < MIN_SWIPE) return;
    if (absY > absX * 0.7) return; // må være mest horisontal

    if (dx < 0) onNext?.(); // venstre = neste
    if (dx > 0) onPrev?.(); // høyre = forrige
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
            // ✅ Tving ren re-mount ved view/dato (hindrer cache-artefakter)
            key={`${effectiveView}-${currentDate.format("YYYY-MM-DD")}`}
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              multiMonthPlugin,
            ]}
            locale={nbLocale}
            initialView={effectiveView}
            initialDate={currentDate.startOf("day").toDate()}
            headerToolbar={false}
            height="auto"
            expandRows
            stickyHeaderDates
            firstDay={1}
            nowIndicator
            allDaySlot={false}
            selectable={false}
            editable={false}
            events={visibleEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
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