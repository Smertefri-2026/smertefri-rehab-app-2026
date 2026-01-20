// src/app/(app)/calendar/sections/bookingDialog/useBookingDialogState.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { Booking, BookingDuration, BookingRepeat } from "@/types/booking";
import type { WeeklyAvailability } from "../Section6TrainerAvailability";
import { isWithinWeeklyAvailability } from "@/lib/availability";
import { fetchMyClients, fetchAllClients } from "@/lib/clients.api";
import {
  addDays,
  addHours,
  addMonths,
  calcEnd,
  hhmmToMinutes,
  jsDayToKey,
  minutesToHHMM,
  overlaps,
  ymd,
} from "./utils";

export type Role = "client" | "trainer" | "admin" | null;

type Args = {
  mode: "create" | "edit" | null;
  selectedDate: Date | null;
  booking?: Booking | null;

  role: Role;
  trainerId: string | null;
  clientId: string | null;
  availability: WeeklyAvailability | null;
  allBookings: Booking[];
};

export function useBookingDialogState({
  mode,
  selectedDate,
  booking,
  role,
  trainerId,
  clientId,
  availability,
  allBookings,
}: Args) {
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
      if (selectedDate) {
        setPickedDate(ymd(selectedDate));
        const hh = String(selectedDate.getHours()).padStart(2, "0");
        const mm = String(selectedDate.getMinutes()).padStart(2, "0");
        setPickedTime(`${hh}:${mm}`);
      } else {
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

  // ✅ Hent kundeliste for trainer/admin (til create)
  useEffect(() => {
    if (!mode) return;
    if (role !== "trainer" && role !== "admin") return;

    (async () => {
      try {
        const clients = role === "admin" ? await fetchAllClients() : await fetchMyClients();

        const mini = (clients as any[]).map((c) => ({
          id: c.id,
          first_name: c.first_name ?? null,
          last_name: c.last_name ?? null,
        }));

        setTrainerClients(mini);

        // sett default om ikke valgt ennå
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
        if (isEdit && booking?.id === b.id) return false;
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
  }, [
    availability,
    trainerId,
    pickedDate,
    duration,
    allBookings,
    role,
    minClientDate,
    isEdit,
    booking?.id,
  ]);

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

  return {
    isCreate,
    isEdit,

    minClientDate,
    passes24h,
    withinAvailability,
    conflicts,
    clientEditLocked,

    duration,
    setDuration,
    note,
    setNote,
    pickedDate,
    setPickedDate,
    pickedTime,
    setPickedTime,
    repeat,
    setRepeat,
    repeatMonths,
    setRepeatMonths,

    effectiveStart,
    effectiveEnd,
    slotButtons,
    plannedFirst,
    plannedLast,
    targetClientId,

    trainerClients,
    pickedClientId,
    setPickedClientId,

    saving,
    setSaving,
    error,
    setError,
  };
}