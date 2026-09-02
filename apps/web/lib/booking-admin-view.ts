import type { AdminBookingData, DemoBooking } from "./bookings-types";

export function bookingAdminView(data: AdminBookingData | null, now: number) {
  const bookings = data?.bookings ?? [];
  const upcoming = bookings
    .filter(item => isUpcomingBooking(item, now))
    .sort((left, right) => left.start.localeCompare(right.start));
  const upcomingIds = new Set(upcoming.map(item => item.id));
  const history = bookings
    .filter(item => !upcomingIds.has(item.id))
    .sort((left, right) => right.start.localeCompare(left.start));
  const availableSlots = (data?.slots ?? [])
    .filter(slot => slot.status === "available" && Date.parse(slot.start) >= now)
    .sort((left, right) => left.start.localeCompare(right.start));
  const blockedSlots = (data?.slots ?? [])
    .filter(slot => slot.status === "blocked" && Date.parse(slot.start) >= now)
    .sort((left, right) => left.start.localeCompare(right.start));

  return {
    upcoming,
    history,
    availableSlots,
    blockedSlots,
    pendingCount: upcoming.filter(item => item.status === "pending").length,
    approvedCount: upcoming.filter(item => item.status === "approved").length,
  };
}

function isUpcomingBooking(item: DemoBooking, now: number) {
  return (item.status === "pending" || item.status === "approved") && Date.parse(item.start) >= now;
}
