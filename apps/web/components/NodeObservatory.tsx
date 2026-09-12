"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { applicationUrl, DEFAULT_OPTIONS, finite, formatValue, freshness, readings, type Options, type Reading } from "../lib/observatory";
import { useDashboardOptions } from "./useDashboardOptions";
import { useNodeTelemetry } from "./useNodeTelemetry";
import { TelemetryChart } from "./TelemetryChart";
import { SivaAdminFrame } from "./SivaAdminFrame";
import styles from "./NodeObservatory.module.css";

type Feed = ReturnType<typeof useNodeTelemetry>;
function clock(at: number) { return at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"; }
function MetricCard({ metric }: { metric: Reading }) {
  const percent = metric.value !== null && metric.maximum !== null && metric.maximum > 0 ? Math.min(100, metric.value / metric.maximum * 100) : null;
  return <article className={styles.metricCard} title={metric.note}>
    <span>{metric.label}</span>
    <div><strong className={metric.value === null ? styles.unavailable : undefined}>{formatValue(metric.value)}</strong><small>{metric.value === null ? "" : metric.unit}</small></div>
    <div className={styles.meter} aria-hidden="true"><i style={{ width: `${percent ?? 0}%` }}/></div>
    <small>{metric.maximum !== null ? `${metric.reference}: ${formatValue(metric.maximum)} ${metric.unit}` : "Runtime-reported · no reference reported"}</small>
  </article>;
}

export function NodeObservatory({ adminView = false, monitorOnly = false, onClassic }: {
  adminView?: boolean; monitorOnly?: boolean; onClassic: () => void;
}) {
  const feed = useNodeTelemetry(adminView && !monitorOnly);
  const { options, update } = useDashboardOptions();
  const [paused, setPaused] = useState<Feed | null>(null);
  const [focus, setFocus] = useState(false);
  const [runtimeAdminOpen, setRuntimeAdminOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const actionLock = useRef(false);
  const focusButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const tab = monitorOnly ? "telemetry" : options.tab;
  const isPaused = paused !== null && paused.sessionId === feed.sessionId && feed.capability?.state !== "static";
  const display = isPaused && tab === "telemetry" ? paused : feed;
  const status = freshness(feed.capability, feed.resources, feed.receivedAt, feed.failed, feed.now);
  const current = readings(display.resources);
  const power = current.find(metric => metric.id === "power")!;
  const selected = display.workloads.find(item => item.id === options.workload);
  const active = display.workloads.filter(item => item.active);
  const canControl = !monitorOnly && adminView && !isPaused && !feed.failed && (status === "Live" || status === "Demo data") && feed.capability?.role === "admin" && feed.capability?.state === "live-admin";
  const sourceAt = display.resources ? Date.parse(display.resources.sampled_at) : NaN;
  const age = Number.isFinite(sourceAt) ? Math.max(0, Math.floor((display.now - sourceAt) / 1000)) : null;
  const offline = feed.capability?.state === "static";
  const monitorParams = new URLSearchParams({ dashboard: "observatory", workload: options.workload });
  function exitFocus() { setFocus(false); focusButton.current?.focus(); }
  function focusKeys(event: KeyboardEvent<HTMLElement>) {
    if (!focus) return;
    if (event.key === "Escape") { event.preventDefault(); exitFocus(); }
    if (event.key === "Tab") {
      const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, summary, [tabindex="0"]')).filter(element => element.offsetParent !== null);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }
  function tabKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "telemetry" : event.key === "End" ? "applications" : tab === "telemetry" ? "applications" : "telemetry";
    update({ tab: next });
    document.getElementById(`${id}-${next}-tab`)?.focus();
  }
  async function act(workloadId: string, stop = false) {
    if (!canControl || actionLock.current) return;
    actionLock.current = true;
    setPending(workloadId); setActionError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(stop ? `/api/workloads/${encodeURIComponent(workloadId)}/stop` : "/api/transitions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(stop ? {} : { target_workload: workloadId }), signal: controller.signal,
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(typeof result?.error === "string" ? result.error : `Action failed (${response.status}).`);
      }
    } catch (error) {
      setActionError(error instanceof Error && error.name !== "AbortError" ? error.message : "No confirmation received. The operation may still be running; check live status before retrying.");
    } finally { clearTimeout(timeout); actionLock.current = false; setPending(null); }
  }
  return <section className={`${styles.root} ${options.graphite ? styles.graphite : ""} ${focus ? styles.focus : ""} ${monitorOnly ? styles.monitor : ""}`}
    role={focus ? "dialog" : undefined} aria-modal={focus || undefined} aria-label="ZGX node observation panel" onKeyDown={focusKeys}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>ZGX NODE / OBSERVATORY</p><h1>{monitorOnly ? "Live Telemetry" : "Live node observation"}</h1></div>
      <div className={styles.statusGroup} aria-live="polite" aria-atomic="true">
        <span className={styles.status} data-status={status}>{status}</span>
        {isPaused && <span className={styles.status} data-status="Paused">Display paused</span>}
      </div>
    </header>
    <div className={styles.toolbar}>
      <span className={styles.muted}>{monitorOnly ? "Read-only monitor" : canControl ? "Authorized controls" : "View only"} · 1-second polling</span>
      <div className={styles.actions}>
        <button onClick={() => setPaused(isPaused ? null : feed)} disabled={!feed.resources || offline}>{isPaused ? "Resume live" : "Pause display"}</button>
        {!monitorOnly && <Link href={`/monitor?${monitorParams}`} target="_blank" rel="noopener noreferrer" prefetch={false}>Open monitor window ↗</Link>}
        {monitorOnly && <Link href="/?dashboard=observatory#node">Back to console</Link>}
        <button ref={focusButton} onClick={() => focus ? exitFocus() : setFocus(true)} aria-pressed={focus}>{focus ? "Exit focus · Esc" : "Focus mode"}</button>
        <button onClick={onClassic}>Classic view</button>
      </div>
    </div>
    {feed.capability?.mode === "mock" && <p className={styles.notice}>DEMONSTRATION DATA — these readings are not live hardware measurements.</p>}
    {["Stale", "Disconnected"].includes(status) && <p className={styles.notice} role="status">{status === "Stale" ? "Showing last-known readings. Source data is stale, its clock is out of sync, or the connection is recovering." : "Telemetry disconnected. Last-known readings are retained; controls are disabled."}</p>}
    {isPaused && <p className={styles.notice}>Snapshot held at {clock(paused.now)}. Collection continues while this window is visible; inference is not paused.</p>}
    {!monitorOnly && <div className={styles.subtabs} role="tablist" aria-label="Dashboard views">
      {(["telemetry", "applications"] as const).map(value => <button key={value} role="tab" id={`${id}-${value}-tab`} aria-selected={tab === value} aria-controls={`${id}-${value}-panel`} tabIndex={tab === value ? 0 : -1} onKeyDown={tabKeys} onClick={() => update({ tab: value })}>
        {value === "telemetry" ? "Live Telemetry" : "Installed Applications"}{value === "applications" && <span>{feed.receivedAt === null ? "—" : feed.workloads.length}</span>}
      </button>)}
    </div>}
    {offline ? <div className={styles.empty}><h2>Live node telemetry is not currently shared</h2><p>The metrics would appear when the Admin runs the apps on their ZGX Nano.</p><p>Simulation Dashboard, Enterprise AI Insights, and the TCO Calculator remain available.</p></div> : <>
      <div className={styles.context}>
        <label>Observation context<select value={options.workload} onChange={event => update({ workload: event.target.value })}>
          <option value="">Whole node</option>
          {options.workload && !selected && <option value={options.workload}>Pinned application unavailable</option>}
          {display.workloads.map(item => <option value={item.id} key={item.id}>{item.name}{item.active ? " · active" : " · inactive"}</option>)}
        </select></label>
        <div className={styles.contextText}><strong>{selected ? selected.name : display.receivedAt === null ? "Awaiting workload status" : active.length ? `${active.length} active workload${active.length === 1 ? "" : "s"}` : "No active workload reported"}</strong>
          <span>{selected ? selected.model_names.join(" · ") || "Model identity not reported" : active.flatMap(item => item.model_names).join(" · ") || "Awaiting runtime status"}</span>
          <small>Context is pinned; measurements remain runtime/device aggregates.</small>
        </div>
        <div className={styles.timestamp}><strong>{Number.isFinite(sourceAt) ? clock(sourceAt) : "No source timestamp"}</strong><small>{age === null ? "Awaiting sample" : `${age}s old${isPaused ? " at pause" : ""}`} · source time</small></div>
      </div>
      <section id={`${id}-telemetry-panel`} role={monitorOnly ? undefined : "tabpanel"} aria-labelledby={monitorOnly ? undefined : `${id}-telemetry-tab`} hidden={tab !== "telemetry"} tabIndex={0}>
        <div className={`${styles.readouts} ${options.largeReadouts ? "" : styles.smallReadouts}`}>{current.filter(metric => metric.id !== "power").map(metric => <MetricCard key={metric.id} metric={metric}/>)}</div>
        <div className={styles.chartToolbar}><span>Device activity · source-timestamped history</span><label>Time window<select value={options.windowMs} onChange={event => update({ windowMs: Number(event.target.value) })}>{[2, 5, 10].map(minutes => <option key={minutes} value={minutes * 60_000}>Last {minutes} minutes</option>)}</select></label></div>
        {options.charts && <div className={styles.charts}>
          <TelemetryChart metric={current[0]} history={display.history} end={display.now} windowMs={options.windowMs} observations={options.activity ? display.observations : []}/>
          <div className={styles.resourceTracks}>{current.filter(metric => metric.id !== "speed").map(metric => <TelemetryChart key={metric.id} metric={metric} history={display.history} end={display.now} windowMs={options.windowMs} compact/>)}</div>
        </div>}
        <div className={styles.healthStrip}><span><b>SoC power</b> {formatValue(power.value)} {power.value === null ? "" : "W"}</span><span>Reported limit {formatValue(power.maximum)} W</span><span>{display.receivedAt === null ? "Workload status unavailable" : `${active.length} active workload${active.length === 1 ? "" : "s"}`}</span><span>App readiness is not reported</span></div>
        {power.value !== null && power.maximum !== null && power.maximum > 0 && power.value > power.maximum && status === "Live" && !isPaused && <p className={styles.notice} role="status">Measured SoC power is above the runtime-reported power limit. Check the device and measurement source.</p>}
        <details className={styles.details}>
          <summary>All existing metrics, sources &amp; measurement coverage</summary>
          <div className={styles.tableScroll}><table><caption>Original dashboard measurements. Missing values are never presented as zero.</caption><thead><tr><th>Measurement</th><th>Current</th><th>Reference</th><th>Average / peak</th><th>Source</th></tr></thead><tbody>{current.map(metric => <tr key={metric.id}><th scope="row">{metric.label}<small>{metric.note}</small></th><td>{formatValue(metric.value)} {metric.value === null ? "" : metric.unit}</td><td>{formatValue(metric.maximum)} {metric.maximum === null ? "" : metric.unit}<small>{metric.reference}</small></td><td>{formatValue(metric.average)} / {formatValue(metric.peak)}<small>Runtime-reported; window unspecified</small></td><td>{metric.source}<small>{metric.value === null ? "Unavailable" : "Reported"}</small></td></tr>)}</tbody></table></div>
          <p className={styles.muted}>Not instrumented in the current contract: first-token latency, request queue, temperature, request-level stages, per-application attribution, and model readiness. No synthetic readings are substituted.</p>
          <details><summary>Raw reported resource snapshot</summary><pre>{JSON.stringify(display.resources, null, 2)}</pre></details>
        </details>
        {options.activity && <details className={styles.details}><summary>Observed activity <span>{display.observations.length}</span></summary><p className={styles.muted}>Runtime workload-state observations, not inferred request stages. Vertical chart marks refer to these observations.</p>{display.observations.length ? <ol className={styles.activity}>{[...display.observations].reverse().map(event => <li key={event.id}><time>{clock(event.at)}</time><span>{event.text}</span></li>)}</ol> : <p className={styles.muted}>No state changes recorded in this browser session.</p>}</details>}
      </section>
      {!monitorOnly && <section id={`${id}-applications-panel`} role="tabpanel" aria-labelledby={`${id}-applications-tab`} hidden={tab !== "applications"} tabIndex={0}>
        <div className={styles.appsHeading}><h2>Installed Applications</h2><p>Launch an application here. Observe it in Live Telemetry.</p></div>
        {actionError && <p className={styles.notice} role="alert">{actionError}</p>}
        {!feed.workloads.length && <p className={styles.empty}>{feed.receivedAt === null ? "Awaiting installed applications…" : "No installed applications reported by the runtime."}</p>}
        <div className={styles.appGrid}>{feed.workloads.map(item => {
          const url = typeof window === "undefined" ? null : applicationUrl(item, window.location.origin);
          const waiting = pending === item.id;
          const seconds = finite(item.expected_cold_load_seconds);
          return <article key={item.id} className={styles.appCard}>
            <div className={styles.appTitle}><h3>{item.name}</h3><span>{waiting ? "Requesting…" : item.active ? "Reported active" : "Inactive"}</span></div>
            <p>{item.description}</p>
            <div className={styles.chips}>{[...new Set([...item.model_names, ...item.intelligence_services])].map(name => <span key={name} title={name}>{name}</span>)}</div>
            <small className={styles.muted}>{item.active ? "Application active; model readiness not reported." : seconds ? `Runtime-estimated cold load: ${seconds}s. Readiness is not reported.` : "Readiness is not reported by this runtime."}</small>
            <div className={styles.appActions}>
              {item.active && url ? <a className={styles.primary} href={url} target="_blank" rel="noopener noreferrer">Open application ↗</a> : !item.active ? <button className={styles.primary} disabled={!canControl || pending !== null} onClick={() => void act(item.id)}>{waiting ? "Requesting…" : "Start application"}</button> : <span className={styles.muted}>Application URL unavailable</span>}
              <button onClick={() => update({ workload: item.id, tab: "telemetry" })}>View telemetry</button>
            </div>
            <details className={styles.appControls}><summary>Runtime controls</summary><p className={styles.muted}>Controls require live admin authorization. Starting may switch the node away from another workload.</p>{item.active && <button disabled={!canControl || pending !== null} onClick={() => void act(item.id, true)}>Stop application</button>}</details>
          </article>;
        })}</div>
      </section>}
    </>}
    <details className={styles.details}><summary>View options &amp; reversible features</summary><div className={styles.options}>{([
      ["largeReadouts", "Large metric readouts"], ["charts", "Live history charts"], ["activity", "Observed activity & chart markers"], ["graphite", "Graphite monitor surface"],
    ] as [keyof Pick<Options, "largeReadouts" | "charts" | "activity" | "graphite">, string][]).map(([key, label]) => <label key={key}><input type="checkbox" checked={options[key]} onChange={event => update({ [key]: event.target.checked })}/>{label}</label>)}</div><div className={styles.actions}><button onClick={() => update({ ...DEFAULT_OPTIONS })}>Restore redesigned defaults</button><button onClick={onClassic}>Restore Classic view</button></div><p className={styles.muted}>Presentation only. These switches do not stop applications or change telemetry collection.</p></details>
    {adminView && !monitorOnly && <details className={styles.details} onToggle={event => setRuntimeAdminOpen(event.currentTarget.open)}><summary>Original runtime administration — unchanged</summary>{runtimeAdminOpen && <SivaAdminFrame/>}</details>}
    <footer className={styles.footer}>Existing Siva telemetry · no additional analytics service · up to 10 minutes of in-window history</footer>
  </section>;
}
