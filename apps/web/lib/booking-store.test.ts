import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adminSlots, availableSlots, isSlotBlock, newSlotBlock, scheduleOccurrences, validWindow } from "./booking-schedule";
import { isBookingLimitExempt } from "./booking-limit";
import { matchesBookingReply } from "./booking-reply-match";
import type { BookingData } from "./bookings-types";

const empty = (): BookingData => ({ version: 1, availability: [], blackouts: [], bookings: [], holds: [] });
const adminSource = readFileSync(new URL("../components/DemoBookingAdmin.tsx", import.meta.url), "utf8");
const adminRouteSource = readFileSync(new URL("../app/api/admin/bookings/route.ts", import.meta.url), "utf8");
const adminEventsSource = readFileSync(new URL("../app/api/admin/booking-events/route.ts", import.meta.url), "utf8");
const adminBrowserFormSource = readFileSync(new URL("../app/admin/bookings/form/route.ts", import.meta.url), "utf8");
const adminMutationSource = readFileSync(new URL("../app/api/admin/bookings/form/route.ts", import.meta.url), "utf8");
const bookingMailSource = readFileSync(new URL("./booking-mail.ts", import.meta.url), "utf8");
const monday = Date.parse("2026-09-07T00:00:00.000Z");

describe("exclusive demo booking availability", () => {
  it("restricts every slot when no availability is explicitly configured", () => {
    expect(availableSlots(empty(), monday)).toEqual([]);
  });

  it("commits one-time availability as 15-minute starts with cooldown capacity", () => {
    const data = empty();
    data.availability.push({ id: "one", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z" });
    expect(availableSlots(data, monday).map(slot => slot.start)).toEqual([
      "2026-09-07T10:00:00.000Z", "2026-09-07T10:15:00.000Z", "2026-09-07T10:30:00.000Z", "2026-09-07T10:45:00.000Z",
    ]);
  });

  it("locks both a requested slot and its following cooldown slot", () => {
    const data = empty();
    data.availability.push({ id: "one", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z" });
    data.bookings.push({ id: "request", name: "Ada Lovelace", email: "ada@example.com", workloadId: "demo", workloadName: "Demo", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T10:15:00.000Z", blockedUntil: "2026-09-07T10:30:00.000Z", timezone: "UTC", status: "pending", createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" });
    expect(availableSlots(data, monday).map(slot => slot.start)).toEqual(["2026-09-07T10:30:00.000Z", "2026-09-07T10:45:00.000Z"]);
  });

  it("blocks exactly one visit slot without consuming the preceding cooldown", () => {
    const data = empty();
    data.availability.push({ id: "one", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z" });
    data.blackouts.push({ id: "slot-block:test", start: "2026-09-07T10:15:00.000Z", end: "2026-09-07T10:30:00.000Z", label: "Admin blocked slot" });
    expect(availableSlots(data, monday).map(slot => slot.start)).toEqual(["2026-09-07T10:00:00.000Z", "2026-09-07T10:30:00.000Z", "2026-09-07T10:45:00.000Z"]);
    const blocked = adminSlots(data, monday).find(slot => slot.start === "2026-09-07T10:15:00.000Z");
    expect(blocked).toMatchObject({ status: "blocked", blackoutId: "slot-block:test" });
  });
  it("creates identifiable one-time slot blocks", () => {
    const item = newSlotBlock("2026-09-07T10:15:00.000Z");
    expect(isSlotBlock(item)).toBe(true);
    expect(Date.parse(item.end) - Date.parse(item.start)).toBe(15 * 60_000);
  });
  it("excludes active holds and ignores expired holds", () => {
    const data = empty();
    data.availability.push({ id: "one", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z" });
    data.holds.push({ token: "active", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T10:15:00.000Z", blockedUntil: "2026-09-07T10:30:00.000Z", createdAt: "2026-09-06T00:00:00.000Z", expiresAt: "2026-09-07T00:10:00.000Z" });
    expect(availableSlots(data, monday).map(slot => slot.start)).toEqual(["2026-09-07T10:30:00.000Z", "2026-09-07T10:45:00.000Z"]);
    data.holds[0].expiresAt = "2026-09-06T23:59:00.000Z";
    expect(availableSlots(data, monday)).toHaveLength(4);
  });

  it("expands weekly recurring days and removes occurrences covered by recurring blackouts", () => {
    const data = empty();
    data.availability.push({ id: "weekly", start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z", recurrence: { frequency: "weekly", daysOfWeek: [1, 3], until: "2026-09-16T23:59:59.000Z", timeZone: "UTC" } });
    data.blackouts.push({ id: "blocked", start: "2026-09-09T10:00:00.000Z", end: "2026-09-09T11:00:00.000Z", recurrence: { frequency: "weekly", daysOfWeek: [3], until: "2026-09-09T23:59:59.000Z", timeZone: "UTC" } });
    const slots = availableSlots(data, monday, Date.parse("2026-09-17T00:00:00.000Z"));
    expect(slots.some(slot => slot.start.startsWith("2026-09-09"))).toBe(false);
    expect(slots.some(slot => slot.start.startsWith("2026-09-14"))).toBe(true);
    expect(scheduleOccurrences(data, monday, Date.parse("2026-09-17T00:00:00.000Z")).filter(item => item.sourceId === "weekly")).toHaveLength(4);
  });

  it("rejects invalid or unbounded recurrence rules", () => {
    expect(validWindow({ start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z", recurrence: { frequency: "weekly", daysOfWeek: [], until: "2026-09-14T00:00:00.000Z", timeZone: "UTC" } })).toBe(false);
    expect(validWindow({ start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z", recurrence: { frequency: "daily", daysOfWeek: [0,1,2,3,4,5,6], until: "2028-09-14T00:00:00.000Z", timeZone: "UTC" } })).toBe(false);
  });
  it("exempts only the configured normalized test email from the request limit", () => {
    const previous = process.env.ZGX_BOOKING_LIMIT_EXEMPT_EMAIL;
    process.env.ZGX_BOOKING_LIMIT_EXEMPT_EMAIL = "  BITARAFV@YAHOO.COM  ";
    expect(isBookingLimitExempt("bitarafv@yahoo.com")).toBe(true);
    expect(isBookingLimitExempt("another@yahoo.com")).toBe(false);
    if (previous === undefined) delete process.env.ZGX_BOOKING_LIMIT_EXEMPT_EMAIL; else process.env.ZGX_BOOKING_LIMIT_EXEMPT_EMAIL = previous;
  });
  it("uses native Admin form mutations and server-seeded schedule state", () => {
    expect(adminSource).toContain(`action="/admin/bookings/form"`);
    expect(adminSource).toContain(`method="post"`);
    expect(adminSource).toContain("initialData");
    expect(adminSource).toContain("booking-slot-grid");
    expect(adminRouteSource).toContain("status: 401");
  });
  it("streams complete authenticated Admin snapshots instead of polling public slots", () => {
    expect(adminSource).toContain(`new EventSource("/admin/booking-events")`);
    expect(adminSource).toContain("setData(update.data)");
    expect(adminSource).not.toContain(`fetch("/api/bookings/status"`);
    expect(adminEventsSource).toContain("if (!await isAdmin())");
    expect(adminEventsSource).toContain(`"text/event-stream; charset=utf-8"`);
    expect(adminEventsSource).toContain("subscribeToBookingChanges");
    expect(adminBrowserFormSource).toContain("mutateAdminBooking(request)");
    expect(adminRouteSource).not.toContain(`new URL("/admin", request.url)`);
    expect(adminSource).not.toContain(`action="/api/admin/bookings/form"`);
  });
  it("correlates replies through references and the visitor footer fallback", () => {
    const booking = { id: "booking-123", email: "visitor@example.com", approvalMessageId: "<welcome@bncvc.com>" };
    expect(matchesBookingReply(booking, ["visitor@example.com"], ["<welcome@bncvc.com>"], "Re: confirmed", "Thanks")).toBe(true);
    expect(matchesBookingReply(booking, ["visitor@example.com"], [], "Re: confirmed", "ZGX booking reference: booking-123")).toBe(true);
    expect(matchesBookingReply(booking, ["attacker@example.com"], ["<welcome@bncvc.com>"], "Re: confirmed", "ZGX booking reference: booking-123")).toBe(false);
  });
  it("adds an RFC-compliant Date header to outbound email", () => {
    expect(bookingMailSource).toContain("Date: ");
    expect(bookingMailSource).toContain("toUTCString()");
    expect(bookingMailSource).toContain("Auto-Submitted: auto-generated");
    expect(bookingMailSource).toContain("Your ZGX demo access is confirmed");
    expect(bookingMailSource).not.toContain("[ZGX:] Your");
  });
  it("uses atomic native controls for slot blocks and explicit whole-window deletion", () => {
    expect(adminSource).toContain('operation="block-slot"');
    expect(adminSource).toContain('operation="unblock-slot"');
    expect(adminSource).toContain("Delete entire window");
    expect(adminSource).toContain("Approximately ${affected} displayed slots will disappear");
    expect(adminMutationSource).toContain('operation === "block-slot"');
    expect(adminMutationSource).toContain("availableSlots(data).some");
    expect(adminMutationSource).toContain('operation === "unblock-slot"');
  });
  it("preserves Admin scroll across native form redirects", () => {
    expect(adminSource).toContain("useLayoutEffect");
    expect(adminSource).toContain("window.sessionStorage.setItem");
    expect(adminSource).toContain("window.sessionStorage.removeItem");
    expect(adminSource).toContain("window.scrollY");
    expect(adminSource).toContain('root.style.setProperty("scroll-behavior", "auto", "important")');
    expect(adminSource).toContain('[data-admin-scroll]');
    expect(adminSource).toContain('[data-admin-details]');
    expect(adminSource).toContain("if (!event.defaultPrevented)");
  });
  it("exposes only valid lifecycle controls and permanent deletion", () => {
    expect(adminSource).not.toContain('"release"');
    expect(adminSource).toContain('action="delete"');
    expect(adminSource).toContain("window.confirm");
    expect(adminSource).toContain('action="resend-welcome"');
    expect(adminSource).toContain('action="mark-read"');
  });
});
