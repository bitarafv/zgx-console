import "server-only";
import { randomUUID } from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { mutateBookingData, readBookingData } from "./booking-store";
import { matchesBookingReply } from "./booking-reply-match";

let polling = false;
function configured() {
  const user = process.env.ZGX_IMAP_USER ?? process.env.ZGX_SMTP_USER;
  const pass = process.env.ZGX_IMAP_PASSWORD ?? process.env.ZGX_SMTP_PASSWORD;
  return user && pass ? { user, pass, host: process.env.ZGX_IMAP_HOST ?? "mail.privateemail.com", port: Number(process.env.ZGX_IMAP_PORT ?? 993) } : null;
}
function addresses(value: Awaited<ReturnType<typeof simpleParser>>["from"]) { return value?.value.map(item => item.address?.trim().toLowerCase()).filter((item): item is string => Boolean(item)) ?? []; }
function references(value: string[] | string | undefined) { return Array.isArray(value) ? value : value ? [value] : []; }
function cleanText(value: string | undefined) { return (value ?? "").replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim().slice(0, 10_000); }

export async function pollBookingReplies() {
  if (polling) return;
  const config = configured(); if (!config) return;
  polling = true;
  const client = new ImapFlow({ host: config.host, port: config.port, secure: true, auth: { user: config.user, pass: config.pass }, logger: false });
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX", { readOnly: true });
    const data = await readBookingData(), validity = mailbox.uidValidity.toString();
    const lastUid = data.mailbox?.uidValidity === validity ? data.mailbox.lastUid ?? 0 : 0;
    let highest = lastUid;
    for await (const message of client.fetch(`${lastUid + 1}:*`, { uid: true, source: true }, { uid: true })) {
      highest = Math.max(highest, message.uid);
      if (!message.source || message.source.length > 1_000_000) continue;
      const parsed = await simpleParser(message.source), messageId = parsed.messageId?.trim();
      if (!messageId) continue;
      const senders = addresses(parsed.from), refs = [...references(parsed.references), ...(parsed.inReplyTo ? [parsed.inReplyTo] : [])];
      const subject = parsed.subject ?? "(no subject)", text = cleanText(parsed.text);
      if (!text) continue;
      await mutateBookingData(store => {
        const booking = store.bookings.find(item => matchesBookingReply(item, senders, refs, subject, text));
        if (!booking) return;
        booking.messages ??= [];
        if (booking.messages.some(item => item.messageId === messageId)) return;
        booking.messages.push({ id: randomUUID(), direction: "inbound", messageId, sender: booking.email, recipient: config.user, subject: subject.slice(0, 300), text, createdAt: (parsed.date ?? new Date()).toISOString() });
        booking.updatedAt = new Date().toISOString();
      });
    }
    await mutateBookingData(store => { store.mailbox = { uidValidity: validity, lastUid: highest, lastCheckedAt: new Date().toISOString() }; });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IMAP synchronization failed";
    console.error("Booking reply synchronization failed", error);
    try { await mutateBookingData(store => { if (store.mailbox?.lastError === message) return; store.mailbox = { ...store.mailbox, lastCheckedAt: new Date().toISOString(), lastError: message }; }); } catch {}
  } finally { try { await client.logout(); } catch {} polling = false; }
}

export function startBookingReplyPoller() {
  if (!configured()) return;
  void pollBookingReplies();
  return setInterval(() => void pollBookingReplies(), 60_000);
}
