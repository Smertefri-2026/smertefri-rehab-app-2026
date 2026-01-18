"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Booking } from "@/types/booking";
import {
  fetchBookingsForClient,
  fetchBookingsForTrainer,
  fetchAllBookings,
  createBooking,
  updateBooking,
  cancelBooking,
} from "@/lib/bookings.api";

import { useRole } from "@/providers/RoleProvider";

/* ============================
   TYPES
============================ */

type BookingsContextType = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;

  getBookingById: (id: string) => Booking | undefined;

  refreshBookings: () => Promise<void>;

  addBooking: (
    input: Parameters<typeof createBooking>[0]
  ) => Promise<Booking>;

  editBooking: (
    bookingId: string,
    updates: Parameters<typeof updateBooking>[1]
  ) => Promise<Booking>;

  removeBooking: (bookingId: string) => Promise<void>;
};

/* ============================
   CONTEXT
============================ */

const BookingsContext = createContext<BookingsContextType | null>(null);

/* ============================
   PROVIDER
============================ */

export function BookingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { role, userId, loading: roleLoading } = useRole();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------- LOAD -------- */

  async function load() {
    // ⛔️ Vent til RoleProvider er ferdig
    if (roleLoading) return;

    // ⛔️ Ikke-innlogget (AuthGuard skal normalt stoppe dette)
    if (!role) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: Booking[] = [];

      if (role === "admin") {
        data = await fetchAllBookings();
      } else if (role === "trainer") {
        if (!userId) throw new Error("Mangler trainerId");
        data = await fetchBookingsForTrainer(userId);
      } else {
        if (!userId) throw new Error("Mangler clientId");
        data = await fetchBookingsForClient(userId);
      }

      console.log("📦 BOOKINGS LOADED:", data);

      setBookings(data ?? []);
    } catch (err: any) {
      console.error("❌ BOOKINGS LOAD FAILED (FULL ERROR):", err);

      setError(
        err?.message ??
          "Kunne ikke hente bookinger (se console for detaljer)"
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, userId, roleLoading]);

  /* -------- HELPERS -------- */

  function getBookingById(id: string) {
    return bookings.find((b) => b.id === id);
  }

  /* -------- MUTATIONS -------- */

  async function addBooking(
    input: Parameters<typeof createBooking>[0]
  ) {
    const booking = await createBooking(input);

    setBookings((prev) =>
      [...prev, booking].sort(
        (a, b) =>
          new Date(a.start_time).getTime() -
          new Date(b.start_time).getTime()
      )
    );

    return booking;
  }

  async function editBooking(
    bookingId: string,
    updates: Parameters<typeof updateBooking>[1]
  ) {
    const updated = await updateBooking(bookingId, updates);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? updated : b))
    );

    return updated;
  }

  async function removeBooking(bookingId: string) {
    await cancelBooking(bookingId);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "cancelled" }
          : b
      )
    );
  }

  /* -------- PROVIDER -------- */

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        loading,
        error,
        getBookingById,
        refreshBookings: load,
        addBooking,
        editBooking,
        removeBooking,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

/* ============================
   HOOK
============================ */

export function useBookings() {
  const ctx = useContext(BookingsContext);

  if (!ctx) {
    throw new Error(
      "useBookings må brukes innenfor BookingsProvider"
    );
  }

  return ctx;
}