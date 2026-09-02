import { randomUUID } from "node:crypto";
import type { AdminSlot, SlotStatus, AvailabilityWindow, BlackoutPeriod, BookingData, PublicSlot, RecurrenceRule, ScheduleOccurrence, WindowKind } from "./bookings-types";

const DAY = 24 * 60 * 60_000;
const MAX_WINDOW = 31 * DAY;
const MAX_RECURRENCE = 366 * DAY;
const SLOT_BLOCK_PREFIX = "slot-block:";

export function scheduleOccurrences(data: BookingData, rangeStart = Date.now(), rangeEnd = rangeStart + 56 * DAY): ScheduleOccurrence[] {
  const occurrences: ScheduleOccurrence[] = [];
  for (const [kind, windows] of [["availability", data.availability], ["blackout", data.blackouts]] as const) {
    for (const window of windows) for (const occurrence of expandWindow(window, rangeStart, rangeEnd)) occurrences.push({ id: `${window.id}:${occurrence.start}`, sourceId: window.id, kind, start: occurrence.start, end: occurrence.end, label: window.label, recurring: Boolean(window.recurrence) });
  }
  return occurrences.sort((left, right) => left.start.localeCompare(right.start) || left.kind.localeCompare(right.kind));
}

export function availableSlots(data: BookingData, now = Date.now(), horizon = now + 90 * DAY): PublicSlot[] {
  const busy = [
    ...data.bookings.filter(item => item.status === "pending" || item.status === "approved").map(item => [Date.parse(item.start), Date.parse(item.blockedUntil)] as const),
    ...(data.holds ?? []).filter(item => Date.parse(item.expiresAt) > now).map(item => [Date.parse(item.start), Date.parse(item.blockedUntil)] as const),
  ];
  const blackouts = data.blackouts.flatMap(item => expandWindow(item, now, horizon)).map(item => [Date.parse(item.start), Date.parse(item.end)] as const);
  const slots = new Map<string, PublicSlot>();
  for (const window of data.availability.flatMap(item => expandWindow(item, now, horizon))) {
    const end = Date.parse(window.end);
    for (let start = Date.parse(window.start); start + 15 * 60_000 <= end; start += 15 * 60_000) {
      const visitEnd = start + 15 * 60_000, blockedUntil = start + 30 * 60_000;
      if (start < now || blackouts.some(([left, right]) => start < right && visitEnd > left) || busy.some(([left, right]) => start < right && blockedUntil > left)) continue;
      const iso = new Date(start).toISOString();
      slots.set(iso, { start: iso, end: new Date(start + 15 * 60_000).toISOString() });
    }
  }
  return [...slots.values()].sort((left, right) => left.start.localeCompare(right.start));
}

export function adminSlots(data: BookingData, now = Date.now(), horizon = now + 56 * DAY): AdminSlot[] {
  const available = new Set(availableSlots(data, now, horizon).map(slot => slot.start));
  const slots = new Map<string, AdminSlot>();
  const activeHolds = (data.holds ?? []).filter(hold => Date.parse(hold.expiresAt) > now);
  const blackouts = data.blackouts.flatMap(item => expandWindow(item, now - DAY, horizon).map(occurrence => ({ ...occurrence, source: item })));
  for (const window of data.availability.flatMap(item => expandWindow(item, now - DAY, horizon))) {
    for (let cursor = Date.parse(window.start); cursor + 15 * 60_000 <= Date.parse(window.end); cursor += 15 * 60_000) {
      const start = new Date(cursor).toISOString(), end = new Date(cursor + 15 * 60_000).toISOString();
      const booking = data.bookings.find(item => (item.status === "pending" || item.status === "approved") && item.start === start);
      const bookingCooldown = data.bookings.find(item => (item.status === "pending" || item.status === "approved") && Date.parse(item.start) + 15 * 60_000 === cursor);
      const hold = activeHolds.find(item => item.start === start), holdCooldown = activeHolds.find(item => Date.parse(item.start) + 15 * 60_000 === cursor);
      const blackout = blackouts.find(item => cursor < Date.parse(item.end) && cursor + 15 * 60_000 > Date.parse(item.start));
      const status: SlotStatus = cursor < now ? "past" : booking ? (booking.status === "approved" ? "approved" : "pending") : bookingCooldown || holdCooldown ? "cooldown" : hold ? "held" : blackout ? "blocked" : available.has(start) ? "available" : "unavailable";
      slots.set(start, { start, end, status, ...(booking ? { bookingId: booking.id } : {}), ...(blackout && isSlotBlock(blackout.source) ? { blackoutId: blackout.source.id } : {}) });
    }
  }
  return [...slots.values()].sort((left, right) => left.start.localeCompare(right.start));
}

