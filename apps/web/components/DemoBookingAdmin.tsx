"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AdminBookingData, AdminBookingEvent, AvailabilityWindow, DemoBooking, RecurrenceRule } from "@/lib/bookings-types";
import { bookingAdminView } from "@/lib/booking-admin-view";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type RecurrenceMode = "none" | "daily" | "weekly" | "custom";
type Editor = { id?: string; start: string; end: string; recurrence: RecurrenceMode; until: string; days: number[] };
const initialEditor = (): Editor => ({ start: "", end: "", recurrence: "none", until: "", days: [] });
const ADMIN_SCROLL_KEY = "zgx-admin-control-scroll-y";

export function DemoBookingAdmin({ initialData }: { initialData?: AdminBookingData }) {
  const [data, setData] = useState<AdminBookingData | null>(initialData ?? null), [editor, setEditor] = useState<Editor>(initialEditor), [editorOpen, setEditorOpen] = useState(false), [bookingView, setBookingView] = useState<"upcoming" | "history">("upcoming"), [message, setMessage] = useState(""), [liveConnected, setLiveConnected] = useState(true);
  const revision = useRef(-1);
  const editorIdRef = useRef<string | undefined>(undefined);
  const [scheduleNow, setScheduleNow] = useState(() => Date.now());
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  useEffect(() => { const timer = window.setInterval(() => setScheduleNow(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  useLayoutEffect(() => {
    const raw = window.sessionStorage.getItem(ADMIN_SCROLL_KEY);
    if (raw === null) { window.history.scrollRestoration = "auto"; return; }
    window.sessionStorage.removeItem(ADMIN_SCROLL_KEY);
    window.history.scrollRestoration = "manual";
    let snapshot: AdminScrollSnapshot;
    try { snapshot = JSON.parse(raw) as AdminScrollSnapshot; } catch { window.history.scrollRestoration = "auto"; return; }
    const root = document.documentElement, previousBehavior = root.style.getPropertyValue("scroll-behavior"), previousPriority = root.style.getPropertyPriority("scroll-behavior");
    root.style.setProperty("scroll-behavior", "auto", "important");
    const restore = () => {
      document.querySelectorAll<HTMLDetailsElement>("[data-admin-details]").forEach(item => { item.open = snapshot.openDetails.includes(item.dataset.adminDetails ?? ""); });
      document.querySelectorAll<HTMLElement>("[data-admin-scroll]").forEach(item => { const requested = snapshot.panels[item.dataset.adminScroll ?? ""] ?? 0, maximum = Math.max(0, item.scrollHeight - item.clientHeight); item.scrollTop = Math.min(Math.max(0, requested), maximum); });
      const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.min(Math.max(0, snapshot.windowY), maximum));
    };
    restore();
    const first = window.requestAnimationFrame(() => { restore(); window.requestAnimationFrame(() => { restore(); if (previousBehavior) root.style.setProperty("scroll-behavior", previousBehavior, previousPriority); else root.style.removeProperty("scroll-behavior"); window.history.scrollRestoration = "auto"; }); });
    return () => window.cancelAnimationFrame(first);
  }, []);
  const load = useCallback(async () => { const response = await fetch("/admin/bookings/form", { cache: "no-store", credentials: "same-origin", headers: { "X-Requested-With": "XMLHttpRequest" } }); if (response.ok) setData(await response.json() as AdminBookingData); }, []);
  useEffect(() => {
    const messageTimer = window.setTimeout(() => {
      const query = new URLSearchParams(window.location.search);
      setMessage(query.get("bookingError") ?? (query.has("bookingUpdated") ? "Schedule updated." : ""));
    }, 0);
    let failures = 0, fallback: number | undefined;
    const stream = new EventSource("/admin/booking-events");
    stream.onopen = () => { failures = 0; setLiveConnected(true); if (fallback) { window.clearInterval(fallback); fallback = undefined; } };
    stream.onmessage = event => { const update = JSON.parse(event.data) as AdminBookingEvent; if (update.revision <= revision.current) return; revision.current = update.revision; if (editorIdRef.current && !update.data.availability.some(item => item.id === editorIdRef.current)) { editorIdRef.current = undefined; setEditor(initialEditor()); setEditorOpen(false); } setData(update.data); setLiveConnected(true); };
    stream.onerror = () => { failures += 1; setLiveConnected(false); if (failures >= 3 && !fallback) fallback = window.setInterval(() => { if (!document.hidden) void load(); }, 15_000); };
    return () => { window.clearTimeout(messageTimer); stream.close(); if (fallback) window.clearInterval(fallback); };
  }, [load]);
  const payload = useMemo(() => editorPayload(editor, timezone), [editor, timezone]);
  const windows = useMemo(() => new Map((data?.availability ?? []).map(item => [item.id, item])), [data]);
  const format = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  function openEditor() { editorIdRef.current = undefined; setEditor(initialEditor()); setEditorOpen(true); window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".booking-window-form input[type=datetime-local]")?.focus()); }
  function closeEditor() { editorIdRef.current = undefined; setEditor(initialEditor()); setEditorOpen(false); }
  function edit(item: AvailabilityWindow) { editorIdRef.current = item.id; const mode = recurrenceMode(item); setEditor({ id: item.id, start: toLocalInput(item.start), end: toLocalInput(item.end), recurrence: mode, until: item.recurrence ? toLocalDate(item.recurrence.until) : "", days: item.recurrence?.daysOfWeek ?? [] }); setEditorOpen(true); window.requestAnimationFrame(() => { const form = document.querySelector(".booking-window-form"); form?.scrollIntoView({ behavior: "smooth", block: "center" }); form?.querySelector<HTMLInputElement>("input[type=datetime-local]")?.focus(); }); }

  const { upcoming, history, availableSlots, blockedSlots, pendingCount, approvedCount } = bookingAdminView(data, scheduleNow);

  return <section className="booking-admin" onSubmit={event => { if (!event.defaultPrevented) saveAdminScrollSnapshot(); }}>
    <div className="booking-control-head"><div><p className="eyebrow">Scheduling</p><h2>Demo Booking Control Panel</h2><p>15-minute access · 15-minute cooldown · <span>{timezone}</span></p></div><div className="booking-summary" aria-label="Schedule summary"><span><strong>{pendingCount}</strong>Pending</span><span><strong>{approvedCount}</strong>Approved</span><span><strong>{availableSlots.length}</strong>Available</span></div></div>
    {message && <div className="alert" role="status">{message}</div>}
    {!liveConnected && <div className="booking-live-status" role="status">Reconnecting to live schedule…</div>}

    <section className="booking-reservations" aria-labelledby="reservations-title">
      <div className="booking-panel-head"><div><p className="eyebrow">Reservations</p><h3 id="reservations-title">{bookingView === "upcoming" ? "Upcoming reservations" : "Reservation history"}</h3></div><div className="booking-view-tabs" role="tablist" aria-label="Reservation view"><button type="button" role="tab" aria-selected={bookingView === "upcoming"} className={bookingView === "upcoming" ? "active" : ""} onClick={() => setBookingView("upcoming")}>Upcoming <span>{upcoming.length}</span></button><button type="button" role="tab" aria-selected={bookingView === "history"} className={bookingView === "history" ? "active" : ""} onClick={() => setBookingView("history")}>History <span>{history.length}</span></button></div></div>
      <BookingList items={bookingView === "upcoming" ? upcoming : history} format={format} history={bookingView === "history"}/>
    </section>

    <section className="booking-availability" aria-labelledby="available-times-title">
      <div className="booking-panel-head"><div><p className="eyebrow">Availability</p><h3 id="available-times-title">Available times</h3><p>Times visitors can currently request.</p></div><button className="booking-primary booking-add-availability" type="button" onClick={openEditor}>Add availability</button></div>
      {editorOpen && <form className="booking-window-form" action="/admin/bookings/form" method="post">
        <input type="hidden" name="operation" value="upsert"/><input type="hidden" name="payload" value={payload}/>
        <div className="booking-editor-heading"><strong>{editor.id ? "Edit availability" : "Add availability"}</strong><span>Times display in {timezone}</span></div>
        <label>Starts<input type="datetime-local" required value={editor.start} onChange={event => setEditor(value => ({ ...value, start: event.target.value }))}/></label>
        <label>Ends<input type="datetime-local" required value={editor.end} onChange={event => setEditor(value => ({ ...value, end: event.target.value }))}/></label>
        <label>Repeats<select value={editor.recurrence} onChange={event => setRecurrence(event.target.value as RecurrenceMode, editor, setEditor)}><option value="none">Does not repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="custom">Specific days</option></select></label>
        {editor.recurrence !== "none" && <><label>Repeat until<input type="date" required value={editor.until} onChange={event => setEditor(value => ({ ...value, until: event.target.value }))}/></label>{editor.recurrence === "custom" && <fieldset className="booking-weekdays"><legend>Recurring days</legend>{dayNames.map((day,index)=><label key={day}><input type="checkbox" checked={editor.days.includes(index)} onChange={()=>setEditor(value=>({...value,days:value.days.includes(index)?value.days.filter(item=>item!==index):[...value.days,index].sort()}))}/><span>{day}</span></label>)}</fieldset>}</>}
        <div className="booking-form-actions"><button className="booking-primary">{editor.id ? "Save changes" : "Add availability"}</button><button type="button" onClick={closeEditor}>Cancel</button></div>
      </form>}
      <div className="booking-slot-grid booking-available-grid">{availableSlots.map(slot=><article key={slot.start} className="booking-slot available"><time>{format(slot.start)}</time><strong>Available</strong><SlotAction operation="block-slot" start={slot.start} label="Block slot"/></article>)}{!availableSlots.length && <div className="booking-empty-schedule"><strong>No upcoming times available</strong><span>Add availability to publish times visitors can request.</span></div>}</div>
      {availableSlots.length > 8 && <div className="booking-availability-footer"><button className="booking-primary" type="button" onClick={openEditor}>Add availability</button></div>}
    </section>

    <details className="booking-rules" open data-admin-details="availability-rules">
      <summary><span><span className="eyebrow">Configuration</span><strong>Availability rules</strong><small>{(data?.availability ?? []).length} rules · {blockedSlots.length} blocked times</small></span><b aria-hidden="true">+</b></summary>
      <div className="booking-timeline" data-admin-scroll="schedule-timeline">{(data?.schedule ?? []).filter(item=>item.kind==="availability").map(item=>{const source=windows.get(item.sourceId);if(!source)return null;return <article key={item.id} className="booking-schedule-item"><time><strong>{format(item.start)}</strong><span>to {format(item.end)}</span></time><div><strong>Available window</strong><small>{item.recurring?recurrenceLabel(source):"One time"}</small></div><div className="booking-schedule-actions"><button type="button" onClick={()=>edit(source)}>Edit</button><form action="/admin/bookings/form" method="post" onSubmit={event=>{const affected=(data?.schedule??[]).filter(value=>value.kind==="availability"&&value.sourceId===source.id).reduce((total,value)=>total+Math.floor((Date.parse(value.end)-Date.parse(value.start))/(15*60_000)),0);if(!window.confirm(`Delete the entire ${format(source.start)} to ${format(source.end)} availability window${source.recurrence?" series":""}? Approximately ${affected} displayed slots will disappear.`))event.preventDefault();}}><input type="hidden" name="operation" value="delete"/><input type="hidden" name="id" value={source.id}/><button>Delete entire window</button></form></div></article>})}</div>
      {blockedSlots.length > 0 && <div className="booking-blocked-times"><h4>Blocked times</h4><div className="booking-slot-grid">{blockedSlots.map(slot=><article key={slot.start} className="booking-slot blocked"><time>{format(slot.start)}</time><strong>Blocked</strong>{slot.blackoutId && <SlotAction operation="unblock-slot" id={slot.blackoutId} label="Unblock slot"/>}</article>)}</div></div>}
    </details>
  </section>;
}

function BookingList({ items, format, history }: { items: DemoBooking[]; format: (value: string) => string; history: boolean }) {
  if (!items.length) return <div className="booking-empty-schedule"><strong>{history ? "No reservation history" : "No upcoming reservations"}</strong><span>{history ? "Completed and closed requests will appear here." : "New pending and approved requests will appear here."}</span></div>;
  return <div className={`booking-reservation-list ${history ? "history" : ""}`}>{items.map(item => {
    const messages = item.messages ?? [], unread = messages.filter(value => value.direction === "inbound" && !value.readAt).length;
    const actions = item.status === "pending" ? ["approve", "deny"] : item.status === "approved" && !item.launchedAt && !item.stoppedAt ? ["launch", "deny"] : item.status === "approved" && item.launchedAt && !item.stoppedAt ? ["stop"] : [];
    return <article className={`booking-reservation ${item.status}`} key={item.id}><div className="booking-reservation-time"><time>{format(item.start)}</time><span>to {format(item.end)}</span></div><div className="booking-reservation-person"><strong>{item.name || "Name unavailable"}</strong><span>{item.email}</span><small>{item.timezone}</small></div><div className="booking-reservation-app"><strong>{item.workloadName}</strong><span>{item.workloadId}</span></div><div className="booking-reservation-state"><span className={`booking-status ${item.status}`}>{item.status}</span>{item.launchedAt && !item.stoppedAt && <small>Running now</small>}{item.stoppedAt && <small>Stopped {format(item.stoppedAt)}</small>}{item.approvalEmailError && <small className="booking-error">{item.approvalEmailError}</small>}{item.lifecycleError && <small className="booking-error">{item.lifecycleError}</small>}</div><div className="booking-reservation-controls"><div className="booking-row-actions">{actions.map(action=><BookingAction key={action} id={item.id} action={action}/>)}</div><details className="booking-messages" data-admin-details={item.id}><summary>Messages ({messages.length}){unread ? ` · ${unread} unread` : ""}</summary>{messages.length ? messages.map(value=><article key={value.id} className={`booking-message ${value.direction}`}><header><strong>{value.direction === "inbound" ? "Visitor reply" : "Welcome email"}</strong><time>{format(value.createdAt)}</time></header><small>{value.subject}</small><p data-admin-scroll={`message-${value.id}`}>{value.text}</p></article>) : <p>No messages yet.</p>}{unread > 0 && <BookingAction id={item.id} action="mark-read" label="Mark read"/>}</details><div className="booking-row-actions booking-secondary-actions">{item.status === "approved" && <BookingAction id={item.id} action="resend-welcome" label="Resend welcome"/>}<BookingAction id={item.id} action="delete" label="Delete" confirm={`Permanently delete ${item.name}’s booking and all messages?`}/></div></div></article>;
  })}</div>;
}
type AdminScrollSnapshot = { windowY: number; panels: Record<string, number>; openDetails: string[] };
function saveAdminScrollSnapshot() {
  const panels: Record<string, number> = {};
  document.querySelectorAll<HTMLElement>("[data-admin-scroll]").forEach(item => { const key = item.dataset.adminScroll; if (key) panels[key] = item.scrollTop; });
  const openDetails = [...document.querySelectorAll<HTMLDetailsElement>("[data-admin-details][open]")].map(item => item.dataset.adminDetails).filter((value): value is string => Boolean(value));
  const snapshot: AdminScrollSnapshot = { windowY: window.scrollY, panels, openDetails };
  window.history.scrollRestoration = "manual";
  window.sessionStorage.setItem(ADMIN_SCROLL_KEY, JSON.stringify(snapshot));
}
function SlotAction({ operation, label, start, id }: { operation: "block-slot" | "unblock-slot"; label: string; start?: string; id?: string }) {
  return <form action="/admin/bookings/form" method="post"><input type="hidden" name="operation" value={operation}/>{start && <input type="hidden" name="start" value={start}/>} {id && <input type="hidden" name="id" value={id}/>}<button>{label}</button></form>;
}

function BookingAction({ id, action, label, confirm }: { id: string; action: string; label?: string; confirm?: string }) {
  return <form action="/admin/bookings/form" method="post" onSubmit={event => { if (confirm && !window.confirm(confirm)) event.preventDefault(); }}><input type="hidden" name="operation" value="booking-action"/><input type="hidden" name="id" value={id}/><input type="hidden" name="action" value={action}/><button>{label ?? action}</button></form>;
}
function editorPayload(editor: Editor, timeZone: string) { const start=Date.parse(editor.start),end=Date.parse(editor.end); if(!Number.isFinite(start)||!Number.isFinite(end))return "{}"; const recurrence=recurrenceRule(editor,timeZone); return JSON.stringify({id:editor.id,start:new Date(start).toISOString(),end:new Date(end).toISOString(),recurrence}); }
function setRecurrence(mode:RecurrenceMode,editor:Editor,setEditor:React.Dispatch<React.SetStateAction<Editor>>){const day=editor.start?new Date(editor.start).getDay():new Date().getDay();setEditor(value=>({...value,recurrence:mode,days:mode==="daily"?[0,1,2,3,4,5,6]:mode==="weekly"?[day]:mode==="custom"?value.days:[]}));}
function recurrenceRule(editor:Editor,timeZone:string):RecurrenceRule|undefined{if(editor.recurrence==="none")return;const days=editor.recurrence==="daily"?[0,1,2,3,4,5,6]:editor.recurrence==="weekly"?[new Date(editor.start).getDay()]:editor.days;if(!editor.until||!days.length)return;return{frequency:editor.recurrence==="daily"?"daily":"weekly",daysOfWeek:days,until:new Date(`${editor.until}T23:59:59`).toISOString(),timeZone};}
function recurrenceMode(item:AvailabilityWindow):RecurrenceMode{if(!item.recurrence)return"none";if(item.recurrence.frequency==="daily")return"daily";return item.recurrence.daysOfWeek.length===1?"weekly":"custom";}
function recurrenceLabel(item:AvailabilityWindow){if(!item.recurrence)return"One time";const days=item.recurrence.frequency==="daily"?"Daily":item.recurrence.daysOfWeek.map(day=>dayNames[day]).join(", ");return`${days} through ${new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(new Date(item.recurrence.until))}`;}
function toLocalInput(value:string){const date=new Date(value),offset=date.getTimezoneOffset()*60_000;return new Date(date.getTime()-offset).toISOString().slice(0,16);}
function toLocalDate(value:string){return toLocalInput(value).slice(0,10);}
