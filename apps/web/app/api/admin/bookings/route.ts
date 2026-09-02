import { isAdmin } from "@/lib/runtime";
import { findWindow, mutateBookingData, newWindow, readBookingData, scheduleOccurrences, adminSlots, updateWindow, validWindow } from "@/lib/booking-store";
import type { WindowKind } from "@/lib/bookings-types";

export const dynamic = "force-dynamic";
const kinds = new Set<WindowKind>(["availability", "blackout"]);

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401, headers: { "cache-control": "no-store" } });
  const data = await readBookingData();
  return Response.json({ ...data, schedule: scheduleOccurrences(data), slots: adminSlots(data) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401, headers: { "cache-control": "no-store" } });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const kind = body?.kind as WindowKind;
  if (!body || !kinds.has(kind) || !validWindow(body)) return Response.json({ error: "Invalid time window or recurrence rule" }, { status: 400 });
  const item = newWindow(body);
  try {
    await mutateBookingData(data => { (kind === "availability" ? data.availability : data.blackouts).push(item); });
    return Response.json(item, { status: 201 });
  } catch (error) {
    console.error("Unable to persist booking window", error);
    return Response.json({ error: "Schedule storage is unavailable. Check ZGX_BOOKING_DATA_PATH permissions." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401, headers: { "cache-control": "no-store" } });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = body?.id, kind = body?.kind as WindowKind, sourceKind = (body?.sourceKind ?? kind) as WindowKind;
  if (typeof id !== "string" || !kinds.has(kind) || !kinds.has(sourceKind) || !validWindow(body)) return Response.json({ error: "Invalid time window or recurrence rule" }, { status: 400 });
  const updated = await mutateBookingData(data => {
    const item = findWindow(data, id, sourceKind);
    if (!item) return null;
    updateWindow(item, body);
    if (kind !== sourceKind) {
      const source = sourceKind === "availability" ? data.availability : data.blackouts;
      const destination = kind === "availability" ? data.availability : data.blackouts;
      source.splice(source.indexOf(item), 1);
      destination.push(item);
    }
    return item;
  });
  return updated ? Response.json(updated) : Response.json({ error: "Window not found" }, { status: 404 });
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Admin session required" }, { status: 401, headers: { "cache-control": "no-store" } });
  const { id, kind } = await request.json().catch(() => ({})) as { id?: string; kind?: WindowKind };
  if (!id || !kind || !kinds.has(kind)) return Response.json({ error: "Invalid item" }, { status: 400 });
  const removed = await mutateBookingData(data => {
    const key = kind === "availability" ? "availability" : "blackouts";
    const before = data[key].length;
    data[key] = data[key].filter(item => item.id !== id);
    return data[key].length < before;
  });
  return removed ? Response.json({ removed: true }) : Response.json({ error: "Window not found" }, { status: 404 });
}