export function validWindow(value: unknown): value is Pick<AvailabilityWindow, "start" | "end"> & { label?: string; recurrence?: RecurrenceRule } {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const start = typeof item.start === "string" ? Date.parse(item.start) : NaN;
  const end = typeof item.end === "string" ? Date.parse(item.end) : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > MAX_WINDOW) return false;
  if (item.recurrence === undefined || item.recurrence === null) return true;
  return validRecurrence(item.recurrence, start);
}

function validRecurrence(value: unknown, start: number): value is RecurrenceRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as Record<string, unknown>;
  const until = typeof rule.until === "string" ? Date.parse(rule.until) : NaN;
  const days = Array.isArray(rule.daysOfWeek) ? rule.daysOfWeek : [];
  const zone = typeof rule.timeZone === "string" ? rule.timeZone : "";
  return (rule.frequency === "daily" || rule.frequency === "weekly") && days.length > 0 && days.length <= 7 && days.every(day => Number.isInteger(day) && Number(day) >= 0 && Number(day) <= 6) && Number.isFinite(until) && until >= start && until - start <= MAX_RECURRENCE && isTimeZone(zone);
}

export function newWindow(value: Pick<AvailabilityWindow, "start" | "end"> & { label?: string; recurrence?: RecurrenceRule }): AvailabilityWindow {
  return { id: randomUUID(), start: new Date(value.start).toISOString(), end: new Date(value.end).toISOString(), ...(value.label?.trim() ? { label: value.label.trim().slice(0, 80) } : {}), ...(value.recurrence ? { recurrence: normalizeRecurrence(value.recurrence) } : {}) };
}

export function updateWindow(item: AvailabilityWindow, value: Pick<AvailabilityWindow, "start" | "end"> & { label?: string; recurrence?: RecurrenceRule }) {
  item.start = new Date(value.start).toISOString(); item.end = new Date(value.end).toISOString();
  item.label = value.label?.trim() ? value.label.trim().slice(0, 80) : undefined;
  item.recurrence = value.recurrence ? normalizeRecurrence(value.recurrence) : undefined;
}

export function newSlotBlock(start: string): BlackoutPeriod {
  const time = Date.parse(start);
  if (!Number.isFinite(time)) throw new Error("Invalid slot start.");
  return { id: `${SLOT_BLOCK_PREFIX}${randomUUID()}`, start: new Date(time).toISOString(), end: new Date(time + 15 * 60_000).toISOString(), label: "Admin blocked slot" };
}
export function isSlotBlock(item: AvailabilityWindow) { return item.id.startsWith(SLOT_BLOCK_PREFIX) && !item.recurrence && Date.parse(item.end) - Date.parse(item.start) === 15 * 60_000; }

export function findWindow(data: BookingData, id: string, kind: WindowKind) { return (kind === "availability" ? data.availability : data.blackouts).find(item => item.id === id); }
function normalizeRecurrence(rule: RecurrenceRule): RecurrenceRule { return { frequency: rule.frequency, daysOfWeek: [...new Set(rule.daysOfWeek)].sort(), until: new Date(rule.until).toISOString(), timeZone: rule.timeZone }; }

function expandWindow(window: AvailabilityWindow, rangeStart: number, rangeEnd: number) {
  const originalStart = Date.parse(window.start), originalEnd = Date.parse(window.end);
  if (!window.recurrence) return originalEnd > rangeStart && originalStart < rangeEnd ? [{ start: window.start, end: window.end }] : [];
  const rule = window.recurrence, duration = originalEnd - originalStart, wall = zonedParts(new Date(originalStart), rule.timeZone);
  const finalStart = Math.min(Date.parse(rule.until), rangeEnd);
  const firstDate = Date.UTC(wall.year, wall.month - 1, wall.day);
  const results: Array<{ start: string; end: string }> = [];
  for (let date = firstDate; date <= finalStart + DAY; date += DAY) {
    const cursor = new Date(date);
    if (!rule.daysOfWeek.includes(cursor.getUTCDay())) continue;
    const start = zonedDateTimeToUtc(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, cursor.getUTCDate(), wall.hour, wall.minute, rule.timeZone);
    if (start < originalStart || start > Date.parse(rule.until) || start + duration <= rangeStart || start >= rangeEnd) continue;
    results.push({ start: new Date(start).toISOString(), end: new Date(start + duration).toISOString() });
  }
  return results;
}
function zonedParts(date: Date, timeZone: string) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(date); const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value); return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") }; }
function zonedDateTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) { const desired = Date.UTC(year, month - 1, day, hour, minute); let candidate = desired; for (let attempt = 0; attempt < 3; attempt += 1) { const actual = zonedParts(new Date(candidate), timeZone); candidate += desired - Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute); } return candidate; }
function isTimeZone(value: string) { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }
