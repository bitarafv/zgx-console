import { workloads } from "@/lib/mock-data";
import { proxyRead, runtimeMode } from "@/lib/runtime";
import { readBookingData } from "@/lib/booking-store";
import { schedulerActivity } from "@/lib/scheduler-activity";
import type { Workload } from "@/lib/types";

export async function GET() {
  const response = runtimeMode() === "mock" ? Response.json(workloads) : await proxyRead("/api/workloads");
  if (!response.ok) return response;
  const items = await response.json() as Workload[];
  const bookings = (await readBookingData()).bookings;
  return Response.json(items.map(item => ({ ...item, scheduler_activity: schedulerActivity(item, bookings) })), { headers: { "cache-control": "no-store" } });
}

