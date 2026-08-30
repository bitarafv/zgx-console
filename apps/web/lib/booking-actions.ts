import "server-only";
import { randomUUID } from "node:crypto";
import { mutateBookingData, readBookingData } from "./booking-store";
import { bookingLifecycle } from "./booking-scheduler";
import { sendMail, welcomeMail } from "./booking-mail";

function required(data: Awaited<ReturnType<typeof readBookingData>>, id: string) {
  const item = data.bookings.find(value => value.id === id);
  if (!item) throw new Error("Booking not found.");
  return item;
}

export async function deliverWelcome(id: string, origin: string) {
  const booking = await mutateBookingData(data => { const item = required(data, id); if (item.status !== "approved") throw new Error("Only approved bookings can receive a welcome email."); item.approvalEmailStatus = "pending"; item.approvalEmailError = undefined; item.updatedAt = new Date().toISOString(); return structuredClone(item); });
  const mail = welcomeMail(booking, origin);
  try {
    const messageId = await sendMail(mail);
    await mutateBookingData(data => { const item = required(data, id); const now = new Date().toISOString(); item.approvalEmailStatus = "sent"; item.approvalEmailSentAt = now; item.approvalEmailError = undefined; item.approvalMessageId = messageId; item.messages ??= []; item.messages.push({ id: randomUUID(), direction: "outbound", messageId, sender: process.env.ZGX_SMTP_USER ?? "ZGX Console", recipient: item.email, subject: mail.subject, text: mail.text, createdAt: now, readAt: now }); item.updatedAt = now; });
    return { sent: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Welcome email delivery failed";
    await mutateBookingData(data => { const item = required(data, id); item.approvalEmailStatus = "failed"; item.approvalEmailError = message; item.updatedAt = new Date().toISOString(); });
    return { sent: false as const, error: message };
  }
}

export async function approveBooking(id: string, origin: string) {
  await mutateBookingData(data => { const item = required(data, id); if (item.status !== "pending") throw new Error("Only pending bookings can be approved."); item.status = "approved"; item.updatedAt = new Date().toISOString(); });
  return deliverWelcome(id, origin);
}

export async function denyBooking(id: string) {
  await mutateBookingData(data => { const item = required(data, id); if (item.launchedAt && !item.stoppedAt) throw new Error("Stop the running workload before denying this booking."); if (item.status !== "pending" && item.status !== "approved") throw new Error("This booking is already resolved."); item.status = "denied"; item.updatedAt = new Date().toISOString(); });
}

export async function launchBooking(id: string) {
  const booking = await readBookingData().then(data => structuredClone(required(data, id)));
  if (booking.status !== "approved") throw new Error("Only approved bookings can be launched.");
  if (booking.launchedAt || booking.stoppedAt) throw new Error("This booking was already launched or stopped.");
  await bookingLifecycle(booking.workloadId, "launch");
  await mutateBookingData(data => { const item = required(data, id); if (item.status !== "approved" || item.launchedAt || item.stoppedAt) throw new Error("The booking lifecycle changed before launch completed."); item.launchedAt = new Date().toISOString(); item.lifecycleError = undefined; item.updatedAt = new Date().toISOString(); });
}

export async function stopBooking(id: string) {
  const booking = await readBookingData().then(data => structuredClone(required(data, id)));
  if (!booking.launchedAt) throw new Error("Launch this booking before stopping it.");
  if (booking.stoppedAt) throw new Error("This booking is already stopped.");
  await bookingLifecycle(booking.workloadId, "stop");
  await mutateBookingData(data => { const item = required(data, id); if (!item.launchedAt || item.stoppedAt) throw new Error("The booking lifecycle changed before stop completed."); item.stoppedAt = new Date().toISOString(); item.lifecycleError = undefined; item.updatedAt = new Date().toISOString(); });
}

export async function deleteBooking(id: string) {
  const booking = await readBookingData().then(data => structuredClone(required(data, id)));
  if (booking.launchedAt && !booking.stoppedAt) await stopBooking(id);
  await mutateBookingData(data => { required(data, id); data.bookings = data.bookings.filter(item => item.id !== id); });
}

export async function markBookingRead(id: string) {
  await mutateBookingData(data => { const item = required(data, id); const now = new Date().toISOString(); for (const message of item.messages ?? []) if (message.direction === "inbound" && !message.readAt) message.readAt = now; item.updatedAt = now; });
}
