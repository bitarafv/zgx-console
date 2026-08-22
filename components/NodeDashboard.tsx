"use client";

import { useCallback, useEffect, useState } from "react";
import type { Capability, Resources, Workload } from "@/lib/types";

export function NodeDashboard() {
  const [resources, setResources] = useState<Resources | null>(null);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [capability, setCapability] = useState<Capability>({ mode: "mock", role: "guest" });
  const [error, setError] = useState("");
  const load = useCallback(async () => { try { const [r, w, c] = await Promise.all([fetch("/api/resources", { cache: "no-store" }), fetch("/api/workloads", { cache: "no-store" }), fetch("/api/capability", { cache: "no-store" })]); if (!r.ok || !w.ok || !c.ok) throw new Error(); setResources(await r.json()); setWorkloads(await w.json()); setCapability(await c.json()); setError(""); } catch { setError("The ZGX Node is unavailable. Telemetry will retry automatically."); } }, []);
  useEffect(() => { const initial = window.setTimeout(load, 0); const id = window.setInterval(load, 2500); return () => { clearTimeout(initial); clearInterval(id); }; }, [load]);
  async function act(path: string, body: object) { const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (!response.ok) setError((await response.json()).error ?? "Action failed"); else void load(); }
  const admin = capability.role === "admin";
  return <><div className="hero compact"><div><p className="eyebrow">PHYSICAL DEVICE</p><h1>ZGX Node</h1><p>Live utilization and workload ownership from the Siva runtime on your ZGX Nano.</p></div><span className={`role ${admin ? "admin" : "guest"}`}>{admin ? "Admin mode" : "Guest · view only"}</span></div>
    {error && <div className="alert">{error}</div>}
    <div className="metrics">{resources ? <><Metric label="Memory bandwidth" current={resources.memory_bandwidth.current_gbps} max={resources.memory_bandwidth.maximum_gbps} unit="GB/s" /><Metric label="Tensor active" current={resources.tensor_core.active_percent} max={100} unit="%" /><Metric label="Inference" current={resources.inference_speed.tokens_per_second} max={Math.max(resources.inference_speed.tokens_per_second, 1)} unit="t/s" /><Metric label="SoC power" current={resources.soc_power.current_watts} max={resources.soc_power.limit_watts} unit="W" /></> : <p className="muted">Connecting to telemetry…</p>}</div>
    <div className="section-head"><div><p className="eyebrow">APPLICATION CONTROL</p><h2>Installed workloads</h2></div><p>{admin ? "You can operate this node." : "Sign in through Cloudflare Access to operate this node."}</p></div>
    <div className="workloads">{workloads.map((item) => <article key={item.id}><div><span className={item.active ? "dot active" : "dot"} /><h3>{item.name}</h3><p>{item.description}</p><div className="chips">{[...item.model_names, ...item.intelligence_services].map((x) => <span key={x}>{x.split("@")[0]}</span>)}</div></div><button disabled={!admin} title={!admin ? "Admin access required" : undefined} onClick={() => item.active ? act(`/api/workloads/${item.id}/stop`, {}) : act("/api/transitions", { target_workload: item.id })}>{item.active ? "Stop" : "Launch / switch"}</button></article>)}</div>
  </>;
}

function Metric({ label, current, max, unit }: { label: string; current: number; max: number; unit: string }) {
  const pct = Math.min(100, Math.round(current / max * 100));
  return <article className="metric"><div><span>{label}</span><strong>{current.toFixed(current % 1 ? 1 : 0)} {unit}</strong></div><div className="meter"><i style={{ width: `${pct}%` }} /></div><small>{pct}% of measured maximum</small></article>;
}

