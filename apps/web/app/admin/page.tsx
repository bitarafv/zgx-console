import { ConsoleShell } from "@/components/ConsoleShell";
import { isAdmin } from "@/lib/runtime";
import { adminSlots, readBookingData, scheduleOccurrences } from "@/lib/booking-store";
export const dynamic = "force-dynamic";
export default async function AdminPage(){ const adminView = await isAdmin(); const data = adminView ? await readBookingData() : null; const adminBookingData = data ? { ...data, schedule: scheduleOccurrences(data), slots: adminSlots(data) } : undefined; return <ConsoleShell initialTab="node" adminView={adminView} adminBookingData={adminBookingData}/> }
