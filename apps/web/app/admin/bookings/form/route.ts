import { GET as getAdminBookingSnapshot, POST as mutateAdminBooking } from "@/app/api/admin/bookings/form/route";

export async function GET() { return getAdminBookingSnapshot(); }
export async function POST(request: Request) { return mutateAdminBooking(request); }
