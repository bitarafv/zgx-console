export type ReplyBookingIdentity = { id: string; email: string; approvalMessageId?: string };

export function matchesBookingReply(booking: ReplyBookingIdentity, senders: string[], references: string[], subject: string, text: string) {
  if (!senders.includes(booking.email.toLowerCase())) return false;
  if (booking.approvalMessageId && references.includes(booking.approvalMessageId)) return true;
  if (subject.includes(`[ZGX:${booking.id}]`)) return true;
  return text.includes(`ZGX booking reference: ${booking.id}`);
}
