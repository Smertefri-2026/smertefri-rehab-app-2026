// src/types/booking.ts

export type BookingStatus =
  | "planned"     // fremtidig, ikke fullført
  | "confirmed"   // aktiv / bekreftet
  | "completed"   // gjennomført
  | "cancelled";  // avlyst

export type BookingDuration = 15 | 25 | 50;

export type BookingRepeat =
  | "none"
  | "weekly"
  | "biweekly";

export type Booking = {
  id: string;

  // Relasjoner
  trainer_id: string;
  client_id: string;

  // Tid
  start_time: string; // ISO string (UTC)
  end_time: string;   // ISO string (UTC)

  // Metadata
  duration: BookingDuration;
  status: BookingStatus;

  // Gjentakelse (opsjonelt – senere)
  repeat: BookingRepeat;

  // Notater (valgfritt, fremtid)
  note?: string | null;

  // System
  created_at: string;
  updated_at?: string | null;
};

/**
 * Brukes i dialog ved oppretting / redigering
 */
export type BookingInput = {
  trainer_id: string;
  client_id: string;

  start_time: string;
  duration: BookingDuration;

  repeat?: BookingRepeat;
  note?: string | null;
};