import { Booking } from "@/types/booking";

export function mapBookingsToEvents(bookings: Booking[]) {
  return bookings.map((b) => ({
    id: b.id,
    title: "Booket time",
    start: b.start_time,
    end: b.end_time,
    backgroundColor: colorByStatus(b.status),
    borderColor: "transparent",
  }));
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