import { Booking } from "@/types/booking";

export function mapBookingsToEvents(bookings: Booking[], opts?: { role?: "client"|"trainer"|"admin"|null; trainerName?: string; clientNamesById?: Record<string,string> }) {
  const role = opts?.role ?? null;
  const trainerName = opts?.trainerName ?? "PT";
  const clientNamesById = opts?.clientNamesById ?? {};

  return (bookings ?? [])
    .filter((b) => b.status !== "cancelled") // ✅ viktig
    .map((b) => {
      let title = "Booket";

      // Hvis du senere sender inn navn:
      if (role === "client") title = `PT med ${trainerName}`;
      if (role === "trainer") title = clientNamesById[b.client_id] ?? "Kunde";
      if (role === "admin") title = "Booking";

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