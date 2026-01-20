// src/app/(app)/calendar/sections/Section3CalendarDialogHost.tsx
"use client";

import { Booking } from "@/types/booking";
import type { WeeklyAvailability } from "./Section6TrainerAvailability";
import { useBookings } from "@/stores/bookings.store";
import { isWithinWeeklyAvailability } from "@/lib/availability";

import { useBookingDialogState, Role } from "./bookingDialog/useBookingDialogState";
import { BookingDialogUI } from "./bookingDialog/BookingDialogUI";
import { addDays, addMonths, calcEnd, overlaps } from "./bookingDialog/utils";

type Props = {
  mode: "create" | "edit" | null;
  selectedDate: Date | null;
  booking?: Booking | null;
  onClose: () => void;

  role: Role;
  trainerId: string | null;
  clientId: string | null;
  availability: WeeklyAvailability | null;
  allBookings: Booking[];
};

export default function Section3CalendarDialogHost(props: Props) {
  const { addBooking, editBooking, removeBooking, refreshBookings } = useBookings();

  const s = useBookingDialogState(props);

  async function handleCreate() {
    s.setError(null);

    if (!props.trainerId) return s.setError("Mangler trainerId.");
    if (!s.effectiveStart) return s.setError("Velg dato og tidspunkt.");
    if (!s.targetClientId) return s.setError("Velg kunde.");

    // Kunde-regler
    if (props.role === "client") {
      if (!s.passes24h) return s.setError("Du kan kun booke mer enn 24 timer frem i tid.");
      if (!props.availability) return s.setError("Mangler tilgjengelighet.");
      if (!s.withinAvailability) return s.setError("Tidspunktet er utenfor trenerens tilgjengelighet.");
    }

    if (s.conflicts) return s.setError("Dette tidspunktet er allerede booket. Velg et annet.");

    s.setSaving(true);
    try {
      // Lag liste med forekomster
      const occurrences: Date[] = [s.effectiveStart];

      if (s.repeat !== "none") {
        const stepDays = s.repeat === "weekly" ? 7 : 14;
        const until = addMonths(s.effectiveStart, s.repeatMonths);

        let cursor = addDays(s.effectiveStart, stepDays);
        while (cursor.getTime() <= until.getTime()) {
          occurrences.push(new Date(cursor));
          cursor = addDays(cursor, stepDays);
        }
      }

      // Opprett alle - skipp konflikter/utenfor availability for kunde
      for (const dt of occurrences) {
        if (props.role === "client") {
          if (dt.getTime() < s.minClientDate.getTime()) continue;
          if (!props.availability) continue;
          if (!isWithinWeeklyAvailability(props.availability, dt, s.duration)) continue;
        }

        const dtEnd = calcEnd(dt, s.duration);
        const hasConflict = props.allBookings
          .filter((b) => b.status !== "cancelled")
          .filter((b) => b.trainer_id === props.trainerId)
          .some((b) => overlaps(dt, dtEnd, new Date(b.start_time), new Date(b.end_time)));

        if (hasConflict) continue;

        await addBooking({
          trainer_id: props.trainerId,
          client_id: s.targetClientId,
          start_time: dt.toISOString(),
          duration: s.duration,
          repeat: "none",
          note: s.note?.trim() ? s.note.trim() : null,
        });
      }

      await refreshBookings();
      props.onClose();
    } catch (e: any) {
      s.setError(e?.message ?? "Kunne ikke opprette booking.");
    } finally {
      s.setSaving(false);
    }
  }

  async function handleUpdate() {
    s.setError(null);
    if (!props.booking) return;
    if (!s.effectiveStart) return s.setError("Velg dato og tidspunkt.");

    if (props.role === "client" && s.clientEditLocked) {
      return s.setError("Du kan ikke endre mindre enn 24 timer før timen.");
    }

    if (props.role === "client") {
      if (!s.passes24h) return s.setError("Du kan kun endre mer enn 24 timer frem i tid.");
      if (!props.availability) return s.setError("Mangler tilgjengelighet.");
      if (!s.withinAvailability) return s.setError("Tidspunktet er utenfor trenerens tilgjengelighet.");
    }

    if (s.conflicts) return s.setError("Dette tidspunktet er allerede booket. Velg et annet.");

    s.setSaving(true);
    try {
      await editBooking(props.booking.id, {
        start_time: s.effectiveStart.toISOString(),
        duration: s.duration,
        note: s.note?.trim() ? s.note.trim() : null,
      });

      await refreshBookings();
      props.onClose();
    } catch (e: any) {
      s.setError(e?.message ?? "Kunne ikke oppdatere booking.");
    } finally {
      s.setSaving(false);
    }
  }

  async function handleCancel() {
    s.setError(null);
    if (!props.booking) return;

    if (props.role === "client") {
      const start = new Date(props.booking.start_time);
      if (start.getTime() < s.minClientDate.getTime()) {
        return s.setError("Du kan ikke avlyse mindre enn 24 timer før timen.");
      }
    }

    s.setSaving(true);
    try {
      await removeBooking(props.booking.id);
      await refreshBookings();
      props.onClose();
    } catch (e: any) {
      s.setError(e?.message ?? "Kunne ikke avlyse booking.");
    } finally {
      s.setSaving(false);
    }
  }

  const createDisabled =
    s.saving ||
    !props.trainerId ||
    !s.effectiveStart ||
    s.conflicts ||
    !s.targetClientId ||
    (props.role === "client" && (!s.passes24h || !props.availability || !s.withinAvailability));

  const updateDisabled =
    s.saving ||
    !props.booking ||
    !s.effectiveStart ||
    s.conflicts ||
    (props.role === "client" && s.clientEditLocked) ||
    (props.role === "client" && (!s.passes24h || !props.availability || !s.withinAvailability));

  return (
    <BookingDialogUI
      mode={props.mode}
      booking={props.booking ?? null}
      role={props.role}
      availability={props.availability}

      isCreate={s.isCreate}
      isEdit={s.isEdit}

      effectiveStart={s.effectiveStart}
      passes24h={s.passes24h}
      withinAvailability={s.withinAvailability}
      conflicts={s.conflicts}
      clientEditLocked={s.clientEditLocked}

      duration={s.duration}
      setDuration={s.setDuration}

      pickedDate={s.pickedDate}
      setPickedDate={s.setPickedDate}

      pickedTime={s.pickedTime}
      setPickedTime={s.setPickedTime}

      note={s.note}
      setNote={s.setNote}

      repeat={s.repeat}
      setRepeat={s.setRepeat}

      repeatMonths={s.repeatMonths}
      setRepeatMonths={s.setRepeatMonths}

      plannedFirst={s.plannedFirst}
      plannedLast={s.plannedLast}

      slotButtons={s.slotButtons}

      trainerClients={s.trainerClients}
      pickedClientId={s.pickedClientId}
      setPickedClientId={s.setPickedClientId}

      saving={s.saving}
      error={s.error}

      onClose={props.onClose}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onCancel={handleCancel}

      createDisabled={createDisabled}
      updateDisabled={updateDisabled}
    />
  );
}