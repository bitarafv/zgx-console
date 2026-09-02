import { adminSlots, readBookingData } from "@/lib/booking-store";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json({ slots: adminSlots(await readBookingData()) }, { headers: { "cache-control": "no-store" } }); }
