import { availableSlots, readBookingData } from "@/lib/booking-store";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const data = await readBookingData();
  const token = new URL(request.url).searchParams.get("hold");
  if (token) data.holds = (data.holds ?? []).filter(hold => hold.token !== token);
  return Response.json({ slots: availableSlots(data) }, { headers: { "cache-control": "no-store" } });
}
