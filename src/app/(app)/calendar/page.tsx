// src/app/(app)/calendar/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";

import { supabase } from "@/lib/supabaseClient";

import { useBookings } from "@/stores/bookings.store";
import { mapBookingsToEvents } from "@/lib/calendarEvents";
import { mapAvailabilityToBackgroundEvents } from "@/lib/availabilityEvents";

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

import { getProfilesByIds } from "@/lib/profile";

export default function CalendarPage() {
  const { role, loading, userId } = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { view, currentDate, handlePrev, handleNext, handleViewChange } =
    useCalendarState();

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { bookings, loading: bookingsLoading } = useBookings();

  // klientId når rollen er client
  const clientId: string | null = role === "client" ? userId ?? null : null;

  // admin-kontekst (valgt kunde/trener)
  const admin = useAdminContext(role);

  // ✅ Admin: vi viser IKKE kalender før det er valgt trener/kunde
  const adminHasSelection = role !== "admin" ? true : Boolean(admin.selected);

  // ✅ name-cache: id -> "Fornavn Etternavn"
  const [namesById, setNamesById] = useState<Record<string, string>>({});

  // ✅ Client: hent min trainer_id (for availability)
  const [clientTrainerId, setClientTrainerId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (role !== "client" || !userId) {
          if (alive) setClientTrainerId(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("trainer_id")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (alive) setClientTrainerId((data?.trainer_id as string) ?? null);
      } catch (e: any) {
        console.warn("Kunne ikke hente client trainer_id:", e?.message);
        if (alive) setClientTrainerId(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, userId]);

  // ✅ FIX: Auto-velg trener/kunde fra URL (admin)
  useEffect(() => {
    if (role !== "admin") return;

    const trainerFromUrl = searchParams.get("trainer");
    const clientFromUrl = searchParams.get("client");

    // Trainer deep link
    if (
      trainerFromUrl &&
      trainerFromUrl !== admin.contextTrainerId
    ) {
      admin.pickTrainer(trainerFromUrl);
    }

    // Client deep link
    if (
      clientFromUrl &&
      clientFromUrl !== admin.contextClientId
    ) {
      admin.pickClient(clientFromUrl);
    }

    // Hvis du vil rydde URL etter at den er “consumed”, kan du bruke:
    // router.replace("/calendar", { scroll: false });
    // (jeg lar den stå for delbare lenker)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, searchParams]);

  // ✅ resolved trainerId (for availability)
  const resolvedTrainerId = useMemo(() => {
    if (role === "admin") return admin.contextTrainerId ?? null;
    if (role === "trainer") return userId ?? null;
    if (role === "client") return clientTrainerId ?? null;
    return null;
  }, [role, admin.contextTrainerId, userId, clientTrainerId]);

  // ✅ availability (henter kun når vi faktisk har trainerId)
  const { availability, setAvailability, availabilityError } =
    useCalendarAvailability(adminHasSelection ? resolvedTrainerId : null);

  // admin skal kunne “se som kunde” eller “se som trener”
  const eventRole = useMemo(() => {
    if (role !== "admin") return role;
    return admin.perspective; // "client" | "trainer"
  }, [role, admin.perspective]);

  // ✅ Bygg namesById basert på bookings + admin context
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ids = Array.from(
          new Set(
            [
              ...(bookings ?? []).flatMap((b) => [b.client_id, b.trainer_id]),
              admin.contextTrainerId,
              admin.contextClientId,
            ].filter(Boolean)
          )
        ) as string[];

        if (!ids.length) return;

        const rows = await getProfilesByIds(ids);

        const map: Record<string, string> = {};
        for (const r of rows) {
          const n = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim();
          map[r.id] = n || r.id;
        }

        if (!cancelled) setNamesById((prev) => ({ ...prev, ...map }));
      } catch (e) {
        console.warn("getProfilesByIds failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookings, admin.contextTrainerId, admin.contextClientId]);

  // availability background events
  const availabilityEvents = useMemo(() => {
    if (!adminHasSelection) return [];
    return availability ? mapAvailabilityToBackgroundEvents(availability, currentDate, view) : [];
  }, [availability, currentDate, view, adminHasSelection]);

  // bookings -> fullcalendar events
  const calendarEvents = useMemo(() => {
    if (!adminHasSelection) return [];
    return [
      ...availabilityEvents,
      ...mapBookingsToEvents(bookings, {
        role: eventRole as any,
        namesById,
        trainerName: admin.trainerName,
        clientNamesById: admin.clientNamesById,
      }),
    ];
  }, [
    availabilityEvents,
    bookings,
    eventRole,
    namesById,
    admin.trainerName,
    admin.clientNamesById,
    adminHasSelection,
  ]);

  // Når admin fjerner valg: lukk dialog + nullstill selection-state lokalt
  useEffect(() => {
    if (role !== "admin") return;
    if (adminHasSelection) return;

    setDialogMode(null);
    setSelectedDate(null);
    setSelectedBookingId(null);
  }, [role, adminHasSelection]);

  // ✅ labels til Section7AdminSearch
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
        {/* ✅ ADMIN: SØK HELT ØVERST */}
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
                    onClick={() => {
                      admin.clear();
                      // hvis du vil “fjerne” deep link i URL også:
                      // router.replace("/calendar", { scroll: false });
                    }}
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

        {/* Header (Dag/Uke/Måned/År + piler) */}
        <Section1CalendarHeader
          view={view}
          onViewChange={handleViewChange}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {availabilityError && adminHasSelection && (
          <p className="text-xs text-red-600 text-center">{availabilityError}</p>
        )}

        {/* ✅ ADMIN UTEN VALG: INGEN KALENDER */}
        {role === "admin" && !adminHasSelection ? (
          <div className="rounded-2xl border border-sf-border bg-white p-6 text-center text-sm text-sf-muted">
            Velg en trener eller kunde i søket over for å vise kalenderen.
          </div>
        ) : (
          <>
            {/* ✅ Context-label over kalender */}
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
                <p className="text-sm text-sf-muted text-center">Laster bookinger …</p>
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
              role={role}
              trainerId={
                role === "admin"
                  ? admin.contextTrainerId ?? null
                  : role === "trainer"
                  ? userId ?? null
                  : role === "client"
                  ? clientTrainerId ?? null
                  : null
              }
              // ✅ admin i Kunde-kontekst må sende valgt kunde
              clientId={
                role === "admin"
                  ? admin.contextClientId ?? null
                  : clientId ?? null
              }
              availability={availability}
              allBookings={bookings}
            />

            {role === "client" && <Section4ClientUpcoming />}
            {role === "client" && <Section5ClientHistory />}

            {role === "trainer" && (
              <Section6TrainerAvailability
                initialAvailability={(availability ?? null) as any}
                onSave={async (updated) => {
                  setAvailability(updated);
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}