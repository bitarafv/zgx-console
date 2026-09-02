import "server-only";
import { randomUUID } from "node:crypto";
import net from "node:net";
import tls from "node:tls";
import type { DemoBooking } from "./bookings-types";
import { signBookingAccess, signBookingAction } from "./booking-signatures";

export type MailOptions = { to: string; subject: string; text: string; replyTo?: string; messageId?: string };
function header(value: string) { return value.replace(/[\r\n]/g, " ").trim(); }
async function command(socket: net.Socket, value?: string, accepted = [2, 3]) {
  if (value) socket.write(`${value}\r\n`);
  const reply = await new Promise<string>((resolve, reject) => {
    let result = "";
    const timer = setTimeout(() => reject(new Error("SMTP timeout")), 10_000);
    const onData = (chunk: Buffer) => { result += chunk.toString(); const lines = result.trimEnd().split(/\r?\n/); if (/^\d{3} /.test(lines.at(-1) ?? "")) { clearTimeout(timer); socket.off("data", onData); resolve(result); } };
    socket.on("data", onData); socket.once("error", reject);
  });
  if (!accepted.includes(Number(reply.slice(0, 1)))) throw new Error(`SMTP rejected command: ${reply.slice(0, 120)}`);
  return reply;
}

export async function sendMail(options: MailOptions) {
  const host = process.env.ZGX_SMTP_HOST, user = process.env.ZGX_SMTP_USER, password = process.env.ZGX_SMTP_PASSWORD;
  if (!host || !user || !password || !options.to) throw new Error("SMTP is not configured");
  const port = Number(process.env.ZGX_SMTP_PORT ?? 465);
  if (port !== 465) throw new Error("ZGX SMTP requires implicit TLS on port 465");
  const messageId = options.messageId ?? `<zgx-${randomUUID()}@${user.split("@")[1] ?? "localhost"}>`;
  const socket = tls.connect({ host, port, servername: host });
  await command(socket); await command(socket, "EHLO zgx-console"); await command(socket, "AUTH LOGIN");
  await command(socket, Buffer.from(user).toString("base64")); await command(socket, Buffer.from(password).toString("base64"));
  await command(socket, `MAIL FROM:<${user}>`); await command(socket, `RCPT TO:<${options.to}>`); await command(socket, "DATA");
  const headers = [`From: ZGX Console <${user}>`, `To: ${header(options.to)}`, `Subject: ${header(options.subject)}`, `Message-ID: ${header(messageId)}`, "Date: " + new Date().toUTCString(), "Auto-Submitted: auto-generated", "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit"];
  if (options.replyTo) headers.push(`Reply-To: ${header(options.replyTo)}`);
  await command(socket, `${headers.join("\r\n")}\r\n\r\n${options.text.replace(/^\./gm, "..")}\r\n.`);
  await command(socket, "QUIT"); socket.end(); return messageId;
}

export function publicOrigin(request: Request) {
  const configured = process.env.ZGX_PUBLIC_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return host ? `${protocol}://${host}` : new URL(request.url).origin;
}

export async function sendAdminBookingRequest(booking: DemoBooking, origin: string) {
  const to = process.env.ZGX_ADMIN_NOTIFICATION_EMAIL ?? process.env.ZGX_ADMIN_EMAILS?.split(",")[0]?.trim();
  if (!to) throw new Error("Admin notification email is not configured");
  const approve = `${origin}/api/bookings/action?token=${encodeURIComponent(signBookingAction(booking.id, "approve"))}`;
  const deny = `${origin}/api/bookings/action?token=${encodeURIComponent(signBookingAction(booking.id, "deny"))}`;
  return sendMail({ to, subject: `[ZGX:${booking.id}] Demo request: ${booking.workloadName}`, text: `A visitor requested a ZGX Nano demo window.\n\nName: ${booking.name}\nEmail: ${booking.email}\nApplication: ${booking.workloadName} (${booking.workloadId})\nStart: ${booking.start}\nVisitor timezone: ${booking.timezone}\n\nApprove: ${approve}\nDeny: ${deny}` });
}

function display(value: string, timeZone: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone }).format(new Date(value)); }
export function welcomeMail(booking: DemoBooking, origin: string): MailOptions {
  const link = `${origin}/booking/access?token=${encodeURIComponent(signBookingAccess(booking.id, Date.parse(booking.end) + 24 * 60 * 60_000))}`;
  const replyTo = process.env.ZGX_BOOKING_REPLY_TO ?? process.env.ZGX_SMTP_USER;
  return { to: booking.email, replyTo, subject: "Your ZGX demo access is confirmed", text: `Welcome ${booking.name},\n\nYour full interactive access to ${booking.workloadName}, powered by our live, fully loaded AI model, is confirmed.\n\nYour time: ${display(booking.start, booking.timezone)}–${new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone: booking.timezone }).format(new Date(booking.end))} (${booking.timezone})\nUTC: ${display(booking.start, "UTC")}–${new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone: "UTC" }).format(new Date(booking.end))}\nAccess duration: 15 minutes\n\nOpen your private timed access link:\n${link}\n\nBefore the window, the link will show the confirmed time. During the exact window, it will connect you to the active application. Reply directly to this email with any questions.\n\nZGX Console\nZGX booking reference: ${booking.id}` };
}
