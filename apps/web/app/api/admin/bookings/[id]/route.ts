import { approveBooking, deleteBooking, deliverWelcome, denyBooking, launchBooking, markBookingRead, stopBooking } from "@/lib/booking-actions";
import { publicOrigin } from "@/lib/booking-mail";
import { isAdmin } from "@/lib/runtime";

const ACTIONS = new Set(["approve", "deny", "launch", "stop", "delete", "resend-welcome", "mark-read"]);
export async function POST(request: Request, context: RouteContext<"/api/admin/bookings/[id]">) {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401, headers: { "cache-control": "no-store" } });
  const { id } = await context.params;
  const { action } = await request.json().catch(() => ({})) as { action?: string };
  if (!action || !ACTIONS.has(action)) return Response.json({ error: "Invalid action" }, { status: 400 });
  try {
    if (action === "approve") {
      const delivery = await approveBooking(id, publicOrigin(request));
      return Response.json({ ok: true, delivery });
    }
    if (action === "deny") await denyBooking(id);
    else if (action === "launch") await launchBooking(id);
    else if (action === "stop") await stopBooking(id);
    else if (action === "delete") await deleteBooking(id);
    else if (action === "resend-welcome") {
      const delivery = await deliverWelcome(id, publicOrigin(request));
      return Response.json({ ok: true, delivery });
    } else if (action === "mark-read") await markBookingRead(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking action failed";
    return Response.json({ error: message }, { status: message === "Booking not found." ? 404 : 409 });
  }
}
