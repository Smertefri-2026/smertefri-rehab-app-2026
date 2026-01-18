// src/lib/bookings.api.ts

import { supabase } from "@/lib/supabaseClient";
import { Booking, BookingInput } from "@/types/booking";

/* ============================
   HENT BOOKINGER
============================ */

/**
 * 👤 Kunde – egne bookinger
 */
export async function fetchBookingsForClient(
  clientId: string
): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", clientId)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * 🧑‍🏫 Trener – egne bookinger
 */
export async function fetchBookingsForTrainer(
  trainerId: string
): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * 🛡 Admin – alle bookinger
 */
export async function fetchAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/* ============================
   OPPRETT / OPPDATER
============================ */

/**
 * ➕ Opprett ny booking
 */
export async function createBooking(
  input: BookingInput
): Promise<Booking> {
  const start = new Date(input.start_time);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + input.duration);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      trainer_id: input.trainer_id,
      client_id: input.client_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration: input.duration,
      repeat: input.repeat ?? "none",
      status: "confirmed",
      note: input.note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ✏️ Oppdater eksisterende booking
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<BookingInput & { status: string }>
): Promise<Booking> {
  const patch: any = { ...updates };

  // Hvis start + duration → regn ut ny slutt
  if (updates.start_time && updates.duration) {
    const start = new Date(updates.start_time);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + updates.duration);
    patch.end_time = end.toISOString();
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ❌ Avlys / slett booking
 */
export async function cancelBooking(
  bookingId: string
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) throw error;
}