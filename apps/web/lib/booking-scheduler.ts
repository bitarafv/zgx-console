import "server-only";
import { mutateBookingData, readBookingData } from "./booking-store";
import { runtimeMode } from "./runtime";

function bridgeOrigin() { return process.env.ZGX_NODE_BRIDGE_ORIGIN ?? process.env.ZGX_NODE_ORIGIN ?? "http://127.0.0.1:60372"; }
export async function bookingLifecycle(workloadId: string, action: "launch" | "stop") {
  if (runtimeMode() === "mock") return;
  const path = action === "launch" ? "/api/transitions" : `/api/workloads/${workloadId}/stop`;
  const response = await fetch(new URL(path, bridgeOrigin()), {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(15_000),
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.ZGX_BRIDGE_TOKEN ?? ""}`, "x-zgx-admin-secret": process.env.ZGX_ADMIN_BRIDGE_SECRET ?? "" },
    body: JSON.stringify(action === "launch" ? { target_workload: workloadId } : {}),
  });
  if (!response.ok) throw new Error(`Lifecycle ${action} failed (${response.status})`);
}

let running = false;
export async function runBookingScheduler() {
  if (running) return;
  running = true;
  try {
    const now = Date.now();
    const bookings = (await readBookingData()).bookings.filter(item => item.status === "approved");
    for (const booking of bookings) {
      const start = Date.parse(booking.start);
      const action = !booking.launchedAt && now >= start - 15 * 60_000 && now < start + 30 * 60_000 ? "launch" : booking.launchedAt && !booking.stoppedAt && now >= start + 30 * 60_000 ? "stop" : null;
      if (!action) continue;
      try {
        await mutateBookingData(data => { const item = data.bookings.find(value => value.id === booking.id); if (item) { item.lifecycleAction = action === "launch" ? "launching" : "stopping"; item.updatedAt = new Date().toISOString(); } });
        await bookingLifecycle(booking.workloadId, action);
        await mutateBookingData(data => { const item = data.bookings.find(value => value.id === booking.id); if (item) { if (action === "launch") item.launchedAt = new Date().toISOString(); else item.stoppedAt = new Date().toISOString(); item.lifecycleAction = undefined; item.lifecycleError = undefined; item.updatedAt = new Date().toISOString(); } });
      } catch (error) {
        await mutateBookingData(data => { const item = data.bookings.find(value => value.id === booking.id); if (item) { item.lifecycleAction = undefined; item.lifecycleError = error instanceof Error ? error.message : "Lifecycle action failed"; item.updatedAt = new Date().toISOString(); } });
      }
    }
  } finally { running = false; }
}

export function startBookingScheduler() {
  void runBookingScheduler();
  return setInterval(() => void runBookingScheduler(), 30_000);
}
