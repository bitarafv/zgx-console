export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV !== "test") {
    const { startBookingScheduler } = await import("./lib/booking-scheduler");
    startBookingScheduler();
    const { startBookingReplyPoller } = await import("./lib/booking-replies");
    startBookingReplyPoller();
  }
}
