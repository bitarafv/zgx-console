export type BookingStatus = "pending" | "approved" | "denied" | "cancelled";
export type BookingEmailStatus = "pending" | "sent" | "failed";
export type BookingMessage = {
  id: string;
  direction: "outbound" | "inbound";
  messageId: string;
  sender: string;
  recipient: string;
  subject: string;
  text: string;
  createdAt: string;
  readAt?: string;
};
export type WindowKind = "availability" | "blackout";

export type RecurrenceRule = {
  frequency: "daily" | "weekly";
  daysOfWeek: number[];
  until: string;
  timeZone: string;
};

export type AvailabilityWindow = {
  id: string;
  start: string;
  end: string;
  label?: string;
  recurrence?: RecurrenceRule;
};

export type BlackoutPeriod = AvailabilityWindow;

export type ScheduleOccurrence = {
  id: string;
  sourceId: string;
  kind: WindowKind;
  start: string;
  end: string;
  label?: string;
  recurring: boolean;
};

export type BookingHold = {
  token: string;
  start: string;
  end: string;
  blockedUntil: string;
  createdAt: string;
  expiresAt: string;
};

export type DemoBooking = {
  id: string;
  name: string;
  email: string;
  workloadId: string;
  workloadName: string;
  start: string;
  end: string;
  blockedUntil: string;
  timezone: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  launchedAt?: string;
  stoppedAt?: string;
  lifecycleError?: string;
  lifecycleAction?: "launching" | "stopping";
  approvalEmailStatus?: BookingEmailStatus;
  approvalEmailSentAt?: string;
  approvalEmailError?: string;
  approvalMessageId?: string;
  messages?: BookingMessage[];
};

export type BookingMailboxCursor = { uidValidity?: string; lastUid?: number; lastCheckedAt?: string; lastError?: string };

export type BookingData = {
  version: 1;
  availability: AvailabilityWindow[];
  blackouts: BlackoutPeriod[];
  bookings: DemoBooking[];
  holds: BookingHold[];
  mailbox?: BookingMailboxCursor;
};

export type SlotStatus = "available" | "held" | "pending" | "approved" | "blocked" | "cooldown" | "past" | "unavailable";
export type AdminSlot = PublicSlot & { status: SlotStatus; bookingId?: string; blackoutId?: string };
export type AdminBookingData = BookingData & { schedule: ScheduleOccurrence[]; slots: AdminSlot[] };
export type AdminBookingEvent = { revision: number; data: AdminBookingData };
export type PublicSlot = { start: string; end: string };
