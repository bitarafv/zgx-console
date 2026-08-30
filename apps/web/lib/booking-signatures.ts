import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.ZGX_BOOKING_SIGNING_SECRET ?? process.env.ZGX_ADMIN_BRIDGE_SECRET ?? "";
  if (value.length < 24) throw new Error("ZGX_BOOKING_SIGNING_SECRET must contain at least 24 characters");
  return value;
}

function sign(value: object) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}

function verify<T>(token: string): T | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const supplied = Buffer.from(signature, "base64url");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch { return null; }
}

export function signBookingAction(id: string, action: "approve" | "deny", expires = Date.now() + 48 * 60 * 60_000) {
  return sign({ purpose: "booking-action", id, action, expires });
}

export function verifyBookingAction(token: string) {
  const value = verify<{ purpose: string; id: string; action: "approve" | "deny"; expires: number }>(token);
  return value?.purpose === "booking-action" && value.expires >= Date.now() && ["approve", "deny"].includes(value.action) ? value : null;
}

export function signBookingAccess(id: string, expires: number) {
  return sign({ purpose: "booking-access", id, expires });
}

export function verifyBookingAccess(token: string) {
  const value = verify<{ purpose: string; id: string; expires: number }>(token);
  return value?.purpose === "booking-access" && value.expires >= Date.now() ? value : null;
}
