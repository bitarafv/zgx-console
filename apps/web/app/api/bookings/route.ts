import { randomUUID } from "node:crypto";
import { mutateBookingData, normalizeEmail, normalizeName } from "@/lib/booking-store";
import { publicOrigin, sendAdminBookingRequest } from "@/lib/booking-mail";
import type { DemoBooking } from "@/lib/bookings-types";
import { isBookingLimitExempt } from "@/lib/booking-limit";

const SAFE_ID = /^[a-z0-9-]{1,64}$/;
const ZONES = new Set(Intl.supportedValuesOf("timeZone"));

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = normalizeName(body.name);
    const email = normalizeEmail(body.email);
    const holdToken = typeof body.holdToken === "string" ? body.holdToken : "";
    const workloadId = typeof body.workloadId === "string" && SAFE_ID.test(body.workloadId) ? body.workloadId : null;
    const workloadName = typeof body.workloadName === "string" ? body.workloadName.trim().slice(0, 100) : "";
    const timezone = typeof body.timezone === "string" && ZONES.has(body.timezone) ? body.timezone : "UTC";
    const start = typeof body.start === "string" ? new Date(body.start).toISOString() : "";
    if (!name || !email || !workloadId || !workloadName || !start || !holdToken) return Response.json({ error: "Enter a valid name and email, then choose an available slot." }, { status: 400 });
    const result = await mutateBookingData(data => {
      const currentTime = Date.now();
      data.holds = (data.holds ?? []).filter(hold => Date.parse(hold.expiresAt) > currentTime);
      const hold = data.holds.find(item => item.token === holdToken && item.start === start);
      if (!hold) return { unavailable: true as const };
      const recent = !isBookingLimitExempt(email) && data.bookings.find(item => item.email === email && Date.parse(item.createdAt) > Date.now() - 24 * 60 * 60_000);
      if (recent) return { repeated: true as const };
      data.holds = data.holds.filter(item => item.token !== holdToken);
      const now = new Date().toISOString();
      const booking: DemoBooking = { id: randomUUID(), name, email, workloadId, workloadName, start, end: new Date(Date.parse(start) + 15 * 60_000).toISOString(), blockedUntil: hold.blockedUntil, timezone, status: "pending", createdAt: now, updatedAt: now };
      data.bookings.push(booking);
      return { booking };
    });
    if ("repeated" in result) return Response.json({ error: "Contact Admin HERE for a second view", repeat: true }, { status: 429 });
    if ("unavailable" in result) return Response.json({ error: "That slot is no longer available. Choose another time." }, { status: 409 });
    try { await sendAdminBookingRequest(result.booking, publicOrigin(request)); }
    catch (error) { console.error("Unable to send booking approval email", error); }
    return Response.json({ booking: { id: result.booking.id, status: result.booking.status } }, { status: 201 });
  } catch { return Response.json({ error: "Invalid booking request." }, { status: 400 }); }
}
