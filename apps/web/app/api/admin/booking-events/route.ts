import { adminSlots, bookingRevision, readBookingData, scheduleOccurrences, subscribeToBookingChanges } from "@/lib/booking-store";
import { isAdmin } from "@/lib/runtime";
import type { AdminBookingEvent } from "@/lib/bookings-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function snapshot(revision: number): Promise<AdminBookingEvent> {
  const data = await readBookingData();
  return { revision, data: { ...data, schedule: scheduleOccurrences(data), slots: adminSlots(data) } };
}

export async function GET(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401, headers: { "cache-control": "no-store" } });
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const close = () => { if (closed) return; closed = true; unsubscribe?.(); if (heartbeat) clearInterval(heartbeat); try { controller.close(); } catch {} };
      const send = async (revision: number) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(await snapshot(revision))}\n\n`)); }
        catch (error) { console.error("Admin booking event stream failed", error); close(); }
      };
      unsubscribe = subscribeToBookingChanges(revision => { void send(revision); });
      request.signal.addEventListener("abort", close, { once: true });
      heartbeat = setInterval(() => { try { controller.enqueue(encoder.encode(": heartbeat\n\n")); } catch { close(); } }, 15_000);
      await send(bookingRevision());
    },
    cancel() { unsubscribe?.(); if (heartbeat) clearInterval(heartbeat); },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-store, no-transform", "connection": "keep-alive", "x-accel-buffering": "no" } });
}
