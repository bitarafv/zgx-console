import { readBookingData } from "@/lib/booking-store";
import { verifyBookingAccess } from "@/lib/booking-signatures";
import { proxyRead, runtimeMode } from "@/lib/runtime";
import { workloads as mockWorkloads } from "@/lib/mock-data";
import type { Workload } from "@/lib/types";

function page(title: string, message: string, status = 200) {
  const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(title)}</title><style>body{font:16px system-ui;background:#f7f8fa;color:#19212b;margin:0;display:grid;place-items:center;min-height:100vh}.card{max-width:42rem;background:white;border:1px solid #dce1e8;border-radius:18px;padding:2rem;box-shadow:0 16px 50px #18212b18}h1{margin-top:0}</style></head><body><main class="card"><h1>${escape(title)}</h1><p>${escape(message)}</p></main></body></html>`, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

async function workloads(): Promise<Workload[]> {
  if (runtimeMode() === "mock") return mockWorkloads;
  const response = await proxyRead("/api/workloads");
  if (!response.ok) return [];
  const value = await response.json() as Workload[] | { workloads?: Workload[] };
  return Array.isArray(value) ? value : value.workloads ?? [];
}

export async function GET(request: Request) {
  const access = verifyBookingAccess(new URL(request.url).searchParams.get("token") ?? "");
  if (!access) return page("Invalid or expired link", "This access link is invalid or has expired.", 400);
  const booking = (await readBookingData()).bookings.find(item => item.id === access.id);
  if (!booking) return page("Booking not found", "This booking no longer exists.", 404);
  if (booking.status === "denied" || booking.status === "cancelled") return page("Access denied", "This booking is no longer active.", 403);
  if (booking.status !== "approved") return page("Awaiting approval", "This request has not been approved yet.", 403);
  if (booking.stoppedAt) return page("Session ended", "This demo session has been stopped.", 410);
  const now = Date.now(), start = Date.parse(booking.start), end = Date.parse(booking.end);
  if (now < start) return page("Your demo is confirmed", `Access opens at ${new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone: booking.timezone }).format(new Date(start))} (${booking.timezone}).`);
  if (now >= end) return page("Access window ended", "This 15-minute access window has ended.", 410);
  const workload = (await workloads()).find(item => item.id === booking.workloadId);
  if (!workload?.active || workload.runtime_status?.ready === false) return page("Application is getting ready", "The workload is not ready yet. Please retry this link in a moment.", 503);
  const endpoint = workload.external_browser_url ?? workload.browser_url;
  if (!endpoint || endpoint === "#") return page("Application unavailable", "No public application endpoint is currently available for this workload.", 503);
  let destination: URL;
  try { destination = new URL(endpoint); } catch { return page("Application unavailable", "The application endpoint is not valid.", 503); }
  if (destination.protocol !== "https:" && destination.hostname !== "localhost" && destination.hostname !== "127.0.0.1") return page("Application unavailable", "The application endpoint is not secure.", 503);
  return Response.redirect(destination, 302);
}
