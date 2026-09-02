import { randomUUID } from "node:crypto";
import { availableSlots, mutateBookingData } from "@/lib/booking-store";
import type { BookingHold } from "@/lib/bookings-types";

const HOLD_MS = 5 * 60_000;
const SLOT_MS = 15 * 60_000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { start?: unknown; token?: unknown } | null;
  const start = typeof body?.start === "string" ? new Date(body.start).toISOString() : "";
  const previousToken = typeof body?.token === "string" ? body.token : "";
  if (!start) return Response.json({ error: "Choose an available time." }, { status: 400 });
  const result = await mutateBookingData(data => {
    const now = Date.now();
    data.holds = (data.holds ?? []).filter(hold => Date.parse(hold.expiresAt) > now && hold.token !== previousToken);
    if (!availableSlots(data, now).some(slot => slot.start === start)) return null;
    const token = randomUUID();
    const hold: BookingHold = { token, start, end: new Date(Date.parse(start) + SLOT_MS).toISOString(), blockedUntil: new Date(Date.parse(start) + 2 * SLOT_MS).toISOString(), createdAt: new Date(now).toISOString(), expiresAt: new Date(now + HOLD_MS).toISOString() };
    data.holds.push(hold);
    return hold;
  });
  return result ? Response.json({ token: result.token, start: result.start, expiresAt: result.expiresAt }, { status: 201 }) : Response.json({ error: "That time was just selected by another visitor. Choose another time." }, { status: 409 });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return Response.json({ released: false });
  await mutateBookingData(data => { data.holds = (data.holds ?? []).filter(hold => hold.token !== token); });
  return Response.json({ released: true });
}
