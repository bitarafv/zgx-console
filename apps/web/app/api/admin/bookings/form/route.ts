import { adminSlots, availableSlots, findWindow, isSlotBlock, mutateBookingData, newSlotBlock, newWindow, readBookingData, scheduleOccurrences, updateWindow, validWindow } from "@/lib/booking-store";
import { isAdmin } from "@/lib/runtime";
import { approveBooking, deleteBooking, deliverWelcome, denyBooking, launchBooking, markBookingRead, stopBooking } from "@/lib/booking-actions";
import { publicOrigin } from "@/lib/booking-mail";

function back(_request: Request, message?: string) { const query = new URLSearchParams(); if (message) query.set("bookingError", message); else query.set("bookingUpdated", "1"); return new Response(null, { status: 303, headers: { location: "/admin?" + query.toString() } }); }

export async function POST(request: Request) {
  if (!await isAdmin()) return back(request, "Admin authentication is required.");
  const form = await request.formData();
  const operation = String(form.get("operation") ?? "");
  try {
    if (operation === "upsert") {
      const payload = JSON.parse(String(form.get("payload") ?? "{}")) as Record<string, unknown>;
      const id = typeof payload.id === "string" ? payload.id : "";
      if (!validWindow(payload)) return back(request, "Invalid time window or recurrence rule.");
      await mutateBookingData(data => {
        if (!id) data.availability.push(newWindow(payload));
        else { const item = findWindow(data, id, "availability"); if (!item) throw new Error("Window not found."); updateWindow(item, payload); }
      });
      return back(request);
    }
    if (operation === "delete") {
      const id = String(form.get("id") ?? "");
      await mutateBookingData(data => { data.availability = data.availability.filter(item => item.id !== id); });
      return back(request);
    }
    if (operation === "block-slot") {
      const start = String(form.get("start") ?? "");
      await mutateBookingData(data => {
        if (!availableSlots(data).some(slot => slot.start === start)) throw new Error("That slot is no longer available to block.");
        data.blackouts.push(newSlotBlock(start));
      });
      return back(request);
    }
    if (operation === "unblock-slot") {
      const id = String(form.get("id") ?? "");
      await mutateBookingData(data => {
        const item = data.blackouts.find(value => value.id === id);
        if (!item || !isSlotBlock(item)) throw new Error("Blocked slot not found.");
        data.blackouts = data.blackouts.filter(value => value.id !== id);
      });
      return back(request);
    }
    if (operation === "booking-action") {
      const id = String(form.get("id") ?? ""), action = String(form.get("action") ?? "");
      if (action === "approve") {
        const delivery = await approveBooking(id, publicOrigin(request));
        return back(request, delivery.sent ? undefined : `Booking approved, but welcome delivery failed: ${delivery.error}`);
      }
      if (action === "deny") await denyBooking(id);
      else if (action === "launch") await launchBooking(id);
      else if (action === "stop") await stopBooking(id);
      else if (action === "delete") await deleteBooking(id);
      else if (action === "resend-welcome") {
        const delivery = await deliverWelcome(id, publicOrigin(request));
        if (!delivery.sent) return back(request, `Welcome delivery failed: ${delivery.error}`);
      } else if (action === "mark-read") await markBookingRead(id);
      else return back(request, "Invalid booking action.");
      return back(request);
    }
    return back(request, "Invalid scheduling operation.");
  } catch (error) { console.error("Admin booking form mutation failed", error); return back(request, error instanceof Error ? error.message : "The scheduling update failed."); }
}

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401 });
  const data = await readBookingData();
  return Response.json({ ...data, schedule: scheduleOccurrences(data), slots: adminSlots(data) }, { headers: { "cache-control": "no-store" } });
}
