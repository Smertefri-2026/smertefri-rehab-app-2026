// src/app/(app)/calendar/page.tsx
"use client";

import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import { CalendarView } from "@/types/calendar";
import { useBookings } from "@/stores/bookings.store";
import { mapBookingsToEvents } from "@/lib/calendarEvents";
import { mapAvailabilityToBackgroundEvents } from "@/lib/availabilityEvents";

/* Seksjoner */
import Section1CalendarHeader from "./sections/Section1CalendarHeader";
import Section2CalendarView from "./sections/Section2CalendarView";
import Section3CalendarDialogHost from "./sections/Section3CalendarDialogHost";
import Section4ClientUpcoming from "./sections/Section4ClientUpcoming";
import Section5ClientHistory from "./sections/Section5ClientHistory";
import Section6TrainerAvailability, {
  WeeklyAvailability,
} from "./sections/Section6TrainerAvailability";
import Section7AdminSearch from "./sections/Section7AdminSearch";

/* Availability helpers */
import { loadAvailability, saveAvailability } from "@/lib/availability";
import { getMyProfile } from "@/lib/profile";
import { fetchMyClients } from "@/lib/clients.api";

export default function CalendarPage() {
  const { role, loading, userId } = useRole();

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  const [availability, setAvailability] = useState<WeeklyAvailability | null>(
    null
  );
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // ✅ navn som brukes i calendarEvents
  const [trainerName, setTrainerName] = useState<string | undefined>(undefined);

  // ✅ NB: i calendarEvents.ts heter det "clientNamesById" (med s)
  const [clientNamesById, setClientNamesById] = useState<Record<string, string>>(
    {}
  );

  const { bookings, loading: bookingsLoading } = useBookings();

  const availabilityEvents = useMemo(() => {
    return availability
      ? mapAvailabilityToBackgroundEvents(availability, currentDate)
      : [];
  }, [availability, currentDate]);

  const calendarEvents = useMemo(() => {
    return [
      ...availabilityEvents,
      ...mapBookingsToEvents(bookings, {
        role,
        trainerName: trainerName ?? undefined,
        clientNamesById, // ✅ riktig key
      }),
    ];
  }, [availabilityEvents, bookings, role, trainerName, clientNamesById]);

  // clientId = userId når rollen er client
  const clientId: string | null = role === "client" ? (userId ?? null) : null;

  /* ✅ HEADER: "Legg til time" → åpne wizard-dialog (selectedDate = null) */
  const handleAddBooking = () => {
    setSelectedDate(null);
    setSelectedBookingId(null);
    setDialogMode("create");
  };

  /* 🔹 Last inn trainerId + availability (trener: auth.uid, kunde: profile.trainer_id) */
  useEffect(() => {
    if (!role) return;

    let cancelled = false;

    (async () => {
      try {
        setAvailabilityError(null);

        const { data: authData } = await supabase.auth.getUser();
        const authedUserId = authData?.user?.id ?? null;

        let resolvedTrainerId: string | null = null;

        if (role === "trainer") {
          resolvedTrainerId = authedUserId;
          if (!cancelled) setTrainerName(undefined);
        }

        if (role === "client") {
          const profile = await getMyProfile();
          resolvedTrainerId = profile?.trainer_id ?? null;

          // ✅ trenernavn til kundevisning
          const full = `${profile?.trainer?.first_name ?? ""} ${
            profile?.trainer?.last_name ?? ""
          }`.trim();
          if (!cancelled) setTrainerName(full || undefined);
        }

        if (role === "admin") {
          if (!cancelled) {
            setTrainerId(null);
            setAvailability(null);
            setTrainerName(undefined);
          }
          return;
        }

        if (!resolvedTrainerId) {
          if (!cancelled) {
            setTrainerId(null);
            setAvailability(null);
          }
          return;
        }

        if (!cancelled) setTrainerId(resolvedTrainerId);

        const loaded = await loadAvailability(resolvedTrainerId);

        if (!cancelled) {
          setAvailability(loaded);
        }
      } catch (e: any) {
        console.error("❌ Availability load failed:", e);
        if (!cancelled) {
          setAvailability(null);
          setAvailabilityError(e?.message ?? "Kunne ikke hente tilgjengelighet");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, userId]);

  /* ✅ Trener: hent kundeliste → map id→navn */
  useEffect(() => {
    if (role !== "trainer") return;

    let cancelled = false;

    (async () => {
      try {
        const clients = await fetchMyClients();
        const map: Record<string, string> = {};

        for (const c of clients as any[]) {
          const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
          map[c.id] = name || "Kunde";
        }

        if (!cancelled) setClientNamesById(map);
      } catch (e: any) {
        console.warn(
          "Kunne ikke hente kunder for trener (navn i kalender):",
          e?.message
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

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

  /* 🔁 Endre view */
  const handleViewChange = (nextView: CalendarView) => {
    setView(nextView);
    setCurrentDate(dayjs());
  };

  if (loading) return null;

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <Section1CalendarHeader
          view={view}
          onViewChange={handleViewChange}
          onPrev={handlePrev}
          onNext={handleNext}
          role={role}
          onAddBooking={handleAddBooking}
        />

        {availabilityError && (
          <p className="text-xs text-red-600 text-center">
            Tilgjengelighet: {availabilityError} (sjekk console)
          </p>
        )}

        <div className="relative h-[calc(100vh-180px)] overflow-hidden">
          {bookingsLoading ? (
            <p className="text-sm text-sf-muted text-center">Laster bookinger …</p>
          ) : (
            <Section2CalendarView
              view={view}
              currentDate={currentDate}
              events={calendarEvents}
              onCreate={(date) => {
                setSelectedDate(date);
                setSelectedBookingId(null);
                setDialogMode("create");
              }}
              onEdit={(bookingId) => {
                setSelectedBookingId(bookingId);
                setSelectedDate(null);
                setDialogMode("edit");
              }}
            />
          )}
        </div>

        <Section3CalendarDialogHost
          mode={dialogMode}
          selectedDate={selectedDate}
          booking={
            dialogMode === "edit" && selectedBookingId
              ? bookings.find((b) => b.id === selectedBookingId) ?? null
              : null
          }
          onClose={() => {
            setDialogMode(null);
            setSelectedDate(null);
            setSelectedBookingId(null);
          }}
          role={role}
          trainerId={trainerId ?? null}
          clientId={clientId ?? null}
          availability={availability}
          allBookings={bookings}
        />

        {role === "client" && <Section4ClientUpcoming />}
        {role === "client" && <Section5ClientHistory />}

        {role === "trainer" && availability && trainerId && (
          <Section6TrainerAvailability
            initialAvailability={availability}
            onSave={async (updated) => {
              await saveAvailability(trainerId, updated);
              setAvailability(updated);
            }}
          />
        )}

        {role === "admin" && <Section7AdminSearch />}
      </div>
    </main>
  );
}