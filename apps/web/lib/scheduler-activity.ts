import type { Workload } from "./types";
import type { DemoBooking } from "./bookings-types";

export function schedulerActivity(workload: Workload, bookings: DemoBooking[]) {
  const booking = bookings.find(item => item.status === "approved" && item.workloadId === workload.id && (item.lifecycleAction || (item.launchedAt && !item.stoppedAt)));
  if (!booking) return null;
  if (booking.lifecycleAction === "stopping") return { state: "cleaning_up" as const };
  if (booking.lifecycleAction === "launching") return { state: "loading" as const };
  return { state: workload.active && workload.runtime_status?.ready === true ? "running" as const : "loading" as const };
}
