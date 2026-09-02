import { GET as streamAdminBookingEvents } from "@/app/api/admin/booking-events/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) { return streamAdminBookingEvents(request); }
