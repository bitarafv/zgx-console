import { approveBooking, denyBooking } from "@/lib/booking-actions";
import { publicOrigin } from "@/lib/booking-mail";
import { verifyBookingAction } from "@/lib/booking-signatures";

export async function GET(request: Request) {
  const action = verifyBookingAction(new URL(request.url).searchParams.get("token") ?? "");
  if (!action) return new Response("This booking action link is invalid or expired.", { status: 400 });
  try {
    if (action.action === "approve") {
      const delivery = await approveBooking(action.id, publicOrigin(request));
      return new Response(delivery.sent ? "Request approved and welcome email sent. You can close this window." : `Request approved, but welcome delivery failed: ${delivery.error}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    await denyBooking(action.id);
    return new Response("Request denied. You can close this window.", { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (error) { return new Response(error instanceof Error ? error.message : "This request could not be updated.", { status: 409 }); }
}
