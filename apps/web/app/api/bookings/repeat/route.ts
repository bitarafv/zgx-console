import { normalizeEmail, readBookingData } from "@/lib/booking-store";
import { sendMail } from "@/lib/booking-mail";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    if (!email) return Response.json({ error: "Enter a valid email." }, { status: 400 });
    const data = await readBookingData();
    if (!data.bookings.some(item => item.email === email && Date.parse(item.createdAt) > Date.now() - 24 * 60 * 60_000)) return Response.json({ error: "No recent request was found." }, { status: 404 });
    const to = process.env.ZGX_ADMIN_NOTIFICATION_EMAIL ?? process.env.ZGX_ADMIN_EMAILS?.split(",")[0]?.trim();
    if (!to) throw new Error("Admin notification email is not configured");
    await sendMail({ to, subject: "Repeat demo access request", text: `${email} requested a second demo view within 24 hours. Please contact the visitor directly.` });
    return Response.json({ notified: true });
  } catch { return Response.json({ error: "Admin notification could not be sent." }, { status: 503 }); }
}
