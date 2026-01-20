// src/lib/calendarEvents.ts
import { Booking } from "@/types/booking";

type Opts = {
  role?: "client" | "trainer" | "admin" | null;

  // gamle fallback (behold)
  trainerName?: string;
  clientNamesById?: Record<string, string>;

  // ny cache
  namesById?: Record<string, string>;
};

export function mapBookingsToEvents(bookings: Booking[], opts?: Opts) {
  const role = opts?.role ?? null;
  const trainerName = opts?.trainerName ?? "";
  const clientNamesById = opts?.clientNamesById ?? {};
  const namesById = opts?.namesById ?? {};

  const nameOf = (id?: string | null) => (id ? namesById[id] : "") || "";

  return (bookings ?? [])
    .filter((b) => b.status !== "cancelled")
    .map((b) => {
      let title = "Booking";

      if (role === "client") {
        title = nameOf(b.trainer_id) || trainerName || "Trener";
      } else if (role === "trainer") {
        title =
          nameOf(b.client_id) ||
          clientNamesById[b.client_id] ||
          "Kunde";
      } else if (role === "admin") {
        const c = nameOf(b.client_id) || clientNamesById[b.client_id] || "Kunde";
        const t = nameOf(b.trainer_id) || trainerName || "Trener";
        title = `${c} · ${t}`;
      }

      return {
        id: b.id,
        title,
        start: b.start_time,
        end: b.end_time,
        backgroundColor: colorByStatus(b.status),
        borderColor: "transparent",
      };
    });
}

function colorByStatus(status: Booking["status"]) {
  switch (status) {
    case "confirmed":
      return "#007C80";
    case "completed":
      return "#6FB3A8";
    case "cancelled":
      return "#E57373";
    default:
      return "#B0BEC5";
  }
}