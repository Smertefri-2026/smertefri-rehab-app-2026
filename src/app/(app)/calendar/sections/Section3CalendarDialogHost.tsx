"use client";

import { useEffect, useMemo, useState } from "react";
import { Booking, BookingDuration, BookingRepeat } from "@/types/booking";
import { useBookings } from "@/stores/bookings.store";
import type { WeeklyAvailability } from "./Section6TrainerAvailability";
import { isWithinWeeklyAvailability } from "@/lib/availability";
import { fetchMyClients } from "@/lib/clients.api";

type Role = "client" | "trainer" | "admin" | null;

type Props = {
  mode: "create" | "edit" | null;
  selectedDate: Date | null; // kalenderklikk gir dato, header gir null (wizard)
  booking?: Booking | null;
  onClose: () => void;

  role: Role;
  trainerId: string | null;
  clientId: string | null; // innlogget kunde-id
  availability: WeeklyAvailability | null;
  allBookings: Booking[];
};

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function calcEnd(start: Date, duration: number) {
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);
  return end;
}

function addHours(d: Date, hours: number) {
  const x = new Date(d);
  x.setHours(x.getHours() + hours);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function minutesToHHMM(min: number) {
  const hh = String(Math.floor(min / 60)).padStart(2, "0");
  const mm = String(min % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function hhmmToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return (hh || 0) * 60 + (mm || 0);
}

function jsDayToKey(jsDay: number): keyof WeeklyAvailability {
  const map: Record<number, keyof WeeklyAvailability> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  return map[jsDay];
}

export default function Section3CalendarDialogHost({
  mode,
  selectedDate,
  booking,
  onClose,
  role,
  trainerId,
  clientId,
  availability,
  allBookings,
}: Props) {
  const { addBooking, editBooking, removeBooking, refreshBookings } = useBookings();

  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  // 24t-grense (kunder)
  const minClientDate = useMemo(() => addHours(new Date(), 24), []);

  // Felles state
  const [duration, setDuration] = useState<BookingDuration>(50);
  const [note, setNote] = useState<string>("");

  const [pickedDate, setPickedDate] = useState<string>(() => ymd(new Date()));
  const [pickedTime, setPickedTime] = useState<string | null>(null);

  // Repeat (create)
  const [repeat, setRepeat] = useState<BookingRepeat>("none");
  const [repeatMonths, setRepeatMonths] = useState<3 | 6 | 12>(3);

  // Trainer/admin velger kunde ved create
  const [trainerClients, setTrainerClients] = useState<
    { id: string; first_name: string | null; last_name: string | null }[]
  >([]);
  const [pickedClientId, setPickedClientId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init når dialog åpnes
  useEffect(() => {
    if (!mode) return;

    setError(null);
    setSaving(false);

    // Default
    setDuration(50);
    setNote("");

    if (isCreate) {
      // Kalenderklikk gir selectedDate
      if (selectedDate) {
        setPickedDate(ymd(selectedDate));
        const hh = String(selectedDate.getHours()).padStart(2, "0");
        const mm = String(selectedDate.getMinutes()).padStart(2, "0");
        setPickedTime(`${hh}:${mm}`);
      } else {
        // Header-knapp: wizard
        setPickedDate(ymd(new Date()));
        setPickedTime(null);
      }

      setRepeat("none");
      setRepeatMonths(3);
    }

    if (isEdit && booking) {
      const start = new Date(booking.start_time);
      setPickedDate(ymd(start));
      const hh = String(start.getHours()).padStart(2, "0");
      const mm = String(start.getMinutes()).padStart(2, "0");
      setPickedTime(`${hh}:${mm}`);
      setDuration(booking.duration);
      setNote(booking.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Hent kundeliste for trainer/admin (til create)
  useEffect(() => {
    if (!mode) return;
    if (role !== "trainer" && role !== "admin") return;

    (async () => {
      try {
        const clients = await fetchMyClients();
        const mini = (clients as any[]).map((c) => ({
          id: c.id,
          first_name: c.first_name ?? null,
          last_name: c.last_name ?? null,
        }));
        setTrainerClients(mini);
        if (!pickedClientId && mini.length > 0) setPickedClientId(mini[0].id);
      } catch (e: any) {
        console.warn("Kunne ikke hente kunder:", e?.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, role]);

  // Effective start/end
  const effectiveStart: Date | null = useMemo(() => {
    if (!pickedDate || !pickedTime) return null;
    const [hh, mm] = pickedTime.split(":").map(Number);
    const d = new Date(pickedDate);
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d;
  }, [pickedDate, pickedTime]);

  const effectiveEnd: Date | null = useMemo(() => {
    if (!effectiveStart) return null;
    return calcEnd(effectiveStart, duration);
  }, [effectiveStart, duration]);

  // Kunde 24t
  const passes24h = useMemo(() => {
    if (!effectiveStart) return false;
    if (role !== "client") return true;
    return effectiveStart.getTime() >= minClientDate.getTime();
  }, [effectiveStart, role, minClientDate]);

  // Availability check (kunde må være innenfor)
  const withinAvailability = useMemo(() => {
    if (!effectiveStart || !availability) return false;
    return isWithinWeeklyAvailability(availability, effectiveStart, duration);
  }, [effectiveStart, availability, duration]);

  // Konflikt (dobbeltbooking)
  const conflicts = useMemo(() => {
    if (!effectiveStart || !trainerId) return false;
    const end = calcEnd(effectiveStart, duration);

    return allBookings
      .filter((b) => b.status !== "cancelled")
      .filter((b) => b.trainer_id === trainerId)
      .some((b) => {
        if (isEdit && booking?.id === b.id) return false; // ignorer seg selv ved edit
        return overlaps(effectiveStart, end, new Date(b.start_time), new Date(b.end_time));
      });
  }, [effectiveStart, trainerId, duration, allBookings, isEdit, booking?.id]);

  // Slot buttons: ledige tider (wizard/knappgrid)
  const slotButtons = useMemo(() => {
    if (!availability) return [];
    if (!trainerId) return [];
    if (!pickedDate) return [];

    const d = new Date(pickedDate);
    const dayKey = jsDayToKey(d.getDay());
    const slots = availability?.[dayKey] ?? [];
    if (!slots.length) return [];

    const candidates: string[] = [];
    const step = 30;

    for (const s of slots) {
      if (!s.start || !s.end) continue;
      const startMin = hhmmToMinutes(s.start);
      const endMin = hhmmToMinutes(s.end);

      for (let t = startMin; t + duration <= endMin; t += step) {
        const hhmm = minutesToHHMM(t);

        const start = new Date(pickedDate);
        const [hh, mm] = hhmm.split(":").map(Number);
        start.setHours(hh || 0, mm || 0, 0, 0);

        // 24t regel for kunde
        if (role === "client" && start.getTime() < minClientDate.getTime()) continue;

        // konflikt
        const end = calcEnd(start, duration);
        const hasConflict = allBookings
          .filter((b) => b.status !== "cancelled")
          .filter((b) => b.trainer_id === trainerId)
          .some((b) => {
            if (isEdit && booking?.id === b.id) return false;
            return overlaps(start, end, new Date(b.start_time), new Date(b.end_time));
          });

        if (!hasConflict) candidates.push(hhmm);
      }
    }

    return Array.from(new Set(candidates)).sort();
  }, [availability, trainerId, pickedDate, duration, allBookings, role, minClientDate, isEdit, booking?.id]);

  // Target client
  const targetClientId = useMemo(() => {
    if (role === "client") return clientId;
    if (role === "trainer" || role === "admin") {
      if (isEdit && booking) return booking.client_id;
      return pickedClientId;
    }
    return null;
  }, [role, clientId, pickedClientId, isEdit, booking]);

  // Kunde edit-lock (24t)
  const clientEditLocked = useMemo(() => {
    if (role !== "client") return false;
    if (!booking) return false;
    return new Date(booking.start_time).getTime() < minClientDate.getTime();
  }, [role, booking, minClientDate]);

  // Planlagt første/siste for repeat (UI)
  const plannedFirst = effectiveStart;
  const plannedLast = useMemo(() => {
    if (!effectiveStart) return null;
    if (repeat === "none") return null;

    const stepDays = repeat === "weekly" ? 7 : 14;
    const until = addMonths(effectiveStart, repeatMonths);

    let last = new Date(effectiveStart);
    let cursor = addDays(effectiveStart, stepDays);

    while (cursor.getTime() <= until.getTime()) {
      last = new Date(cursor);
      cursor = addDays(cursor, stepDays);
    }
    return last;
  }, [effectiveStart, repeat, repeatMonths]);

  async function handleCreate() {
    setError(null);

    if (!trainerId) return setError("Mangler trainerId.");
    if (!effectiveStart) return setError("Velg dato og tidspunkt.");
    if (!targetClientId) return setError("Velg kunde.");

    // Kunde-regler
    if (role === "client") {
      if (!passes24h) return setError("Du kan kun booke mer enn 24 timer frem i tid.");
      if (!availability) return setError("Mangler tilgjengelighet.");
      if (!withinAvailability) return setError("Tidspunktet er utenfor trenerens tilgjengelighet.");
    }

    if (conflicts) return setError("Dette tidspunktet er allerede booket. Velg et annet.");

    setSaving(true);
    try {
      // Lag liste med forekomster
      const occurrences: Date[] = [effectiveStart];

      if (repeat !== "none") {
        const stepDays = repeat === "weekly" ? 7 : 14;
        const until = addMonths(effectiveStart, repeatMonths);

        let cursor = addDays(effectiveStart, stepDays);
        while (cursor.getTime() <= until.getTime()) {
          occurrences.push(new Date(cursor));
          cursor = addDays(cursor, stepDays);
        }
      }

      // Opprett alle - skipp konflikter/utenfor availability for kunde
      for (const dt of occurrences) {
        // kunde-regler per forekomst
        if (role === "client") {
          if (dt.getTime() < minClientDate.getTime()) continue;
          if (!availability) continue;
          if (!isWithinWeeklyAvailability(availability, dt, duration)) continue;
        }

        // konflikt-sjekk per forekomst (lokal)
        const dtEnd = calcEnd(dt, duration);
        const hasConflict = allBookings
          .filter((b) => b.status !== "cancelled")
          .filter((b) => b.trainer_id === trainerId)
          .some((b) => overlaps(dt, dtEnd, new Date(b.start_time), new Date(b.end_time)));

        if (hasConflict) continue;

        await addBooking({
          trainer_id: trainerId,
          client_id: targetClientId,
          start_time: dt.toISOString(),
          duration,
          repeat: "none",
          note: note?.trim() ? note.trim() : null,
        });
      }

      await refreshBookings();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke opprette booking.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    setError(null);
    if (!booking) return;
    if (!effectiveStart) return setError("Velg dato og tidspunkt.");

    if (role === "client" && clientEditLocked) {
      return setError("Du kan ikke endre mindre enn 24 timer før timen.");
    }

    if (role === "client") {
      if (!passes24h) return setError("Du kan kun endre mer enn 24 timer frem i tid.");
      if (!availability) return setError("Mangler tilgjengelighet.");
      if (!withinAvailability) return setError("Tidspunktet er utenfor trenerens tilgjengelighet.");
    }

    if (conflicts) return setError("Dette tidspunktet er allerede booket. Velg et annet.");

    setSaving(true);
    try {
      await editBooking(booking.id, {
        start_time: effectiveStart.toISOString(),
        duration,
        note: note?.trim() ? note.trim() : null,
      });

      await refreshBookings();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke oppdatere booking.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    setError(null);
    if (!booking) return;

    if (role === "client") {
      const start = new Date(booking.start_time);
      if (start.getTime() < minClientDate.getTime()) {
        return setError("Du kan ikke avlyse mindre enn 24 timer før timen.");
      }
    }

    setSaving(true);
    try {
      await removeBooking(booking.id);
      await refreshBookings();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke avlyse booking.");
    } finally {
      setSaving(false);
    }
  }

  if (!mode) return null;

  const createDisabled =
    saving ||
    !trainerId ||
    !effectiveStart ||
    conflicts ||
    !targetClientId ||
    (role === "client" && (!passes24h || !availability || !withinAvailability));

  const updateDisabled =
    saving ||
    !booking ||
    !effectiveStart ||
    conflicts ||
    (role === "client" && clientEditLocked) ||
    (role === "client" && (!passes24h || !availability || !withinAvailability));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="p-6 pb-3">
          <h3 className="text-base font-semibold">{isCreate ? "Ny time" : "Rediger time"}</h3>

          <div className="mt-2 text-sm text-sf-muted space-y-1">
            <div>
              Valgt tidspunkt:{" "}
              <strong>{effectiveStart ? effectiveStart.toLocaleString("nb-NO") : "—"}</strong>
            </div>

            <div className="text-xs">
              {role === "client" ? (
                !passes24h ? (
                  <span className="text-red-600">❌ Må være mer enn 24t frem</span>
                ) : conflicts ? (
                  <span className="text-red-600">❌ Allerede booket</span>
                ) : withinAvailability ? (
                  <span className="text-green-700">✅ Innenfor tilgjengelighet</span>
                ) : (
                  <span className="text-red-600">❌ Utenfor tilgjengelighet</span>
                )
              ) : conflicts ? (
                <span className="text-red-600">❌ Allerede booket</span>
              ) : availability && effectiveStart && !withinAvailability ? (
                <span className="text-amber-700">⚠️ Utenfor tilgjengelighet (trener/admin kan overstyre)</span>
              ) : (
                <span className="text-green-700">✅ Klar</span>
              )}
            </div>

            {isEdit && role === "client" && clientEditLocked ? (
              <div className="text-xs text-red-600">
                Du kan ikke endre/avlyse mindre enn 24 timer før timen.
              </div>
            ) : null}
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 pb-4 overflow-y-auto space-y-3">
          {/* Kundevalg for trainer/admin (create) */}
          {isCreate && (role === "trainer" || role === "admin") && (
            <div className="rounded-xl border border-sf-border p-3 space-y-2">
              <div className="text-sm font-medium">Kunde</div>
              <select
                value={pickedClientId ?? ""}
                onChange={(e) => setPickedClientId(e.target.value)}
                className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm"
              >
                {trainerClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Kunde"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Varighet */}
          <div className="rounded-xl border border-sf-border p-3 space-y-2">
            <div className="text-sm font-medium">Varighet</div>
            <div className="flex gap-2">
              {[15, 25, 50].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m as BookingDuration)}
                  className={`rounded-full px-4 py-2 text-sm border ${
                    duration === m ? "bg-[#007C80] text-white border-transparent" : "bg-white border-sf-border text-sf-text"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          {/* Dato/tid */}
          <div className="rounded-xl border border-sf-border p-3 space-y-3">
            <div className="text-sm font-medium">Dato</div>
            <input
              type="date"
              value={pickedDate}
              onChange={(e) => {
                setPickedDate(e.target.value);
                setPickedTime(null);
              }}
              className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm"
              disabled={role === "client" && isEdit && clientEditLocked}
            />

            <div className="text-sm font-medium">Tidspunkt</div>
            {slotButtons.length ? (
              <div className="grid grid-cols-4 gap-2">
                {slotButtons.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPickedTime(t)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      pickedTime === t ? "bg-[#007C80] text-white border-transparent" : "bg-white border-sf-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sf-muted">Ingen ledige tidspunkter denne dagen.</p>
            )}
          </div>

          {/* Gjentak (create) */}
          {isCreate && (
            <div className="rounded-xl border border-sf-border p-3 space-y-3">
              <div className="text-sm font-medium">Gjentak</div>
              <div className="flex gap-2">
                {[
                  { key: "none", label: "Ingen" },
                  { key: "weekly", label: "Ukentlig" },
                  { key: "biweekly", label: "Annenhver uke" },
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRepeat(r.key as BookingRepeat)}
                    className={`rounded-full px-4 py-2 text-sm border ${
                      repeat === r.key ? "bg-[#007C80] text-white border-transparent" : "bg-white border-sf-border text-sf-text"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {repeat !== "none" && (
                <div className="space-y-2">
                  <div className="text-xs text-sf-muted">Hvor lenge? (fra valgt dag – trykk endrer)</div>
                  <div className="flex gap-2">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRepeatMonths(m as 3 | 6 | 12)}
                        className={`rounded-full px-4 py-2 text-sm border ${
                          repeatMonths === m ? "bg-[#007C80] text-white border-transparent" : "bg-white border-sf-border text-sf-text"
                        }`}
                      >
                        + {m} mnd
                      </button>
                    ))}
                  </div>

                  {plannedFirst && (
                    <div className="text-xs text-sf-muted pt-1">
                      Første: <strong>{plannedFirst.toLocaleString("nb-NO")}</strong>
                      {plannedLast ? (
                        <>
                          {" "}• Siste: <strong>{plannedLast.toLocaleString("nb-NO")}</strong>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notat – skjul på mobil */}
          <div className="hidden md:block rounded-xl border border-sf-border p-3 space-y-2">
            <div className="text-sm font-medium">Notat (valgfritt)</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm outline-none"
              placeholder="F.eks. fokus: rygg / hofte, smerter, mål…"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-sf-border bg-white flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Avbryt
          </button>

          {isEdit ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving || !booking || booking.status === "cancelled" || (role === "client" && clientEditLocked)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Jobber…" : "Slett / avlys"}
              </button>

              <button
                onClick={handleUpdate}
                disabled={updateDisabled}
                className="rounded-lg bg-sf-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Lagrer…" : "Lagre endring"}
              </button>
            </>
          ) : (
            <button
              onClick={handleCreate}
              disabled={createDisabled}
              className="rounded-lg bg-sf-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Lagrer…" : "Lagre booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}