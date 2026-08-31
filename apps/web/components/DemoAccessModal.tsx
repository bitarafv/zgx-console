"use client";
import { useCallback, useEffect, useState } from "react";
import type { PublicSlot } from "@/lib/bookings-types";

export function DemoAccessModal({ workloadId, workloadName, onClose }: { workloadId: string; workloadName: string; onClose: () => void }) {
  const [slots, setSlots] = useState<PublicSlot[]>([]), [name, setName] = useState(""), [email, setEmail] = useState(""), [start, setStart] = useState(""), [holdToken, setHoldToken] = useState(""), [holdExpiresAt, setHoldExpiresAt] = useState(""), [message, setMessage] = useState(""), [repeat, setRepeat] = useState(false), [busy, setBusy] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const normalizedName = name.trim().replace(/\s+/g, " ");
  const validName = normalizedName.length >= 2 && normalizedName.length <= 100 && !/[\u0000-\u001f\u007f]/.test(normalizedName);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 254;
  const validSlot = Boolean(start && holdToken && slots.some(slot => slot.start === start));
  const formValid = validName && validEmail && validSlot;

  const refresh = useCallback(async (token = holdToken) => {
    const response = await fetch(`/api/bookings/availability${token ? `?hold=${encodeURIComponent(token)}` : ""}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Availability request failed");
    setSlots((await response.json()).slots ?? []);
  }, [holdToken]);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh().catch(() => setMessage("Availability could not be loaded.")), 0);
    const interval = window.setInterval(() => {
      if (holdExpiresAt && Date.parse(holdExpiresAt) <= Date.now()) { setStart(""); setHoldToken(""); setHoldExpiresAt(""); setMessage("Your temporary hold expired. Choose a time again."); }
      else void refresh().catch(() => undefined);
    }, 5000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, [holdExpiresAt, refresh]);

  useEffect(() => () => { if (holdToken) void fetch("/api/bookings/holds", { method: "DELETE", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ token: holdToken }) }); }, [holdToken]);

  async function choose(nextStart: string) {
    setBusy(true); setMessage("");
    const response = await fetch("/api/bookings/holds", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ start: nextStart, token: holdToken }) });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setStart(""); setHoldToken(""); setHoldExpiresAt(""); setMessage(body.error ?? "That time is no longer available."); await refresh("").catch(() => undefined); return; }
    setStart(nextStart); setHoldToken(body.token); setHoldExpiresAt(body.expiresAt); await refresh(body.token).catch(() => undefined);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!formValid) return; setBusy(true); setMessage(""); setRepeat(false);
    const response = await fetch("/api/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, start, holdToken, timezone, workloadId, workloadName }) });
    const body = await response.json().catch(() => ({})); setBusy(false);
    if (!response.ok) { setMessage(body.error ?? "Request could not be submitted."); setRepeat(Boolean(body.repeat)); if (response.status === 409) { setStart(""); setHoldToken(""); setHoldExpiresAt(""); await refresh("").catch(() => undefined); } return; }
    setHoldToken(""); setHoldExpiresAt(""); setStart(""); await refresh("").catch(() => undefined);
    setMessage("Request submitted. The Admin will review your 15-minute window.");
  }
  async function notifyRepeat() { setBusy(true); const response = await fetch("/api/bookings/repeat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); setBusy(false); setMessage(response.ok ? "The Admin has been notified of your second-view request." : "The Admin notification could not be sent."); setRepeat(false); }

  return <div className="booking-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="booking-close" onClick={onClose} aria-label="Close">×</button><p className="eyebrow">LIVE MODEL ACCESS</p><h2 id="booking-title">Book a time</h2><p className="booking-value-proposition">The Admin must launch this application for live model access. Submit a request to book a 15-minute demo window with full interactive AI model access upon approval.</p><p>Times are shown in <strong>{timezone}</strong>.</p><div className="booking-application"><span>Application requested</span><strong>{workloadName}</strong></div><form onSubmit={submit}><label>Name<input type="text" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name"/></label><label>Email<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label><label>Available 15-minute window<select required value={start} disabled={busy} onChange={event => void choose(event.target.value)}><option value="" disabled>{slots.length ? "Choose one time" : "No slots currently available"}</option>{slots.map(slot => <option value={slot.start} key={slot.start}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(slot.start))}</option>)}</select></label>{holdToken && <small>Your selected time is held for five minutes.</small>}<button className="booking-primary" disabled={busy || !formValid}>{busy ? "Working…" : "Book a time"}</button></form>{message && <p className="booking-message" aria-live="polite">{repeat ? <>Contact Admin <button className="booking-link" onClick={() => void notifyRepeat()}>HERE</button> for a second view</> : message}</p>}</section></div>;
}
