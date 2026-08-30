import { describe, expect, it } from "vitest";
import type { AdminBookingData, DemoBooking } from "./bookings-types";
import { bookingAdminView } from "./booking-admin-view";

const now = Date.parse("2026-08-29T12:00:00.000Z");
const booking = (id: string, status: DemoBooking["status"], start: string, stoppedAt?: string): DemoBooking => ({
  id, status, start, stoppedAt, end: new Date(Date.parse(start) + 15 * 60_000).toISOString(),
  blockedUntil: new Date(Date.parse(start) + 30 * 60_000).toISOString(), name: id, email: id + "@example.com",
  workloadId: "demo", workloadName: "Demo", timezone: "UTC", createdAt: start, updatedAt: start,
});
const data = (bookings: DemoBooking[]): AdminBookingData => ({
  version: 1, availability: [], blackouts: [], holds: [], bookings, schedule: [],
  slots: [
    { start: "2026-08-29T13:00:00.000Z", end: "2026-08-29T13:15:00.000Z", status: "available" },
    { start: "2026-08-29T11:00:00.000Z", end: "2026-08-29T11:15:00.000Z", status: "available" },
    { start: "2026-08-29T14:00:00.000Z", end: "2026-08-29T14:15:00.000Z", status: "blocked", blackoutId: "blackout" },
    { start: "2026-08-29T15:00:00.000Z", end: "2026-08-29T15:15:00.000Z", status: "cooldown" },
  ],
});

describe("bookingAdminView", () => {
  it("keeps only future pending and approved bookings in chronological upcoming order", () => {
    const view = bookingAdminView(data([
      booking("approved", "approved", "2026-08-29T14:00:00.000Z"),
      booking("pending", "pending", "2026-08-29T13:00:00.000Z"),
      booking("denied", "denied", "2026-08-29T15:00:00.000Z"),
      booking("past", "approved", "2026-08-29T10:00:00.000Z"),
    ]), now);
    expect(view.upcoming.map(item => item.id)).toEqual(["pending", "approved"]);
    expect(view.pendingCount).toBe(1);
    expect(view.approvedCount).toBe(1);
    expect(view.history.map(item => item.id)).toEqual(["denied", "past"]);
  });

  it("shows only future available slots and keeps blocked slots separate", () => {
    const view = bookingAdminView(data([]), now);
    expect(view.availableSlots.map(item => item.start)).toEqual(["2026-08-29T13:00:00.000Z"]);
    expect(view.blockedSlots.map(item => item.blackoutId)).toEqual(["blackout"]);
  });
});
