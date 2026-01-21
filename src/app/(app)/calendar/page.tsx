 // src/app/(app)/calendar/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { useBookings } from "@/stores/bookings.store";

import Section1CalendarHeader from "./sections/Section1CalendarHeader";
import Section2CalendarView from "./sections/Section2CalendarView";
import Section3CalendarDialogHost from "./sections/Section3CalendarDialogHost";
import Section4ClientUpcoming from "./sections/Section4ClientUpcoming";
import Section5ClientHistory from "./sections/Section5ClientHistory";
import Section6TrainerAvailability from "./sections/Section6TrainerAvailability";
import Section7AdminSearch from "./sections/Section7AdminSearch";

import { useCalendarState } from "./hooks/useCalendarState";
import { useCalendarAvailability } from "./hooks/useCalendarAvailability";
import { useAdminContext } from "./hooks/useAdminContext";

import { useClientTrainerId } from "./hooks/useClientTrainerId";
import { useNamesByIds } from "./hooks/useNamesByIds";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useRealtimeBookings } from "./hooks/useRealtimeBookings";

// DB helpers
import { loadAvailability, saveAvailability } from "@/lib/availability";

export default function CalendarPage() {
  const { role, loading, userId } = useRole();
  const searchParams = useSearchParams();

  const { view, currentDate, handlePrev, handleNext, handleViewChange } =
    useCalendarState();

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  // bookings store
  const { bookings, loading: bookingsLoading, refreshBookings } = useBookings();

  // admin context
  const admin = useAdminContext(role);

  // ✅ Admin: vi viser IKKE kalender før det er valgt trener/kunde
  const adminHasSelection = role !== "admin" ? true : Boolean(admin.selected);

  // client trainer id (for availability)
  const clientTrainerId = useClientTrainerId(role, userId);

  // ✅ deep link admin (?trainer= / ?client=)
  useEffect(() => {
    if (role !== "admin") return;

    const trainerFromUrl = searchParams.get("trainer");
    const clientFromUrl = searchParams.get("client");

    if (trainerFromUrl && trainerFromUrl !== admin.contextTrainerId) {
      admin.pickTrainer(trainerFromUrl);
    }
    if (clientFromUrl && clientFromUrl !== admin.contextClientId) {
      admin.pickClient(clientFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, searchParams]);

  // resolved trainerId (for availability)
  const resolvedTrainerId = useMemo(() => {
    if (role === "admin") return admin.contextTrainerId ?? null;
    if (role === "trainer") return userId ?? null;
    if (role === "client") return clientTrainerId ?? null;
    return null;
  }, [role, admin.contextTrainerId, userId, clientTrainerId]);

  const trainerIdToUse = adminHasSelection ? resolvedTrainerId : null;

  // ✅ availability (inkl realtime i hook)
  const { availability, setAvailability, availabilityError } =
    useCalendarAvailability(trainerIdToUse);

  // admin perspective
  const eventRole = useMemo(() => {
    if (role !== "admin") return role;
    return admin.perspective;
  }, [role, admin.perspective]);

  // name cache
  const namesById = useNamesByIds({
    bookings: bookings ?? [],
    extraIds: [admin.contextTrainerId, admin.contextClientId],
  });

  // calendar events
  const { calendarEvents } = useCalendarEvents({
    adminHasSelection,
    availability,
    currentDate,
    view,
    bookings: bookings ?? [],
    eventRole: eventRole as any,
    namesById,
    adminExtras: {
      trainerName: admin.trainerName,
      clientNamesById: admin.clientNamesById,
    },
  });

  // ✅ realtime for bookings (auto refresh)
  useRealtimeBookings({
    role: role as any,
    userId,
    adminHasSelection,
    adminTrainerId: admin.contextTrainerId,
    adminClientId: admin.contextClientId,
    refreshBookings: async () => {
      try {
        await refreshBookings?.();
      } catch (e) {
        console.warn("refreshBookings failed:", e);
      }
    },
  });

  // Når admin fjerner valg: lukk dialog + nullstill selection-state lokalt
  useEffect(() => {
    if (role !== "admin") return;
    if (adminHasSelection) return;

    setDialogMode(null);
    setSelectedDate(null);
    setSelectedBookingId(null);
  }, [role, adminHasSelection]);

  // labels til Section7AdminSearch
  const activeTrainerLabel = useMemo(() => {
    if (!admin.contextTrainerId) return null;
    return (
      namesById[admin.contextTrainerId] ||
      admin.trainerName ||
      admin.contextTrainerId
    );
  }, [admin.contextTrainerId, namesById, admin.trainerName]);

  const activeClientLabel = useMemo(() => {
    if (!admin.contextClientId) return null;
    return namesById[admin.contextClientId] || admin.contextClientId;
  }, [admin.contextClientId, namesById]);

  if (loading) return null;

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* ✅ ADMIN: søk */}
        {role === "admin" && (
          <section className="w-full">
            <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-sf-muted">
                  {adminHasSelection
                    ? `Valgt: ${admin.headerLabel}`
                    : "Admin: Velg en trener eller kunde (søk under)."}
                </div>

                {admin.selected && (
                  <button
                    onClick={() => admin.clear()}
                    className="rounded-full border border-sf-border px-4 py-2 text-sm hover:bg-sf-soft"
                  >
                    Fjern valg
                  </button>
                )}
              </div>

              <Section7AdminSearch
                onPickTrainer={admin.pickTrainer}
                onPickClient={admin.pickClient}
                activeTrainerId={admin.contextTrainerId}
                activeClientId={admin.contextClientId}
                activeTrainerLabel={activeTrainerLabel}
                activeClientLabel={activeClientLabel}
              />
            </div>
          </section>
        )}

        {/* Header */}
        <Section1CalendarHeader
          view={view}
          onViewChange={handleViewChange}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {availabilityError && adminHasSelection && (
          <p className="text-xs text-red-600 text-center">{availabilityError}</p>
        )}

        {/* ✅ ADMIN uten valg */}
        {role === "admin" && !adminHasSelection ? (
          <div className="rounded-2xl border border-sf-border bg-white p-6 text-center text-sm text-sf-muted">
            Velg en trener eller kunde i søket over for å vise kalenderen.
          </div>
        ) : (
          <>
            {/* context-label */}
            {role === "admin" && adminHasSelection && (
              <div className="rounded-2xl border border-sf-border bg-white px-4 py-3 shadow-sm">
                <div className="text-sm">
                  <span className="text-sf-muted">Viser:</span>{" "}
                  <span className="font-semibold">{admin.headerLabel}</span>
                </div>
              </div>
            )}

            <div className="relative h-[calc(100vh-180px)] overflow-hidden">
              {bookingsLoading ? (
                <p className="text-sm text-sf-muted text-center">
                  Laster bookinger …
                </p>
              ) : (
                <Section2CalendarView
                  view={view}
                  currentDate={currentDate}
                  events={calendarEvents}
                  onCreate={(date) => {
                    if (role === "admin" && !adminHasSelection) return;
                    setSelectedDate(date);
                    setSelectedBookingId(null);
                    setDialogMode("create");
                  }}
                  onEdit={(bookingId) => {
                    if (role === "admin" && !adminHasSelection) return;
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
              role={role as any}
              trainerId={
                role === "admin"
                  ? admin.contextTrainerId ?? null
                  : role === "trainer"
                  ? userId ?? null
                  : role === "client"
                  ? clientTrainerId ?? null
                  : null
              }
              clientId={
                role === "admin"
                  ? admin.contextClientId ?? null
                  : role === "client"
                  ? userId ?? null
                  : null
              }
              availability={availability}
              allBookings={bookings}
            />

            {/* ✅ CLIENT: upcoming (med edit/avlys) + historikk (kun visning) */}
            {role === "client" && (
              <Section4ClientUpcoming
                onEditBooking={(bookingId: string) => {
                  setSelectedBookingId(bookingId);
                  setSelectedDate(null);
                  setDialogMode("edit");
                }}
              />
            )}

            {role === "client" && <Section5ClientHistory />}

            {/* ✅ TRAINER: availability editor */}
            {role === "trainer" && (
              <Section6TrainerAvailability
                initialAvailability={(availability ?? undefined) as any}
                onSave={async (updated) => {
                  if (!resolvedTrainerId) throw new Error("Mangler trainerId");

                  await saveAvailability(resolvedTrainerId, updated);

                  // les tilbake fra DB (viser alltid det som faktisk ligger lagret)
                  const fresh = await loadAvailability(resolvedTrainerId);
                  setAvailability(fresh);
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}